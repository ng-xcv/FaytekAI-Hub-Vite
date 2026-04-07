import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { Icon } from '@iconify/react';
import {
  fetchEvents,
  createEvent,
  deleteEvent,
  syncOutlook,
} from '../../redux/slices/calendarSlice';

// ── Configuration types ───────────────────────────────────────────────────────
const TYPE_CONFIG = {
  reunion:   { label: 'Réunion',   color: 'info',    icon: 'mdi:account-group' },
  deadline:  { label: 'Deadline',  color: 'error',   icon: 'mdi:flag' },
  rappel:    { label: 'Rappel',    color: 'warning', icon: 'mdi:bell' },
  personnel: { label: 'Personnel', color: 'success', icon: 'mdi:account' },
  outlook:   { label: 'Outlook',   color: 'primary', icon: 'mdi:microsoft-outlook' },
};

const JOURS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

const MOIS_LABELS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function isSameDay(isoDate, year, month, day) {
  const d = new Date(isoDate);
  return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
}

function getCalendarDays(year, month) {
  // First day of month (Monday=0 … Sunday=6)
  const firstDay = new Date(year, month, 1);
  let startOffset = firstDay.getDay() - 1; // getDay: 0=Sun, 1=Mon…
  if (startOffset < 0) startOffset = 6;   // Sunday → put at end

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];

  // Padding before
  for (let i = 0; i < startOffset; i++) cells.push(null);

  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  // Pad to full weeks
  while (cells.length % 7 !== 0) cells.push(null);

  return cells;
}

// ── Default form state ────────────────────────────────────────────────────────
function defaultForm(selectedDate) {
  const now = selectedDate
    ? new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 9, 0)
    : new Date();
  const end = new Date(now.getTime() + 60 * 60 * 1000);

  const toLocal = (d) => {
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  return {
    titre: '',
    dateDebut: toLocal(now),
    dateFin: toLocal(end),
    description: '',
    type: 'reunion',
    workspace: 'bureau',
    lieu: '',
  };
}

