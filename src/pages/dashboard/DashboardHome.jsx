import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Grid, Card, CardContent, Typography, Box, Stack, Chip } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import useAuth from '../../hooks/useAuth';
import { fetchTasks } from '../../redux/slices/taskSlice';
import { fetchProjects } from '../../redux/slices/projectSlice';
import { fetchExpenses } from '../../redux/slices/expenseSlice';

const StatCard = ({ title, value, icon, color, subtitle }) => (
  <Card elevation={0} sx={{ height: '100%', border: (t) => `1px solid ${alpha(t.palette.divider, 0.5)}`, borderRadius: 2 }}>
    <CardContent>
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>{value}</Typography>
          <Typography variant="subtitle2" sx={{ color: 'text.secondary', mt: 0.5 }}>{title}</Typography>
          {subtitle && <Chip label={subtitle} size="small" sx={{ mt: 1, fontSize: 10, height: 20, bgcolor: (t) => alpha(t.palette[color]?.main || t.palette.primary.main, 0.1), color: `${color}.main` }} />}
        </Box>
        <Box sx={{ width: 48, height: 48, borderRadius: 1.5, bgcolor: (t) => alpha(t.palette[color]?.main || t.palette.primary.main, 0.12), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon icon={icon} width={24} />
        </Box>
      </Stack>
    </CardContent>
  </Card>
);

export default function DashboardHome() {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { list: tasks, total: totalTasks } = useSelector(s => s.task);
  const { list: projects, total: totalProjects } = useSelector(s => s.project);
  const { totalAmount } = useSelector(s => s.expense);

  useEffect(() => {
    dispatch(fetchTasks({ limit: 5 }));
    dispatch(fetchProjects({ limit: 5 }));
    dispatch(fetchExpenses({ limit: 5 }));
  }, [dispatch]);

  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>Bonjour {user?.prenom || 'Ng'} 👋</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5, textTransform: 'capitalize' }}>{today}</Typography>
      </Box>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Tâches actives" value={totalTasks} icon="eva:checkmark-square-2-fill" color="primary" subtitle="Ce mois" /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Projets" value={totalProjects} icon="eva:folder-fill" color="info" subtitle="En cours" /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Dépenses" value={`${(totalAmount || 0).toLocaleString('fr-FR')} XOF`} icon="eva:credit-card-fill" color="warning" subtitle="Ce mois" /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Tâches terminées" value={tasks.filter(t => t.status === 'done').length} icon="eva:done-all-fill" color="success" subtitle="Ce mois" /></Grid>
        <Grid item xs={12} md={7}>
          <Card elevation={0} sx={{ border: (t) => `1px solid ${alpha(t.palette.divider, 0.5)}`, borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Tâches récentes</Typography>
              {tasks.length === 0 ? (
                <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 3 }}>Aucune tâche pour l&apos;instant</Typography>
              ) : (
                <Stack spacing={1.5}>
                  {tasks.slice(0, 5).map((task) => (
                    <Stack key={task._id} direction="row" alignItems="center" spacing={1.5} sx={{ p: 1.5, borderRadius: 1, bgcolor: (t) => alpha(t.palette.grey[500], 0.08) }}>
                      <Icon icon={task.status === 'done' ? 'eva:checkmark-circle-2-fill' : 'eva:radio-button-off-fill'} width={18} />
                      <Typography variant="body2" sx={{ flexGrow: 1, textDecoration: task.status === 'done' ? 'line-through' : 'none', color: task.status === 'done' ? 'text.disabled' : 'text.primary' }} noWrap>{task.title}</Typography>
                      {task.priority && <Chip label={task.priority} size="small" sx={{ fontSize: 10, height: 20 }} />}
                    </Stack>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={5}>
          <Card elevation={0} sx={{ border: (t) => `1px solid ${alpha(t.palette.divider, 0.5)}`, borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Projets actifs</Typography>
              {projects.length === 0 ? (
                <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 3 }}>Aucun projet</Typography>
              ) : (
                <Stack spacing={1.5}>
                  {projects.slice(0, 4).map((project) => (
                    <Stack key={project._id} direction="row" alignItems="center" spacing={1.5}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main', flexShrink: 0 }} />
                      <Typography variant="body2" sx={{ flexGrow: 1 }} noWrap>{project.name}</Typography>
                      <Chip label={project.status || 'actif'} size="small" sx={{ fontSize: 10, height: 20, bgcolor: (t) => alpha(t.palette.success.main, 0.1), color: 'success.main' }} />
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
