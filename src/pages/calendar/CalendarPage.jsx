import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Typography, Stack, Button, Chip, Paper, IconButton, Card, CardContent,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { fetchEvents, addEvent } from '../../redux/slices/calendarSlice';
import axiosInstance from '../../utils/axios';

const WEEKDAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

const EVENT_COLORS = {
  meeting: 'info', deadline: 'error', reminder: 'warning', personal: 'success', other: 'default',
};

function EventFormDialog({ open, onClose, selectedDate }) {
  const dispatch = useDispatch();
  const { register, handleSubmit, reset } = useForm({
    defaultValues: { title: '', description: '', type: 'other', start: '' },
  });

  useEffect(() => {
    if (open) reset({ title: '', description: '', type: 'other', start: selectedDate ? selectedDate.toISOString().split('T')[0] : '' });
  }, [open, selectedDate, reset]);

  const onSubmit = async (data) => {
    try {
      const { data: resp } = await axiosInstance.post('/api/calendar/events', data);
      dispatch(addEvent(resp.event || resp));
    } catch (e) {
      dispatch(addEvent({ ...data, id: Date.now().toString(), _id: Date.now().toString() }));
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle sx={{ fontWeight: 700 }}>Nouvel événement</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField {...register('title')} label="Titre" fullWidth required autoFocus />
            <TextField {...register('description')} label="Description" fullWidth multiline rows={2} />
            <TextField {...register('start')} label="Date/Heure" type="datetime-local" fullWidth InputLabelProps={{ shrink: true }} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={onClose} variant="outlined">Annuler</Button>
          <Button type="submit" variant="contained" sx={{ borderRadius: 1.5, fontWeight: 700 }}>Créer</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default function CalendarPage() {
  const dispatch = useDispatch();
  const { events, isLoading } = useSelector((s) => s.calendar);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => {
    dispatch(fetchEvents({}));
  }, [dispatch]);

  const { month, year, days } = useMemo(() => {
    const m = currentDate.getMonth();
    const y = currentDate.getFullYear();
    const firstDay = new Date(y, m, 1);
    const lastDay = new Date(y, m + 1, 0);
    let startDow = firstDay.getDay() - 1;
    if (startDow < 0) startDow = 6;
    const arr = [];
    for (let i = 0; i < startDow; i++) arr.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) arr.push(new Date(y, m, d));
    return { month: m, year: y, days: arr };
  }, [currentDate]);

  const monthName = currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  const getEventsForDate = (date) => {
    if (!date) return [];
    return events.filter((ev) => {
      const s = ev.start || ev.date || ev.startDate;
      if (!s) return false;
      return new Date(s).toDateString() === date.toDateString();
    });
  };

  const isToday = (date) => date && new Date().toDateString() === date.toDateString();

  const dayEvents = selectedDay ? getEventsForDate(selectedDay) : [];

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>Calendrier</Typography>
        <Button
          variant="contained"
          startIcon={<Icon icon="eva:plus-fill" />}
          onClick={() => { setSelectedDate(null); setDialogOpen(true); }}
          sx={{ borderRadius: 1.5, fontWeight: 700 }}
        >
          Nouvel événement
        </Button>
      </Stack>

      <Paper elevation={0} sx={{ border: (t) => `1px solid ${alpha(t.palette.divider, 0.5)}`, borderRadius: 2, overflow: 'hidden' }}>
        {/* Nav Header */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2, borderBottom: (t) => `1px solid ${alpha(t.palette.divider, 0.4)}` }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <IconButton size="small" onClick={() => setCurrentDate(new Date(year, month - 1, 1))}>
              <Icon icon="eva:chevron-left-fill" />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: 700, minWidth: 200, textAlign: 'center', textTransform: 'capitalize' }}>
              {monthName}
            </Typography>
            <IconButton size="small" onClick={() => setCurrentDate(new Date(year, month + 1, 1))}>
              <Icon icon="eva:chevron-right-fill" />
            </IconButton>
          </Stack>
          <Button size="small" variant="outlined" onClick={() => setCurrentDate(new Date())}>
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
                display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
                gap: '1px', bgcolor: (t) => alpha(t.palette.divider, 0.3),
                border: (t) => `1px solid ${alpha(t.palette.divider, 0.3)}`,
                borderRadius: 1, overflow: 'hidden',
              }}
            >
              {days.map((date, i) => {
                const dayEvts = getEventsForDate(date);
                const isSelected = selectedDay && date && selectedDay.toDateString() === date.toDateString();
                return (
                  <Box
                    key={i}
                    onClick={() => date && setSelectedDay(date)}
                    sx={{
                      minHeight: 90, p: 0.75, cursor: date ? 'pointer' : 'default',
                      bgcolor: !date
                        ? (t) => alpha(t.palette.grey[500], 0.06)
                        : isToday(date)
                        ? (t) => alpha(t.palette.primary.main, 0.06)
                        : isSelected
                        ? (t) => alpha(t.palette.primary.main, 0.1)
                        : 'background.paper',
                      '&:hover': date ? { bgcolor: (t) => alpha(t.palette.primary.main, 0.05) } : {},
                    }}
                  >
                    {date && (
                      <>
                        <Box sx={{ width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: isToday(date) ? 'primary.main' : 'transparent', mb: 0.5 }}>
                          <Typography variant="caption" sx={{ fontWeight: 600, color: isToday(date) ? 'common.white' : 'text.secondary' }}>
                            {date.getDate()}
                          </Typography>
                        </Box>
                        <Stack spacing={0.25}>
                          {dayEvts.slice(0, 2).map((ev) => (
                            <Chip
                              key={ev._id || ev.id}
                              label={ev.title}
                              size="small"
                              color={EVENT_COLORS[ev.type] || 'primary'}
                              sx={{ height: 16, fontSize: 9, maxWidth: '100%', '& .MuiChip-label': { px: 0.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }}
                            />
                          ))}
                          {dayEvts.length > 2 && (
                            <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: 9 }}>+{dayEvts.length - 2}</Typography>
                          )}
                        </Stack>
                      </>
                    )}
                  </Box>
                );
              })}
            </Box>

            {/* Selected day events */}
            {selectedDay && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, textTransform: 'capitalize' }}>
                  {selectedDay.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </Typography>
                {dayEvents.length === 0 ? (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography sx={{ color: 'text.secondary' }}>Aucun événement</Typography>
                    <Button size="small" onClick={() => { setSelectedDate(selectedDay); setDialogOpen(true); }}>+ Ajouter</Button>
                  </Stack>
                ) : (
                  <Stack spacing={1.5}>
                    {dayEvents.map((ev) => (
                      <Card key={ev._id || ev.id} elevation={0} sx={{ border: (t) => `1px solid ${alpha(t.palette.divider, 0.5)}`, borderRadius: 1.5 }}>
                        <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                          <Stack direction="row" alignItems="center" spacing={1.5}>
                            <Icon icon="eva:calendar-fill" width={18} />
                            <Box sx={{ flexGrow: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>{ev.title}</Typography>
                              {ev.description && <Typography variant="caption" sx={{ color: 'text.secondary' }}>{ev.description}</Typography>}
                            </Box>
                            {ev.type && <Chip label={ev.type} size="small" color={EVENT_COLORS[ev.type] || 'default'} sx={{ height: 20, fontSize: 10 }} />}
                          </Stack>
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                )}
              </Box>
            )}
          </Box>
        )}
      </Paper>

      <EventFormDialog open={dialogOpen} onClose={() => setDialogOpen(false)} selectedDate={selectedDate} />
    </motion.div>
  );
}
