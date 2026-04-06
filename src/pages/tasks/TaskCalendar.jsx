import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Typography, Stack, Button, Chip, Paper, IconButton, CircularProgress } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { fetchTasks } from '../../redux/slices/taskSlice';

const WEEKDAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

const PRIORITY_COLORS = {
  1: 'error', 2: 'warning', 3: 'info', 4: 'default',
};

export default function TaskCalendar() {
  const dispatch = useDispatch();
  const { list: tasks, isLoading } = useSelector((s) => s.task);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    dispatch(fetchTasks({}));
  }, [dispatch]);

  const { month, year, days } = useMemo(() => {
    const m = currentDate.getMonth();
    const y = currentDate.getFullYear();
    const firstDay = new Date(y, m, 1);
    const lastDay = new Date(y, m + 1, 0);
    let startDow = firstDay.getDay() - 1;
    if (startDow < 0) startDow = 6;
    const daysArray = [];
    for (let i = 0; i < startDow; i++) daysArray.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) daysArray.push(new Date(y, m, d));
    return { month: m, year: y, days: daysArray };
  }, [currentDate]);

  const monthName = currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  const getTasksForDate = (date) => {
    if (!date) return [];
    return tasks.filter((t) => {
      const dd = t.deadline || t.dueDate;
      if (!dd) return false;
      return new Date(dd).toDateString() === date.toDateString();
    });
  };

  const isToday = (date) => date && new Date().toDateString() === date.toDateString();

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 3 }}>Calendrier des Tâches</Typography>

      <Paper elevation={0} sx={{ border: (t) => `1px solid ${alpha(t.palette.divider, 0.5)}`, borderRadius: 2, overflow: 'hidden' }}>
        {/* Header */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2, borderBottom: (t) => `1px solid ${alpha(t.palette.divider, 0.4)}` }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <IconButton size="small" onClick={() => setCurrentDate(new Date(year, month - 1, 1))}>
              <Icon icon="eva:chevron-left-fill" />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: 700, minWidth: 180, textAlign: 'center', textTransform: 'capitalize' }}>
              {monthName}
            </Typography>
            <IconButton size="small" onClick={() => setCurrentDate(new Date(year, month + 1, 1))}>
              <Icon icon="eva:chevron-right-fill" />
            </IconButton>
          </Stack>
          <Button size="small" variant="outlined" onClick={() => setCurrentDate(new Date())} sx={{ borderRadius: 1 }}>
            Aujourd&apos;hui
          </Button>
        </Stack>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
        ) : (
          <Box sx={{ p: 2 }}>
            {/* Weekday headers */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', mb: 1 }}>
              {WEEKDAYS.map((d) => (
                <Typography key={d} variant="caption" sx={{ textAlign: 'center', fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', py: 1 }}>
                  {d}
                </Typography>
              ))}
            </Box>

            {/* Days grid */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: '1px',
                bgcolor: (t) => alpha(t.palette.divider, 0.3),
                border: (t) => `1px solid ${alpha(t.palette.divider, 0.3)}`,
                borderRadius: 1,
                overflow: 'hidden',
              }}
            >
              {days.map((date, i) => {
                const dayTasks = getTasksForDate(date);
                return (
                  <Box
                    key={i}
                    sx={{
                      minHeight: 90,
                      p: 0.75,
                      bgcolor: !date
                        ? (t) => alpha(t.palette.grey[500], 0.06)
                        : isToday(date)
                        ? (t) => alpha(t.palette.primary.main, 0.06)
                        : 'background.paper',
                    }}
                  >
                    {date && (
                      <>
                        <Box
                          sx={{
                            width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            bgcolor: isToday(date) ? 'primary.main' : 'transparent',
                            mb: 0.5,
                          }}
                        >
                          <Typography variant="caption" sx={{ fontWeight: 600, color: isToday(date) ? 'common.white' : 'text.secondary' }}>
                            {date.getDate()}
                          </Typography>
                        </Box>
                        <Stack spacing={0.3}>
                          {dayTasks.slice(0, 3).map((task) => (
                            <Chip
                              key={task._id}
                              label={task.title}
                              size="small"
                              color={PRIORITY_COLORS[task.priority] || 'default'}
                              sx={{ height: 18, fontSize: 9, maxWidth: '100%', '& .MuiChip-label': { px: 0.75, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }}
                            />
                          ))}
                          {dayTasks.length > 3 && (
                            <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: 9 }}>
                              +{dayTasks.length - 3} autres
                            </Typography>
                          )}
                        </Stack>
                      </>
                    )}
                  </Box>
                );
              })}
            </Box>
          </Box>
        )}
      </Paper>
    </motion.div>
  );
}