// ── EventChip ─────────────────────────────────────────────────────────────────
function EventChip({ event, onClick }) {
  const cfg = TYPE_CONFIG[event.type] || TYPE_CONFIG.reunion;
  const isOutlook = event.syncSource === 'outlook' || !!event.outlookEventId;

  return (
    <Tooltip title={event.titre} arrow>
      <Chip
        size="small"
        color={cfg.color}
        icon={<Icon icon={cfg.icon} width={12} />}
        label={
          <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <span style={{ maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'inline-block' }}>
              {event.titre}
            </span>
            {isOutlook && (
              <Icon icon="mdi:microsoft-outlook" width={10} style={{ flexShrink: 0 }} />
            )}
          </Box>
        }
        onClick={(e) => { e.stopPropagation(); onClick(event); }}
        sx={{ mb: 0.25, cursor: 'pointer', maxWidth: '100%' }}
      />
    </Tooltip>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function CalendarPage() {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { events, isLoading, isSyncing } = useSelector((s) => s.calendar);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [openForm, setOpenForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [form, setForm] = useState(defaultForm(null));
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const cells = getCalendarDays(year, month);

  // ── Load events on month change ──────────────────────────────────────────
  useEffect(() => {
    const debut = new Date(year, month, 1).toISOString();
    const fin = new Date(year, month + 1, 0, 23, 59).toISOString();
    dispatch(fetchEvents({ debut, fin }));
  }, [dispatch, currentDate]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Navigation ───────────────────────────────────────────────────────────
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => setCurrentDate(new Date());

  // ── Sync Outlook ─────────────────────────────────────────────────────────
  const handleSyncOutlook = async () => {
    try {
      await dispatch(syncOutlook()).unwrap();
      enqueueSnackbar('Calendrier Outlook synchronisé', { variant: 'success' });
      const debut = new Date(year, month, 1).toISOString();
      const fin = new Date(year, month + 1, 0, 23, 59).toISOString();
      dispatch(fetchEvents({ debut, fin }));
    } catch {
      enqueueSnackbar('Sync Outlook échouée — vérifier la connexion MS365', { variant: 'error' });
    }
  };

  // ── Open form ─────────────────────────────────────────────────────────────
  const handleOpenForm = (day = null) => {
    const date = day ? new Date(year, month, day) : null;
    setSelectedDate(date);
    setForm(defaultForm(date));
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setSelectedDate(null);
  };

  // ── Submit create ─────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!form.titre.trim()) {
      enqueueSnackbar('Le titre est requis', { variant: 'warning' });
      return;
    }
    setSubmitting(true);
    try {
      await dispatch(createEvent({
        titre: form.titre.trim(),
        dateDebut: new Date(form.dateDebut).toISOString(),
        dateFin: new Date(form.dateFin).toISOString(),
        description: form.description,
        type: form.type,
        workspace: form.workspace,
        lieu: form.lieu,
      })).unwrap();
      enqueueSnackbar('Événement créé', { variant: 'success' });
      handleCloseForm();
    } catch {
      enqueueSnackbar('Erreur lors de la création', { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete event ──────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    setDeleting(true);
    try {
      await dispatch(deleteEvent(id)).unwrap();
      enqueueSnackbar('Événement supprimé', { variant: 'success' });
      setSelectedEvent(null);
    } catch {
      enqueueSnackbar('Erreur lors de la suppression', { variant: 'error' });
    } finally {
      setDeleting(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  const today = new Date();

  return (
    <Box sx={{ p: { xs: 1, md: 3 } }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 2 }}>
        <Typography variant="h5" fontWeight={700} sx={{ flexGrow: 1 }}>
          📅 Calendrier
        </Typography>

        <Button
          variant="outlined"
          size="small"
          startIcon={<Icon icon="mdi:calendar-today" />}
          onClick={goToday}
        >
          Aujourd'hui
        </Button>

        <Button
          variant="outlined"
          color="primary"
          size="small"
          startIcon={isSyncing ? <CircularProgress size={14} /> : <Icon icon="mdi:microsoft-outlook" />}
          onClick={handleSyncOutlook}
          disabled={isSyncing}
        >
          {isSyncing ? 'Sync…' : 'Sync Outlook'}
        </Button>

        <Button
          variant="contained"
          size="small"
          startIcon={<Icon icon="mdi:plus" />}
          onClick={() => handleOpenForm()}
        >
          + Événement
        </Button>
      </Box>

      {/* Month navigation */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2, gap: 2 }}>
        <IconButton onClick={prevMonth} size="small">
          <Icon icon="mdi:chevron-left" />
        </IconButton>
        <Typography variant="h6" fontWeight={600} minWidth={200} textAlign="center">
          {MOIS_LABELS[month]} {year}
        </Typography>
        <IconButton onClick={nextMonth} size="small">
          <Icon icon="mdi:chevron-right" />
        </IconButton>
      </Box>

      {/* Calendar grid */}
      <Card variant="outlined">
        <CardContent sx={{ p: 1 }}>
          {/* Day headers */}
          <Grid container columns={7} sx={{ mb: 0.5 }}>
            {JOURS.map((j) => (
              <Grid item xs={1} key={j}>
                <Typography
                  variant="caption"
                  fontWeight={700}
                  color="text.secondary"
                  sx={{ display: 'block', textAlign: 'center', py: 0.5 }}
                >
                  {j}
                </Typography>
              </Grid>
            ))}
          </Grid>

          {/* Day cells */}
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container columns={7}>
              {cells.map((day, idx) => {
                if (!day) {
                  return (
                    <Grid item xs={1} key={`empty-${idx}`}>
                      <Box sx={{ minHeight: 90, bgcolor: 'action.hover', m: 0.25, borderRadius: 1 }} />
                    </Grid>
                  );
                }

                const isToday =
                  day === today.getDate() &&
                  month === today.getMonth() &&
                  year === today.getFullYear();

                const dayEvents = events.filter((e) =>
                  e.dateDebut && isSameDay(e.dateDebut, year, month, day)
                );

                return (
                  <Grid item xs={1} key={day}>
                    <Box
                      onClick={() => handleOpenForm(day)}
                      sx={{
                        minHeight: 90,
                        m: 0.25,
                        p: 0.5,
                        borderRadius: 1,
                        border: isToday ? '2px solid' : '1px solid',
                        borderColor: isToday ? 'primary.main' : 'divider',
                        bgcolor: isToday ? 'primary.lighter' : 'background.paper',
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'action.hover' },
                        overflow: 'hidden',
                      }}
                    >
                      <Typography
                        variant="caption"
                        fontWeight={isToday ? 800 : 400}
                        color={isToday ? 'primary.main' : 'text.primary'}
                        sx={{ display: 'block', textAlign: 'right', mb: 0.5 }}
                      >
                        {day}
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                        {dayEvents.slice(0, 3).map((ev) => (
                          <EventChip key={ev._id} event={ev} onClick={setSelectedEvent} />
                        ))}
                        {dayEvents.length > 3 && (
                          <Typography variant="caption" color="text.secondary" sx={{ pl: 0.5 }}>
                            +{dayEvents.length - 3} autres
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* ── Dialog: Event detail ── */}
      <Dialog
        open={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        maxWidth="sm"
        fullWidth
      >
        {selectedEvent && (() => {
          const cfg = TYPE_CONFIG[selectedEvent.type] || TYPE_CONFIG.reunion;
          const isOutlook = selectedEvent.syncSource === 'outlook' || !!selectedEvent.outlookEventId;
          return (
            <>
              <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Icon icon={cfg.icon} width={20} />
                {selectedEvent.titre}
                {isOutlook && (
                  <Chip
                    size="small"
                    color="primary"
                    icon={<Icon icon="mdi:microsoft-outlook" width={12} />}
                    label="Outlook"
                    sx={{ ml: 1 }}
                  />
                )}
              </DialogTitle>
              <DialogContent dividers>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Type</Typography>
                    <Box>
                      <Chip size="small" color={cfg.color} label={cfg.label} />
                    </Box>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Début</Typography>
                    <Typography variant="body2">{formatDate(selectedEvent.dateDebut)}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Fin</Typography>
                    <Typography variant="body2">{formatDate(selectedEvent.dateFin)}</Typography>
                  </Box>
                  {selectedEvent.lieu && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">Lieu</Typography>
                      <Typography variant="body2">{selectedEvent.lieu}</Typography>
                    </Box>
                  )}
                  {selectedEvent.description && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">Description</Typography>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {selectedEvent.description}
                      </Typography>
                    </Box>
                  )}
                  {selectedEvent.workspace && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">Workspace</Typography>
                      <Typography variant="body2">{selectedEvent.workspace}</Typography>
                    </Box>
                  )}
                </Box>
              </DialogContent>
              <DialogActions>
                <Button
                  color="error"
                  variant="outlined"
                  startIcon={deleting ? <CircularProgress size={14} /> : <Icon icon="mdi:trash-can-outline" />}
                  onClick={() => handleDelete(selectedEvent._id)}
                  disabled={deleting}
                >
                  Supprimer
                </Button>
                <Button onClick={() => setSelectedEvent(null)}>Fermer</Button>
              </DialogActions>
            </>
          );
        })()}
      </Dialog>

      {/* ── Dialog: Create event ── */}
      <Dialog open={openForm} onClose={handleCloseForm} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Icon icon="mdi:calendar-plus" style={{ marginRight: 8, verticalAlign: 'middle' }} />
          Nouvel événement
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Titre *"
              value={form.titre}
              onChange={(e) => setForm((f) => ({ ...f, titre: e.target.value }))}
              fullWidth
              autoFocus
              error={!form.titre.trim() && submitting}
              helperText={!form.titre.trim() && submitting ? 'Le titre est requis' : ''}
            />

            <TextField
              label="Début"
              type="datetime-local"
              value={form.dateDebut}
              onChange={(e) => setForm((f) => ({ ...f, dateDebut: e.target.value }))}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="Fin"
              type="datetime-local"
              value={form.dateFin}
              onChange={(e) => setForm((f) => ({ ...f, dateFin: e.target.value }))}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />

            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={form.type}
                label="Type"
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
              >
                {Object.entries(TYPE_CONFIG)
                  .filter(([k]) => k !== 'outlook')
                  .map(([k, v]) => (
                    <MenuItem key={k} value={k}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Icon icon={v.icon} width={16} />
                        {v.label}
                      </Box>
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Workspace</InputLabel>
              <Select
                value={form.workspace}
                label="Workspace"
                onChange={(e) => setForm((f) => ({ ...f, workspace: e.target.value }))}
              >
                <MenuItem value="bureau">Bureau</MenuItem>
                <MenuItem value="faytek">Faytek</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Lieu"
              value={form.lieu}
              onChange={(e) => setForm((f) => ({ ...f, lieu: e.target.value }))}
              fullWidth
            />

            <TextField
              label="Description"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              fullWidth
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseForm} disabled={submitting}>Annuler</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={14} /> : <Icon icon="mdi:check" />}
          >
            {submitting ? 'Création…' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
