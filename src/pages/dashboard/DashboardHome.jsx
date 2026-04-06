import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Grid, Card, CardContent, Typography, Box, Stack, Chip, LinearProgress } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import useAuth from '../../hooks/useAuth';
import { fetchTasks } from '../../redux/slices/taskSlice';
import { fetchProjects } from '../../redux/slices/projectSlice';
import { fetchExpenses } from '../../redux/slices/expenseSlice';

const activityData = [
  { day: 'Lun', tasks: 4 },
  { day: 'Mar', tasks: 7 },
  { day: 'Mer', tasks: 3 },
  { day: 'Jeu', tasks: 9 },
  { day: 'Ven', tasks: 6 },
  { day: 'Sam', tasks: 2 },
  { day: 'Dim', tasks: 5 },
];

const StatCard = ({ title, value, icon, color, subtitle }) => (
  <Card elevation={0} sx={{ height: '100%', border: (t) => `1px solid ${alpha(t.palette.divider, 0.5)}`, borderRadius: 2 }}>
    <CardContent>
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>{value}</Typography>
          <Typography variant="subtitle2" sx={{ color: 'text.secondary', mt: 0.5 }}>{title}</Typography>
          {subtitle && (
            <Chip
              label={subtitle}
              size="small"
              sx={{
                mt: 1, fontSize: 10, height: 20,
                bgcolor: (t) => alpha(t.palette[color]?.main || t.palette.primary.main, 0.1),
                color: `${color}.main`,
              }}
            />
          )}
        </Box>
        <Box
          sx={{
            width: 48, height: 48, borderRadius: 1.5,
            bgcolor: (t) => alpha(t.palette[color]?.main || t.palette.primary.main, 0.12),
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Icon icon={icon} width={24} color={`var(--mui-palette-${color}-main, currentColor)`} />
        </Box>
      </Stack>
    </CardContent>
  </Card>
);

const priorityColor = (p) => {
  if (p === 1 || p === 'urgent') return 'error';
  if (p === 2 || p === 'high') return 'warning';
  if (p === 3 || p === 'medium') return 'info';
  return 'default';
};

export default function DashboardHome() {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { list: tasks, total: totalTasks } = useSelector((s) => s.task);
  const { list: projects, total: totalProjects } = useSelector((s) => s.project);
  const { totalAmount } = useSelector((s) => s.expense);

  useEffect(() => {
    dispatch(fetchTasks({ limit: 10 }));
    dispatch(fetchProjects({ limit: 5 }));
    dispatch(fetchExpenses({ limit: 5 }));
  }, [dispatch]);

  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  const doneTasks = tasks.filter((t) => t.status === 'done').length;
  const progressPct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Bonjour {user?.prenom || user?.name || 'Ng'} 👋
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5, textTransform: 'capitalize' }}>
          {today}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Stat Cards */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Tâches actives" value={totalTasks} icon="eva:checkmark-square-2-fill" color="primary" subtitle="Ce mois" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Projets" value={totalProjects} icon="eva:folder-fill" color="info" subtitle="En cours" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Dépenses"
            value={`${(totalAmount || 0).toLocaleString('fr-FR')} XOF`}
            icon="eva:credit-card-fill"
            color="warning"
            subtitle="Ce mois"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Tâches terminées" value={doneTasks} icon="eva:done-all-fill" color="success" subtitle="Ce mois" />
        </Grid>

        {/* Productivity Chart */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card elevation={0} sx={{ border: (t) => `1px solid ${alpha(t.palette.divider, 0.5)}`, borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Activité cette semaine</Typography>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={activityData}>
                  <defs>
                    <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(145,158,171,0.2)" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }} />
                  <Area type="monotone" dataKey="tasks" stroke="#6366F1" strokeWidth={2} fill="url(#colorTasks)" name="Tâches" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Progress */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card elevation={0} sx={{ border: (t) => `1px solid ${alpha(t.palette.divider, 0.5)}`, borderRadius: 2, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Progression globale</Typography>
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h2" sx={{ fontWeight: 800, color: 'primary.main' }}>{progressPct}%</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>des tâches terminées</Typography>
                <LinearProgress
                  variant="determinate"
                  value={progressPct}
                  sx={{ height: 8, borderRadius: 4, bgcolor: (t) => alpha(t.palette.primary.main, 0.12) }}
                />
                <Typography variant="caption" sx={{ color: 'text.secondary', mt: 1, display: 'block' }}>
                  {doneTasks} / {totalTasks} tâches
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Tasks */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card elevation={0} sx={{ border: (t) => `1px solid ${alpha(t.palette.divider, 0.5)}`, borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Tâches récentes</Typography>
              {tasks.length === 0 ? (
                <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 3 }}>
                  Aucune tâche pour l&apos;instant
                </Typography>
              ) : (
                <Stack spacing={1.5}>
                  {tasks.slice(0, 6).map((task) => (
                    <Stack
                      key={task._id}
                      direction="row"
                      alignItems="center"
                      spacing={1.5}
                      sx={{ p: 1.5, borderRadius: 1, bgcolor: (t) => alpha(t.palette.grey[500], 0.06) }}
                    >
                      <Icon
                        icon={task.status === 'done' ? 'eva:checkmark-circle-2-fill' : 'eva:radio-button-off-fill'}
                        width={18}
                      />
                      <Typography
                        variant="body2"
                        sx={{
                          flexGrow: 1,
                          textDecoration: task.status === 'done' ? 'line-through' : 'none',
                          color: task.status === 'done' ? 'text.disabled' : 'text.primary',
                        }}
                        noWrap
                      >
                        {task.title}
                      </Typography>
                      {task.priority && (
                        <Chip
                          label={task.priority}
                          size="small"
                          color={priorityColor(task.priority)}
                          sx={{ fontSize: 10, height: 20 }}
                        />
                      )}
                    </Stack>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Active Projects */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card elevation={0} sx={{ border: (t) => `1px solid ${alpha(t.palette.divider, 0.5)}`, borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Projets actifs</Typography>
              {projects.length === 0 ? (
                <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 3 }}>
                  Aucun projet
                </Typography>
              ) : (
                <Stack spacing={1.5}>
                  {projects.slice(0, 5).map((project) => (
                    <Stack key={project._id} direction="row" alignItems="center" spacing={1.5}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main', flexShrink: 0 }} />
                      <Typography variant="body2" sx={{ flexGrow: 1 }} noWrap>
                        {project.name}
                      </Typography>
                      <Chip
                        label={project.status || 'actif'}
                        size="small"
                        sx={{
                          fontSize: 10, height: 20,
                          bgcolor: (t) => alpha(t.palette.success.main, 0.1),
                          color: 'success.main',
                        }}
                      />
                    </Stack>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </motion.div>
  );
}
