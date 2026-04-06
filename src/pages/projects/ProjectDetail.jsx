import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Typography, Grid, Card, CardContent, Stack, Chip, Button, Tab, Tabs,
  LinearProgress, CircularProgress, Avatar, Divider, IconButton,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import axiosInstance from '../../utils/axios';
import { fetchTasks } from '../../redux/slices/taskSlice';
import { fetchProjects } from '../../redux/slices/projectSlice';

const STATUS_CONFIG = {
  active: { label: 'Actif', color: 'success' },
  on_hold: { label: 'En pause', color: 'warning' },
  completed: { label: 'Terminé', color: 'info' },
  cancelled: { label: 'Annulé', color: 'error' },
};

const TASK_STATUS = {
  todo: { label: 'À faire', color: 'default' },
  in_progress: { label: 'En cours', color: 'info' },
  review: { label: 'Révision', color: 'warning' },
  done: { label: 'Terminé', color: 'success' },
};

function TabPanel({ children, value, index }) {
  return value === index ? <Box sx={{ py: 3 }}>{children}</Box> : null;
}

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { list: allTasks } = useSelector((s) => s.task);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await axiosInstance.get(`/api/projects/${id}`);
        setProject(data.project || data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
    dispatch(fetchTasks({}));
  }, [id, dispatch]);

  const projectTasks = allTasks.filter((t) => t.project_id === id || t.projectId === id);
  const doneTasks = projectTasks.filter((t) => t.status === 'done').length;
  const progress = projectTasks.length > 0 ? Math.round((doneTasks / projectTasks.length) * 100) : project?.progress || 0;

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', pt: 10 }}><CircularProgress /></Box>;
  }

  if (!project) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography>Projet introuvable</Typography>
        <Button onClick={() => navigate('/dashboard/projects/list')} sx={{ mt: 2 }}>Retour aux projets</Button>
      </Box>
    );
  }

  const cfg = STATUS_CONFIG[project.status] || { label: project.status || 'actif', color: 'default' };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
        <IconButton size="small" onClick={() => navigate('/dashboard/projects/list')}>
          <Icon icon="eva:arrow-back-fill" />
        </IconButton>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>Projets</Typography>
      </Stack>

      <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ md: 'center' }} justifyContent="space-between" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>{project.name}</Typography>
          {project.description && (
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>{project.description}</Typography>
          )}
        </Box>
        <Stack direction="row" spacing={1} sx={{ mt: { xs: 2, md: 0 } }}>
          <Chip label={cfg.label} color={cfg.color} />
          <Button variant="contained" startIcon={<Icon icon="eva:edit-fill" />} sx={{ borderRadius: 1.5, fontWeight: 700 }}>
            Modifier
          </Button>
        </Stack>
      </Stack>

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Tâches totales', value: projectTasks.length, icon: 'eva:checkmark-square-2-fill', color: 'primary' },
          { label: 'Terminées', value: doneTasks, icon: 'eva:done-all-fill', color: 'success' },
          { label: 'En cours', value: projectTasks.filter((t) => t.status === 'in_progress').length, icon: 'eva:loader-fill', color: 'info' },
          { label: 'Budget', value: project.budget ? `${Number(project.budget).toLocaleString('fr-FR')} XOF` : '—', icon: 'eva:credit-card-fill', color: 'warning' },
        ].map((s) => (
          <Grid key={s.label} size={{ xs: 6, md: 3 }}>
            <Card elevation={0} sx={{ border: (t) => `1px solid ${alpha(t.palette.divider, 0.5)}`, borderRadius: 2 }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: (t) => alpha(t.palette[s.color].main, 0.12), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon icon={s.icon} width={20} />
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1 }}>{s.value}</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>{s.label}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Progress Bar */}
      <Card elevation={0} sx={{ border: (t) => `1px solid ${alpha(t.palette.divider, 0.5)}`, borderRadius: 2, mb: 3 }}>
        <CardContent>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Progression globale</Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main' }}>{progress}%</Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{ height: 10, borderRadius: 5, bgcolor: (t) => alpha(t.palette.primary.main, 0.12) }}
          />
          <Typography variant="caption" sx={{ color: 'text.secondary', mt: 1, display: 'block' }}>
            {doneTasks} / {projectTasks.length} tâches terminées
          </Typography>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 1, borderBottom: (t) => `1px solid ${alpha(t.palette.divider, 0.4)}` }}>
        <Tab label="Tâches" />
        <Tab label="Membres" />
        <Tab label="Détails" />
      </Tabs>

      <TabPanel value={tab} index={0}>
        {projectTasks.length === 0 ? (
          <Typography sx={{ color: 'text.secondary', textAlign: 'center', py: 4 }}>Aucune tâche pour ce projet</Typography>
        ) : (
          <Stack spacing={1.5}>
            {projectTasks.map((task) => {
              const tc = TASK_STATUS[task.status] || { label: task.status, color: 'default' };
              return (
                <Card key={task._id} elevation={0} sx={{ border: (t) => `1px solid ${alpha(t.palette.divider, 0.4)}`, borderRadius: 1.5 }}>
                  <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Typography variant="body2" sx={{ flexGrow: 1, fontWeight: 500 }} noWrap>{task.title}</Typography>
                      <Chip label={tc.label} size="small" color={tc.color} sx={{ height: 20, fontSize: 10 }} />
                    </Stack>
                  </CardContent>
                </Card>
              );
            })}
          </Stack>
        )}
      </TabPanel>

      <TabPanel value={tab} index={1}>
        {(project.members || []).length === 0 ? (
          <Typography sx={{ color: 'text.secondary', textAlign: 'center', py: 4 }}>Aucun membre</Typography>
        ) : (
          <Stack spacing={1.5}>
            {(project.members || []).map((m, i) => (
              <Stack key={i} direction="row" alignItems="center" spacing={1.5}>
                <Avatar sx={{ width: 36, height: 36 }}>{(m.name || m)?.[0]?.toUpperCase()}</Avatar>
                <Typography variant="body2">{m.name || m}</Typography>
              </Stack>
            ))}
          </Stack>
        )}
      </TabPanel>

      <TabPanel value={tab} index={2}>
        <Stack spacing={2}>
          {[
            { label: 'Créé le', value: project.createdAt ? new Date(project.createdAt).toLocaleDateString('fr-FR') : '—' },
            { label: 'Modifié le', value: project.updatedAt ? new Date(project.updatedAt).toLocaleDateString('fr-FR') : '—' },
            { label: 'Budget', value: project.budget ? `${Number(project.budget).toLocaleString('fr-FR')} XOF` : '—' },
          ].map((r) => (
            <Stack key={r.label} direction="row" spacing={2}>
              <Typography variant="body2" sx={{ color: 'text.secondary', width: 120 }}>{r.label}</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{r.value}</Typography>
            </Stack>
          ))}
        </Stack>
      </TabPanel>
    </motion.div>
  );
}
