import { useEffect, useState } from 'react';
import {
  Box, Typography, Stack, Card, CardContent, Grid, Button, Chip, CircularProgress,
  Select, MenuItem, FormControl, InputLabel,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { useSelector, useDispatch } from 'react-redux';
import { fetchTasks } from '../../redux/slices/taskSlice';
import { fetchProjects } from '../../redux/slices/projectSlice';
import { fetchExpenses } from '../../redux/slices/expenseSlice';

const COLORS = ['#6366F1', '#22D3EE', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6'];

const TASK_STATUS_LABELS = { todo: 'À faire', in_progress: 'En cours', review: 'Révision', done: 'Terminé' };

function StatCard({ title, value, icon, color, change }) {
  return (
    <Card elevation={0} sx={{ border: (t) => `1px solid ${alpha(t.palette.divider, 0.5)}`, borderRadius: 2 }}>
      <CardContent>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>{value}</Typography>
            <Typography variant="subtitle2" sx={{ color: 'text.secondary', mt: 0.5 }}>{title}</Typography>
            {change && (
              <Chip
                label={change}
                size="small"
                color={change.startsWith('+') ? 'success' : 'error'}
                sx={{ mt: 1, height: 20, fontSize: 10 }}
              />
            )}
          </Box>
          <Box sx={{ width: 44, height: 44, borderRadius: 1.5, bgcolor: (t) => alpha(t.palette[color]?.main || t.palette.primary.main, 0.12), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon icon={icon} width={22} />
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function Reports() {
  const dispatch = useDispatch();
  const { list: tasks, total: totalTasks } = useSelector((s) => s.task);
  const { list: projects } = useSelector((s) => s.project);
  const { list: expenses, totalAmount } = useSelector((s) => s.expense);
  const [period, setPeriod] = useState('week');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      dispatch(fetchTasks({})),
      dispatch(fetchProjects({})),
      dispatch(fetchExpenses({})),
    ]).finally(() => setLoading(false));
  }, [dispatch]);

  // Task status distribution
  const taskStatusData = Object.entries(TASK_STATUS_LABELS).map(([status, label]) => ({
    name: label,
    value: tasks.filter((t) => t.status === status).length,
  })).filter((d) => d.value > 0);

  // Expense by category
  const expenseCatData = expenses.reduce((acc, e) => {
    const cat = e.categorie || e.category || 'autre';
    acc[cat] = (acc[cat] || 0) + (e.montant || e.amount || 0);
    return acc;
  }, {});
  const expenseChartData = Object.entries(expenseCatData).slice(0, 6).map(([name, value]) => ({ name, value }));

  // Weekly activity (mock)
  const weeklyData = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => ({
    day,
    taches: Math.floor(Math.random() * 8) + 1,
    done: Math.floor(Math.random() * 5),
  }));

  const doneTasks = tasks.filter((t) => t.status === 'done').length;
  const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>Rapports 📊</Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 130 }}>
            <Select value={period} onChange={(e) => setPeriod(e.target.value)}>
              <MenuItem value="week">Cette semaine</MenuItem>
              <MenuItem value="month">Ce mois</MenuItem>
              <MenuItem value="quarter">Ce trimestre</MenuItem>
            </Select>
          </FormControl>
          <Button variant="outlined" startIcon={<Icon icon="eva:download-fill" />} sx={{ borderRadius: 1.5 }}>
            Exporter
          </Button>
        </Stack>
      </Stack>

      {/* KPI Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard title="Tâches totales" value={totalTasks} icon="eva:checkmark-square-2-fill" color="primary" />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard title="Taux de complétion" value={`${completionRate}%`} icon="eva:trending-up-fill" color="success" change={`${doneTasks} terminées`} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard title="Projets actifs" value={projects.length} icon="eva:folder-fill" color="info" />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard title="Dépenses" value={`${(totalAmount || 0).toLocaleString('fr-FR')} XOF`} icon="eva:credit-card-fill" color="warning" />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Weekly Activity */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card elevation={0} sx={{ border: (t) => `1px solid ${alpha(t.palette.divider, 0.5)}`, borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Activité hebdomadaire</Typography>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(145,158,171,0.2)" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }} />
                  <Legend />
                  <Bar dataKey="taches" fill="#6366F1" name="Tâches" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="done" fill="#22D3EE" name="Terminées" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Task Status Pie */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card elevation={0} sx={{ border: (t) => `1px solid ${alpha(t.palette.divider, 0.5)}`, borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Répartition des tâches</Typography>
              {taskStatusData.length === 0 ? (
                <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 6 }}>Aucune donnée</Typography>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={taskStatusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                        {taskStatusData.map((_, index) => (
                          <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <Stack spacing={1}>
                    {taskStatusData.map((d, i) => (
                      <Stack key={d.name} direction="row" alignItems="center" spacing={1}>
                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: COLORS[i % COLORS.length], flexShrink: 0 }} />
                        <Typography variant="caption" sx={{ flexGrow: 1 }}>{d.name}</Typography>
                        <Typography variant="caption" sx={{ fontWeight: 700 }}>{d.value}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Expense Chart */}
        {expenseChartData.length > 0 && (
          <Grid size={{ xs: 12 }}>
            <Card elevation={0} sx={{ border: (t) => `1px solid ${alpha(t.palette.divider, 0.5)}`, borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Dépenses par catégorie</Typography>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={expenseChartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(145,158,171,0.2)" />
                    <XAxis type="number" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={90} />
                    <Tooltip formatter={(v) => `${v.toLocaleString('fr-FR')} XOF`} contentStyle={{ borderRadius: 8, border: 'none' }} />
                    <Bar dataKey="value" fill="#F59E0B" radius={[0, 4, 4, 0]} name="Montant" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </motion.div>
  );
}
