import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Typography, Grid, Card, CardContent, Stack, Chip, Button, Tab, Tabs,
  LinearProgress, CircularProgress, Avatar, IconButton,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import axiosInstance from '../../utils/axios';
import { fetchTasks } from '../../redux/slices/taskSlice';

// ─── Configs ────────────────────────────────────────────────────────────────
const COLOR_MAP = {
  primary: '#6366f1',
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  default: '#6b7280',
};

const STATUS_CONFIG = {
  actif:    { label: 'Actif',    color: 'success' },
  en_pause: { label: 'En pause', color: 'warning' },
  termine:  { label: 'Terminé',  color: 'info'    },
  archive:  { label: 'Archivé',  color: 'error'   },
};

const TASK_STATUS = {
  todo:        { label: 'À faire',  color: 'default' },
  in_progress: { label: 'En cours', color: 'info'    },
  review:      { label: 'Révision', color: 'warning' },
  done:        { label: 'Terminé',  color: 'success' },
};

const PRIORITY_COLOR = {
  critique: '#ef4444',
  haute:    '#f97316',
  moyenne:  '#eab308',
  faible:   '#22c55e',
  high:     '#f97316',
  medium:   '#eab308',
  low:      '#22c55e',
};

// ─── TabPanel ────────────────────────────────────────────────────────────────

function TabPanel({ children, value, index }) {
  return value === index ? <Box sx={{ py: 3 }}>{children}</Box> : null;
}

// ─── GanttTab ────────────────────────────────────────────────────────────────

