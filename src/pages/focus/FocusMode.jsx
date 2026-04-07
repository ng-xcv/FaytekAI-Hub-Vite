import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Box, Typography, Stack, Card, CardContent, Button, Chip, Slider, CircularProgress } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';

const TIMER_PRESETS = [
  { label: 'Pomodoro', minutes: 25, color: 'error' },
  { label: 'Deep Work', minutes: 50, color: 'primary' },
  { label: 'Short Break', minutes: 5, color: 'success' },
  { label: 'Long Break', minutes: 15, color: 'info' },
];

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function FocusMode() {
  const { list: tasks } = useSelector((s) => s.task);
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIMER_PRESETS[0].minutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [focusTask, setFocusTask] = useState(null);
  const intervalRef = useRef(null);
  const total = TIMER_PRESETS[selectedPreset].minutes * 60;
  const progress = ((total - timeLeft) / total) * 100;

  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    setTimeLeft(TIMER_PRESETS[selectedPreset].minutes * 60);
    setIsRunning(false);
    clearInterval(intervalRef.current);
  }, [selectedPreset]);

  const start = () => {
    setIsRunning(true);
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          setIsRunning(false);
          setSessions((s) => s + 1);
          // Sound notification
          try { new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAA...').play(); } catch {}
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const pause = () => {
    setIsRunning(false);
    clearInterval(intervalRef.current);
  };

  const reset = () => {
    setIsRunning(false);
    clearInterval(intervalRef.current);
    setTimeLeft(TIMER_PRESETS[selectedPreset].minutes * 60);
  };

  const pendingTasks = tasks.filter((t) => t.status !== 'done').slice(0, 5);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 3 }}>Mode Focus 🎯</Typography>

      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3}>
        {/* Timer */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Presets */}
          <Stack direction="row" spacing={1} sx={{ mb: 4 }}>
            {TIMER_PRESETS.map((p, i) => (
              <Chip
                key={p.label}
                label={p.label}
                onClick={() => setSelectedPreset(i)}
                color={selectedPreset === i ? p.color : 'default'}
                variant={selectedPreset === i ? 'filled' : 'outlined'}
                sx={{ fontWeight: selectedPreset === i ? 700 : 400 }}
              />
            ))}
          </Stack>

          {/* Circular Timer */}
          <Box sx={{ position: 'relative', display: 'inline-flex', mb: 4 }}>
            <CircularProgress
              variant="determinate"
              value={100}
              size={280}
              thickness={3}
              sx={{ color: (t) => alpha(t.palette.divider, 0.3), position: 'absolute' }}
            />
            <CircularProgress
              variant="determinate"
              value={progress}
              size={280}
              thickness={3}
              color={TIMER_PRESETS[selectedPreset].color}
            />
            <Box
              sx={{
                top: 0, left: 0, bottom: 0, right: 0,
                position: 'absolute',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
              }}
            >
              <Typography variant="h2" sx={{ fontWeight: 800, fontVariantNumeric: 'tabular-nums', fontSize: 56 }}>
                {formatTime(timeLeft)}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {TIMER_PRESETS[selectedPreset].label}
              </Typography>
            </Box>
          </Box>

          {/* Controls */}
          <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
            <Button
              variant="outlined"
              size="large"
              onClick={reset}
              sx={{ borderRadius: 2, minWidth: 56, px: 2 }}
            >
              <Icon icon="eva:refresh-fill" width={20} />
            </Button>
            <Button
              variant="contained"
              size="large"
              color={TIMER_PRESETS[selectedPreset].color}
              onClick={isRunning ? pause : start}
              sx={{ borderRadius: 2, minWidth: 120, fontWeight: 700, fontSize: 16 }}
            >
              {isRunning ? (
                <><Icon icon="eva:pause-circle-fill" width={22} style={{ marginRight: 8 }} />Pause</>
              ) : (
                <><Icon icon="eva:play-circle-fill" width={22} style={{ marginRight: 8 }} />Démarrer</>
              )}
            </Button>
          </Stack>

          {/* Stats */}
          <Stack direction="row" spacing={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h5" sx={{ fontWeight: 800, color: 'error.main' }}>{sessions}</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>Sessions terminées</Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main' }}>{Math.floor(sessions * 25 / 60)}h{(sessions * 25) % 60}m</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>Temps focalisé</Typography>
            </Box>
          </Stack>
        </Box>

        {/* Task Selection */}
        <Box sx={{ flex: 1 }}>
          <Card elevation={0} sx={{ border: (t) => `1px solid ${alpha(t.palette.divider, 0.5)}`, borderRadius: 2, mb: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Tâche en cours</Typography>
              {focusTask ? (
                <Stack direction="row" alignItems="center" spacing={1.5} sx={{ p: 1.5, borderRadius: 1.5, bgcolor: alpha('#6366f1', 0.06) }}>
                  <Icon icon="eva:checkmark-square-2-fill" width={20} />
                  <Typography variant="body2" sx={{ flexGrow: 1, fontWeight: 600 }}>{focusTask.title}</Typography>
                  <Button size="small" onClick={() => setFocusTask(null)}>Changer</Button>
                </Stack>
              ) : (
                <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 2 }}>
                  Sélectionnez une tâche ci-dessous
                </Typography>
              )}
            </CardContent>
          </Card>

          <Card elevation={0} sx={{ border: (t) => `1px solid ${alpha(t.palette.divider, 0.5)}`, borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Tâches en attente</Typography>
              {pendingTasks.length === 0 ? (
                <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 3 }}>
                  Aucune tâche en attente 🎉
                </Typography>
              ) : (
                <Stack spacing={1}>
                  {pendingTasks.map((task) => (
                    <Stack
                      key={task._id}
                      direction="row"
                      alignItems="center"
                      spacing={1.5}
                      onClick={() => setFocusTask(task)}
                      sx={{
                        p: 1.5, borderRadius: 1.5, cursor: 'pointer',
                        border: (t) => `1px solid ${focusTask?._id === task._id ? t.palette.primary.main : alpha(t.palette.divider, 0.4)}`,
                        bgcolor: focusTask?._id === task._id ? alpha('#6366f1', 0.06) : 'transparent',
                        '&:hover': { bgcolor: alpha('#6366f1', 0.04) },
                      }}
                    >
                      <Icon icon={focusTask?._id === task._id ? 'eva:checkmark-circle-2-fill' : 'eva:radio-button-off-fill'} width={18} />
                      <Typography variant="body2" sx={{ flexGrow: 1, fontWeight: 500 }} noWrap>{task.title}</Typography>
                      {task.estimated_min && (
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>{task.estimated_min}min</Typography>
                      )}
                    </Stack>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Box>
      </Stack>
    </motion.div>
  );
}
