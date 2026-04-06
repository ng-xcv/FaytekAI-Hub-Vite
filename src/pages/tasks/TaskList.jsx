import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Typography, Card, CardContent, Stack, Chip, Button,
  TextField, InputAdornment, MenuItem, Select, FormControl,
  IconButton, Collapse, Divider, CircularProgress, Dialog,
  DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { fetchTasks, createTask, updateTask, deleteTask } from '../../redux/slices/taskSlice';

const STATUS_CONFIG = {
  todo: { label: 'À faire', color: 'default' },
  in_progress: { label: 'En cours', color: 'info' },
  review: { label: 'En révision', color: 'warning' },
  done: { label: 'Terminé', color: 'success' },
  cancelled: { label: 'Annulée', color: 'error' },
};
const STATUS_ORDER = ['todo', 'in_progress', 'review', 'done'];

const PRIORITY_CONFIG = {
  1: { label: 'Critique', color: 'error' },
  2: { label: 'Haute', color: 'warning' },
  3: { label: 'Moyenne', color: 'info' },
  4: { label: 'Basse', color: 'default' },
};

function TaskFormDialog({ open, onClose, initialData, mode }) {
  const dispatch = useDispatch();
  const { register, handleSubmit, reset, control } = useForm({
    defaultValues: {
      title: '', description: '', priority: 3, status: 'todo',
      deadline: '', estimated_min: 30, tags: '',
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        title: initialData?.title || '',
        description: initialData?.description || '',
        priority: initialData?.priority || 3,
        status: initialData?.status || 'todo',
        deadline: initialData?.deadline ? initialData.deadline.split('T')[0] : '',
        estimated_min: initialData?.estimated_min || 30,
        tags: (initialData?.tags || []).join(', '),
      });
    }
  }, [open, initialData, reset]);

  const onSubmit = async (data) => {
    const payload = { ...data, tags: data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : [] };
    if (mode === 'edit' && initialData?._id) {
      await dispatch(updateTask({ id: initialData._id, payload }));
    } else {
      await dispatch(createTask(payload));
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {mode === 'edit' ? 'Modifier la tâche' : 'Nouvelle tâche'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField {...register('title')} label="Titre" fullWidth autoFocus required />
            <TextField {...register('description')} label="Description" fullWidth multiline rows={3} />
            <Stack direction="row" spacing={2}>
              <FormControl fullWidth>
                <Controller
                  name="priority"
                  control={control}
                  render={({ field }) => (
                    <Select {...field} displayEmpty>
                      {Object.entries(PRIORITY_CONFIG).map(([v, c]) => (
                        <MenuItem key={v} value={Number(v)}>{c.label}</MenuItem>
                      ))}
                    </Select>
                  )}
                />
              </FormControl>
              <FormControl fullWidth>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select {...field}>
                      {Object.entries(STATUS_CONFIG).map(([v, c]) => (
                        <MenuItem key={v} value={v}>{c.label}</MenuItem>
                      ))}
                    </Select>
                  )}
                />
              </FormControl>
            </Stack>
            <Stack direction="row" spacing={2}>
              <TextField {...register('deadline')} label="Échéance" type="date" fullWidth InputLabelProps={{ shrink: true }} />
              <TextField {...register('estimated_min')} label="Temps estimé (min)" type="number" fullWidth />
            </Stack>
            <TextField {...register('tags')} label="Tags (séparés par virgule)" fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={onClose} variant="outlined">Annuler</Button>
          <Button type="submit" variant="contained" sx={{ borderRadius: 1.5, fontWeight: 700 }}>
            {mode === 'edit' ? 'Enregistrer' : 'Créer'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

function TaskGroup({ status, tasks, onEdit, onDelete, onStatusChange }) {
  const [open, setOpen] = useState(true);
  const cfg = STATUS_CONFIG[status] || { label: status, color: 'default' };
  return (
    <Box>
      <Button
        size="small"
        startIcon={<Icon icon={open ? 'eva:chevron-down-fill' : 'eva:chevron-right-fill'} />}
        onClick={() => setOpen(!open)}
        sx={{ mb: 1, color: 'text.secondary', fontWeight: 600 }}
      >
        {cfg.label}
        <Chip label={tasks.length} size="small" sx={{ ml: 1, height: 18, fontSize: 10 }} />
      </Button>
      <Collapse in={open}>
        <Stack spacing={1}>
          {tasks.map((task) => (
            <Card
              key={task._id}
              elevation={0}
              sx={{
                border: (t) => `1px solid ${alpha(t.palette.divider, 0.4)}`,
                borderRadius: 1.5,
                '&:hover': { borderColor: 'primary.main', bgcolor: (t) => alpha(t.palette.primary.main, 0.03) },
              }}
            >
              <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Icon
                    icon={task.status === 'done' ? 'eva:checkmark-circle-2-fill' : 'eva:radio-button-off-fill'}
                    width={20}
                    style={{ cursor: 'pointer', flexShrink: 0 }}
                    onClick={() => onStatusChange(task, task.status === 'done' ? 'todo' : 'done')}
                  />
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 500,
                        textDecoration: task.status === 'done' ? 'line-through' : 'none',
                        color: task.status === 'done' ? 'text.disabled' : 'text.primary',
                      }}
                      noWrap
                    >
                      {task.title}
                    </Typography>
                    {task.description && (
                      <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap>
                        {task.description}
                      </Typography>
                    )}
                  </Box>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    {task.priority && (
                      <Chip
                        label={PRIORITY_CONFIG[task.priority]?.label || task.priority}
                        size="small"
                        color={PRIORITY_CONFIG[task.priority]?.color || 'default'}
                        sx={{ height: 20, fontSize: 10 }}
                      />
                    )}
                    {task.deadline && (
                      <Chip
                        icon={<Icon icon="eva:calendar-fill" width={12} />}
                        label={new Date(task.deadline).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                        size="small"
                        sx={{ height: 20, fontSize: 10 }}
                      />
                    )}
                    <IconButton size="small" onClick={() => onEdit(task)}>
                      <Icon icon="eva:edit-2-fill" width={16} />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => onDelete(task._id)}>
                      <Icon icon="eva:trash-2-fill" width={16} />
                    </IconButton>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </Collapse>
      <Divider sx={{ mt: 2, mb: 2 }} />
    </Box>
  );
}

export default function TaskList() {
  const dispatch = useDispatch();
  const { list: tasks, isLoading } = useSelector((s) => s.task);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);

  useEffect(() => {
    dispatch(fetchTasks({}));
  }, [dispatch]);

  const filtered = tasks.filter((t) => {
    const matchSearch = !search || t.title?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || t.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const grouped = STATUS_ORDER.reduce((acc, s) => {
    acc[s] = filtered.filter((t) => t.status === s);
    return acc;
  }, {});

  const handleEdit = (task) => { setEditTask(task); setDialogOpen(true); };
  const handleDelete = (id) => dispatch(deleteTask(id));
  const handleStatusChange = (task, newStatus) => dispatch(updateTask({ id: task._id, payload: { ...task, status: newStatus } }));

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>Liste des Tâches</Typography>
        <Button
          variant="contained"
          startIcon={<Icon icon="eva:plus-fill" />}
          onClick={() => { setEditTask(null); setDialogOpen(true); }}
          sx={{ borderRadius: 1.5, fontWeight: 700 }}
        >
          Nouvelle tâche
        </Button>
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <TextField
          size="small"
          placeholder="Rechercher une tâche..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Icon icon="eva:search-fill" width={18} />
              </InputAdornment>
            ),
          }}
          sx={{ flexGrow: 1 }}
        />
        <Select size="small" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} sx={{ minWidth: 150 }}>
          <MenuItem value="all">Tous les statuts</MenuItem>
          {Object.entries(STATUS_CONFIG).map(([v, c]) => (
            <MenuItem key={v} value={v}>{c.label}</MenuItem>
          ))}
        </Select>
      </Stack>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : filtered.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Icon icon="eva:inbox-outline" width={48} style={{ opacity: 0.3 }} />
          <Typography sx={{ color: 'text.secondary', mt: 2 }}>Aucune tâche trouvée</Typography>
        </Box>
      ) : (
        <Box>
          {STATUS_ORDER.map((status) =>
            grouped[status].length > 0 ? (
              <TaskGroup
                key={status}
                status={status}
                tasks={grouped[status]}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
              />
            ) : null
          )}
        </Box>
      )}

      <TaskFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        initialData={editTask}
        mode={editTask ? 'edit' : 'create'}
      />
    </motion.div>
  );
}
