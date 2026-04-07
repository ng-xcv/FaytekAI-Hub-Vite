import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Typography, Card, CardContent, Stack, Chip, Button, CircularProgress, IconButton } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { fetchTasks, updateTask, createTask } from '../../redux/slices/taskSlice';

const COLUMNS = [
  { id: 'todo', title: 'À faire', color: 'text.secondary' },
  { id: 'in_progress', title: 'En cours', color: 'info.main' },
  { id: 'review', title: 'En révision', color: 'warning.main' },
  { id: 'done', title: 'Terminé', color: 'success.main' },
];

const PRIORITY_CONFIG = {
  1: { label: 'Critique', color: 'error' },
  2: { label: 'Haute', color: 'warning' },
  3: { label: 'Moyenne', color: 'info' },
  4: { label: 'Basse', color: 'default' },
};

function TaskCard({ task, index }) {
  return (
    <Draggable draggableId={task._id} index={index}>
      {(provided, snapshot) => (
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          elevation={0}
          sx={{
            mb: 1.5,
            border: (t) => `1px solid ${alpha(t.palette.divider, snapshot.isDragging ? 0.8 : 0.4)}`,
            borderRadius: 1.5,
            cursor: 'grab',
            boxShadow: snapshot.isDragging ? '0 8px 24px rgba(0,0,0,0.15)' : 'none',
            transform: snapshot.isDragging ? 'rotate(2deg)' : 'none',
            transition: 'box-shadow 0.2s, transform 0.2s',
            bgcolor: snapshot.isDragging ? alpha('#6366f1', 0.04) : 'background.paper',
          }}
        >
          <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              {task.title}
            </Typography>
            {task.description && (
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }} noWrap>
                {task.description}
              </Typography>
            )}
            <Stack direction="row" spacing={0.5} flexWrap="wrap">
              {task.priority && (
                <Chip
                  label={PRIORITY_CONFIG[task.priority]?.label || `P${task.priority}`}
                  size="small"
                  color={PRIORITY_CONFIG[task.priority]?.color || 'default'}
                  sx={{ height: 18, fontSize: 10 }}
                />
              )}
              {task.deadline && (
                <Chip
                  label={new Date(task.deadline).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                  size="small"
                  sx={{ height: 18, fontSize: 10 }}
                />
              )}
              {(task.tags || []).slice(0, 2).map((tag) => (
                <Chip key={tag} label={tag} size="small" variant="outlined" sx={{ height: 18, fontSize: 10 }} />
              ))}
            </Stack>
          </CardContent>
        </Card>
      )}
    </Draggable>
  );
}

function BoardColumn({ column, tasks, onAddTask }) {
  return (
    <Box
      sx={{
        flex: 1,
        minWidth: 240,
        maxWidth: 320,
        bgcolor: alpha('#6b7280', 0.05),
        border: (t) => `1px solid ${alpha(t.palette.divider, 0.4)}`,
        borderRadius: 2,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Column Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2, pb: 1.5 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: column.color }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{column.title}</Typography>
          <Chip label={tasks.length} size="small" sx={{ height: 18, fontSize: 10, bgcolor: (t) => alpha(t.palette.divider, 0.5) }} />
        </Stack>
        <IconButton size="small" onClick={() => onAddTask(column.id)}>
          <Icon icon="eva:plus-fill" width={16} />
        </IconButton>
      </Stack>

      {/* Droppable zone */}
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <Box
            ref={provided.innerRef}
            {...provided.droppableProps}
            sx={{
              flex: 1,
              p: 1.5,
              pt: 0,
              minHeight: 100,
              bgcolor: snapshot.isDraggingOver ? alpha('#6366f1', 0.05) : 'transparent',
              transition: 'background 0.2s',
              borderRadius: '0 0 8px 8px',
              overflowY: 'auto',
              maxHeight: 'calc(100vh - 280px)',
            }}
          >
            {tasks.map((task, index) => (
              <TaskCard key={task._id} task={task} index={index} />
            ))}
            {provided.placeholder}
            {tasks.length === 0 && !snapshot.isDraggingOver && (
              <Box
                sx={{
                  height: 80,
                  border: (t) => `2px dashed ${alpha(t.palette.divider, 0.5)}`,
                  borderRadius: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography variant="caption" sx={{ color: 'text.disabled' }}>Aucune tâche</Typography>
              </Box>
            )}
          </Box>
        )}
      </Droppable>
    </Box>
  );
}

export default function TaskBoard() {
  const dispatch = useDispatch();
  const { list: tasks, isLoading } = useSelector((s) => s.task);

  useEffect(() => {
    dispatch(fetchTasks({}));
  }, [dispatch]);

  const getColumnTasks = (colId) => tasks.filter((t) => t.status === colId);

  const onDragEnd = (result) => {
    const { draggableId, destination, source } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;
    const task = tasks.find((t) => t._id === draggableId);
    if (!task) return;
    dispatch(updateTask({ id: draggableId, payload: { ...task, status: destination.droppableId } }));
  };

  const handleAddTask = async (status) => {
    const title = prompt('Titre de la tâche:');
    if (title?.trim()) {
      dispatch(createTask({ title: title.trim(), status, priority: 3 }));
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>Tableau Kanban</Typography>
        <Button
          variant="contained"
          startIcon={<Icon icon="eva:plus-fill" />}
          onClick={() => handleAddTask('todo')}
          sx={{ borderRadius: 1.5, fontWeight: 700 }}
        >
          Nouvelle tâche
        </Button>
      </Stack>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              overflowX: 'auto',
              pb: 2,
              '&::-webkit-scrollbar': { height: 6 },
              '&::-webkit-scrollbar-thumb': { bgcolor: 'divider', borderRadius: 3 },
            }}
          >
            {COLUMNS.map((col) => (
              <BoardColumn
                key={col.id}
                column={col}
                tasks={getColumnTasks(col.id)}
                onAddTask={handleAddTask}
              />
            ))}
          </Box>
        </DragDropContext>
      )}
    </motion.div>
  );
}
