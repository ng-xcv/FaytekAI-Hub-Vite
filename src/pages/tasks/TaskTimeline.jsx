import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Typography, Stack, Chip, CircularProgress, Paper } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { fetchTasks } from '../../redux/slices/taskSlice';

const PRIORITY_COLORS = {
  1: 'error.main', urgent: 'error.main',
  2: 'warning.main', high: 'warning.main',
  3: 'info.main', medium: 'info.main',
  4: 'text.disabled', low: 'text.disabled',
};

const PRIORITY_LABELS = { 1: 'Critique', 2: 'Haute', 3: 'Moyenne', 4: 'Basse' };

export default function TaskTimeline() {
  const dispatch = useDispatch();
  const { list: tasks, isLoading } = useSelector((s) => s.task);

  useEffect(() => {
    dispatch(fetchTasks({}));
  }, [dispatch]);

  const { days, startDate } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(today);
    start.setDate(start.getDate() - 3);
    const end = new Date(today);
    end.setDate(end.getDate() + 11);
    const daysArray = [];
    const cur = new Date(start);
    while (cur <= end) {
      daysArray.push(new Date(cur));
      cur.setDate(cur.getDate() + 1);
    }
    return { days: daysArray, startDate: start };
  }, []);

  const sortedTasks = useMemo(() => {
    return [...tasks]
      .filter((t) => t.deadline || t.dueDate)
      .sort((a, b) => new Date(a.deadline || a.dueDate) - new Date(b.deadline || b.dueDate));
  }, [tasks]);

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getPosition = (task) => {
    const dateStr = task.deadline || task.dueDate;
    if (!dateStr) return null;
    const due = new Date(dateStr);
    const idx = days.findIndex((d) => d.toDateString() === due.toDateString());
    return idx >= 0 ? idx : null;
  };

  const dayW = 60;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 3 }}>Timeline des Tâches</Typography>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
      ) : (
        <Paper
          elevation={0}
          sx={{ border: (t) => `1px solid ${alpha(t.palette.divider, 0.5)}`, borderRadius: 2, overflow: 'hidden' }}
        >
          {/* Header: dates */}
          <Box sx={{ display: 'flex', borderBottom: (t) => `1px solid ${alpha(t.palette.divider, 0.5)}`, bgcolor: (t) => alpha(t.palette.grey[500], 0.05) }}>
            <Box sx={{ width: 240, flexShrink: 0, borderRight: (t) => `1px solid ${alpha(t.palette.divider, 0.4)}`, p: 1.5 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase' }}>
                Tâche
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', overflowX: 'auto' }}>
              {days.map((day, i) => (
                <Box
                  key={i}
                  sx={{
                    width: dayW, flexShrink: 0, textAlign: 'center', p: 1,
                    borderRight: (t) => `1px solid ${alpha(t.palette.divider, 0.3)}`,
                    bgcolor: isToday(day) ? (t) => alpha(t.palette.primary.main, 0.08) : 'transparent',
                  }}
                >
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: 10 }}>
                    {day.toLocaleDateString('fr-FR', { weekday: 'short' })}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 700, color: isToday(day) ? 'primary.main' : 'text.primary' }}
                  >
                    {day.getDate()}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Rows */}
          {sortedTasks.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography sx={{ color: 'text.secondary' }}>Aucune tâche avec échéance</Typography>
            </Box>
          ) : (
            sortedTasks.map((task) => {
              const pos = getPosition(task);
              return (
                <Box
                  key={task._id}
                  sx={{
                    display: 'flex',
                    borderBottom: (t) => `1px solid ${alpha(t.palette.divider, 0.3)}`,
                    '&:last-child': { borderBottom: 'none' },
                    '&:hover': { bgcolor: (t) => alpha(t.palette.grey[500], 0.04) },
                  }}
                >
                  <Box
                    sx={{
                      width: 240, flexShrink: 0, p: 1.5,
                      borderRight: (t) => `1px solid ${alpha(t.palette.divider, 0.4)}`,
                      display: 'flex', alignItems: 'center', gap: 1,
                    }}
                  >
                    <Box
                      sx={{
                        width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                        bgcolor: PRIORITY_COLORS[task.priority] || 'text.disabled',
                      }}
                    />
                    <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
                      {task.title}
                    </Typography>
                  </Box>
                  <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', position: 'relative', minHeight: 44 }}>
                    {days.map((_, i) => (
                      <Box
                        key={i}
                        sx={{
                          width: dayW, flexShrink: 0, height: '100%',
                          borderRight: (t) => `1px solid ${alpha(t.palette.divider, 0.15)}`,
                        }}
                      />
                    ))}
                    {pos !== null && (
                      <Chip
                        label={PRIORITY_LABELS[task.priority] || `P${task.priority}`}
                        size="small"
                        color={
                          task.priority === 1 ? 'error'
                          : task.priority === 2 ? 'warning'
                          : task.priority === 3 ? 'info'
                          : 'default'
                        }
                        sx={{
                          position: 'absolute',
                          left: pos * dayW + 4,
                          height: 24,
                          fontSize: 10,
                          fontWeight: 700,
                          zIndex: 1,
                        }}
                      />
                    )}
                  </Box>
                </Box>
              );
            })
          )}
        </Paper>
      )}
    </motion.div>
  );
}