function GanttTab({ tasks }) {
  const tasksWithDate = tasks.filter((t) => t.dateEcheance);

  if (tasksWithDate.length === 0) {
    return (
      <Typography sx={{ color: 'text.secondary', textAlign: 'center', py: 4 }}>
        Aucune tâche avec date d'échéance
      </Typography>
    );
  }

  // Bornes temporelles
  const dates = tasksWithDate.map((t) => new Date(t.dateEcheance).getTime());
  const minDate = Math.min(...dates);
  const maxDate = Math.max(...dates);
  const range = maxDate - minDate || 1;
  const today = Date.now();

  return (
    <Box sx={{ overflowX: 'auto' }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
        Gantt — Tâches par échéance
      </Typography>

      {/* Timeline header */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '200px 1fr',
          gap: 1,
          mb: 1,
          px: 1,
        }}
      >
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
          Tâche
        </Typography>
        <Box sx={{ position: 'relative', height: 20 }}>
          {[0, 25, 50, 75, 100].map((pct) => (
            <Typography
              key={pct}
              variant="caption"
              sx={{
                position: 'absolute',
                left: `${pct}%`,
                transform: 'translateX(-50%)',
                color: 'text.disabled',
                fontSize: 10,
              }}
            >
              {new Date(minDate + (range * pct) / 100).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: 'short',
              })}
            </Typography>
          ))}
        </Box>
      </Box>

      <Stack spacing={1}>
        {tasksWithDate.map((task) => {
          const taskEnd = new Date(task.dateEcheance).getTime();
          const taskStart = task.dateDebut ? new Date(task.dateDebut).getTime() : minDate;
          const left = ((taskStart - minDate) / range) * 100;
          const width = Math.max(2, ((taskEnd - taskStart) / range) * 100);
          const color = PRIORITY_COLOR[task.priorite] || '#6366f1';
          const isOverdue = taskEnd < today && task.statut !== 'done';

          return (
            <Box
              key={task._id}
              sx={{
                display: 'grid',
                gridTemplateColumns: '200px 1fr',
                gap: 1,
                alignItems: 'center',
                px: 1,
                py: 0.5,
                borderRadius: 1,
                '&:hover': { bgcolor: (t) => alpha(t.palette.action.hover, 0.04) },
              }}
            >
              {/* Label */}
              <Stack direction="row" alignItems="center" spacing={0.75}>
                <Chip
                  label={TASK_STATUS[task.statut]?.label || task.statut || '—'}
                  size="small"
                  color={TASK_STATUS[task.statut]?.color || 'default'}
                  sx={{ height: 18, fontSize: 10, maxWidth: 80 }}
                />
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 500,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    color: isOverdue ? 'error.main' : 'text.primary',
                  }}
                >
                  {task.titre}
                </Typography>
              </Stack>

              {/* Barre */}
              <Box sx={{ position: 'relative', height: 22, bgcolor: (t) => alpha(t.palette.divider, 0.3), borderRadius: 1 }}>
                <Box
                  sx={{
                    position: 'absolute',
                    left: `${left}%`,
                    width: `${width}%`,
                    height: '100%',
                    borderRadius: 1,
                    bgcolor: isOverdue ? '#ef4444' : color,
                    opacity: 0.85,
                    display: 'flex',
                    alignItems: 'center',
                    px: 0.5,
                    minWidth: 4,
                    transition: 'opacity 0.2s',
                    '&:hover': { opacity: 1 },
                  }}
                  title={`${task.titre} — échéance : ${new Date(task.dateEcheance).toLocaleDateString('fr-FR')}`}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#fff',
                      fontSize: 9,
                      fontWeight: 700,
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {new Date(task.dateEcheance).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                  </Typography>
                </Box>
              </Box>
            </Box>
          );
        })}
      </Stack>

      {/* Légende priorités */}
      <Stack direction="row" spacing={2} sx={{ mt: 3, flexWrap: 'wrap' }}>
        {Object.entries(PRIORITY_COLOR)
          .filter(([k]) => ['critique', 'haute', 'moyenne', 'faible'].includes(k))
          .map(([k, c]) => (
            <Stack key={k} direction="row" alignItems="center" spacing={0.5}>
              <Box sx={{ width: 12, height: 12, borderRadius: 0.5, bgcolor: c }} />
              <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'capitalize' }}>
                {k}
              </Typography>
            </Stack>
          ))}
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <Box sx={{ width: 12, height: 12, borderRadius: 0.5, bgcolor: '#ef4444' }} />
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>En retard</Typography>
        </Stack>
      </Stack>
    </Box>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { list: allTasks } = useSelector((s) => s.task);
  const [projet, setProjet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await axiosInstance.get(`/api/project/${id}`);
        setProjet(data);
      } catch (e) {
        console.error('Erreur chargement projet:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
    dispatch(fetchTasks({ projet: id }));
  }, [id, dispatch]);

  // Filtrer les tâches du projet (champ `projet` peut être ObjectId string ou objet populé)
  const projectTasks = allTasks.filter(
    (t) => t.projet === id || t.projet?._id?.toString() === id
  );

  const doneTasks = projectTasks.filter((t) => t.statut === 'done').length;
  const progression =
    projectTasks.length > 0
      ? Math.round((doneTasks / projectTasks.length) * 100)
      : projet?.progression || 0;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!projet) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography>Projet introuvable</Typography>
        <Button onClick={() => navigate('/dashboard/projects/list')} sx={{ mt: 2 }}>
          Retour aux projets
        </Button>
      </Box>
    );
  }

  const cfg = STATUS_CONFIG[projet.statut] || { label: projet.statut || 'actif', color: 'default' };
  const proprietaire = projet.proprietaire;
  const nomProprietaire = proprietaire
    ? `${proprietaire.prenom || ''} ${proprietaire.nom || ''}`.trim() || proprietaire.email
    : '—';

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      {/* Breadcrumb */}
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
        <IconButton size="small" onClick={() => navigate('/dashboard/projects/list')}>
          <Icon icon="eva:arrow-back-fill" />
        </IconButton>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>Projets</Typography>
      </Stack>

      {/* Header */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        alignItems={{ md: 'center' }}
        justifyContent="space-between"
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>{projet.nom}</Typography>
          {projet.description && (
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              {projet.description}
            </Typography>
          )}
        </Box>
        <Stack direction="row" spacing={1} sx={{ mt: { xs: 2, md: 0 } }}>
          <Chip label={cfg.label} color={cfg.color} />
          <Button
            variant="contained"
            startIcon={<Icon icon="eva:edit-fill" />}
            sx={{ borderRadius: 1.5, fontWeight: 700 }}
          >
            Modifier
          </Button>
        </Stack>
      </Stack>

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Tâches totales', value: projectTasks.length, icon: 'eva:checkmark-square-2-fill', color: 'primary' },
          { label: 'Terminées', value: doneTasks, icon: 'eva:done-all-fill', color: 'success' },
          { label: 'En cours', value: projectTasks.filter((t) => t.statut === 'in_progress').length, icon: 'eva:loader-fill', color: 'info' },
          { label: 'Propriétaire', value: nomProprietaire, icon: 'eva:person-fill', color: 'warning' },
        ].map((s) => (
          <Grid key={s.label} size={{ xs: 6, md: 3 }}>
            <Card
              elevation={0}
              sx={{ border: (t) => `1px solid ${alpha(t.palette.divider, 0.5)}`, borderRadius: 2 }}
            >
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Box
                    sx={{
                      width: 40, height: 40, borderRadius: 1.5,
                      bgcolor: (t) => alpha(COLOR_MAP[s.color] || '#6366f1', 0.12),
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <Icon icon={s.icon} width={20} />
                  </Box>
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 800, lineHeight: 1, fontSize: typeof s.value === 'string' ? 13 : undefined }}
                      noWrap
                    >
                      {s.value}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>{s.label}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Progression */}
      <Card
        elevation={0}
        sx={{ border: (t) => `1px solid ${alpha(t.palette.divider, 0.5)}`, borderRadius: 2, mb: 3 }}
      >
        <CardContent>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Progression globale</Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main' }}>{progression}%</Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={progression}
            sx={{ height: 10, borderRadius: 5, bgcolor: (t) => alpha(t.palette.primary.main, 0.12) }}
          />
          <Typography variant="caption" sx={{ color: 'text.secondary', mt: 1, display: 'block' }}>
            {doneTasks} / {projectTasks.length} tâches terminées
          </Typography>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{ mb: 1, borderBottom: (t) => `1px solid ${alpha(t.palette.divider, 0.4)}` }}
      >
        <Tab label="Tâches" />
        <Tab label="Membres" />
        <Tab label="Détails" />
        <Tab label="Gantt" />
      </Tabs>

      {/* Tab 0 — Tâches */}
      <TabPanel value={tab} index={0}>
        {projectTasks.length === 0 ? (
          <Typography sx={{ color: 'text.secondary', textAlign: 'center', py: 4 }}>
            Aucune tâche pour ce projet
          </Typography>
        ) : (
          <Stack spacing={1.5}>
            {projectTasks.map((tache) => {
              const tc = TASK_STATUS[tache.statut] || { label: tache.statut || '—', color: 'default' };
              return (
                <Card
                  key={tache._id}
                  elevation={0}
                  sx={{ border: (t) => `1px solid ${alpha(t.palette.divider, 0.4)}`, borderRadius: 1.5 }}
                >
                  <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Typography variant="body2" sx={{ flexGrow: 1, fontWeight: 500 }} noWrap>
                        {tache.titre}
                      </Typography>
                      <Chip label={tc.label} size="small" color={tc.color} sx={{ height: 20, fontSize: 10 }} />
                    </Stack>
                  </CardContent>
                </Card>
              );
            })}
          </Stack>
        )}
      </TabPanel>

      {/* Tab 1 — Membres */}
      <TabPanel value={tab} index={1}>
        {(projet.membres || []).length === 0 ? (
          <Typography sx={{ color: 'text.secondary', textAlign: 'center', py: 4 }}>Aucun membre</Typography>
        ) : (
          <Stack spacing={1.5}>
            {(projet.membres || []).map((m, i) => {
              const u = m.user || m;
              const label = u?.prenom
                ? `${u.prenom} ${u.nom || ''}`.trim()
                : u?.email || (typeof u === 'string' ? u : '—');
              return (
                <Stack key={i} direction="row" alignItems="center" spacing={1.5}>
                  <Avatar sx={{ width: 36, height: 36 }}>{label[0]?.toUpperCase()}</Avatar>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{label}</Typography>
                    {m.role && (
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>{m.role}</Typography>
                    )}
                  </Box>
                </Stack>
              );
            })}
          </Stack>
        )}
      </TabPanel>

      {/* Tab 2 — Détails */}
      <TabPanel value={tab} index={2}>
        <Stack spacing={2}>
          {[
            { label: 'Statut', value: cfg.label },
            { label: 'Propriétaire', value: nomProprietaire },
            { label: 'Date début', value: projet.dateDebut ? new Date(projet.dateDebut).toLocaleDateString('fr-FR') : '—' },
            { label: 'Date fin', value: projet.dateFin ? new Date(projet.dateFin).toLocaleDateString('fr-FR') : '—' },
            { label: 'Créé le', value: projet.createdAt ? new Date(projet.createdAt).toLocaleDateString('fr-FR') : '—' },
            { label: 'Modifié le', value: projet.updatedAt ? new Date(projet.updatedAt).toLocaleDateString('fr-FR') : '—' },
          ].map((r) => (
            <Stack key={r.label} direction="row" spacing={2}>
              <Typography variant="body2" sx={{ color: 'text.secondary', width: 140, flexShrink: 0 }}>
                {r.label}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{r.value}</Typography>
            </Stack>
          ))}
          {projet.tags && projet.tags.length > 0 && (
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Typography variant="body2" sx={{ color: 'text.secondary', width: 140 }}>Tags</Typography>
              <Stack direction="row" spacing={0.5} flexWrap="wrap">
                {projet.tags.map((tag, i) => (
                  <Chip key={i} label={tag} size="small" sx={{ height: 20, fontSize: 11 }} />
                ))}
              </Stack>
            </Stack>
          )}
        </Stack>
      </TabPanel>

      {/* Tab 3 — Gantt */}
      <TabPanel value={tab} index={3}>
        <GanttTab tasks={projectTasks} />
      </TabPanel>
    </motion.div>
  );
}
