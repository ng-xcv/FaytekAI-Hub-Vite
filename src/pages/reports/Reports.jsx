import { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Stack, Card, CardContent, Grid, Button, Chip, CircularProgress,
  Divider, Alert, Tooltip as MuiTooltip,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { useSelector, useDispatch } from 'react-redux';
import { fetchTasks } from '../../redux/slices/taskSlice';
import { fetchProjects } from '../../redux/slices/projectSlice';
import { fetchExpenses } from '../../redux/slices/expenseSlice';
import axios from 'axios';

const COLORS = ['#6366F1', '#22D3EE', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6'];

const RAPPORT_TYPES = [
  { value: 'quotidien', label: 'Quotidien', icon: 'solar:calendar-minimalistic-bold' },
  { value: 'hebdomadaire', label: 'Hebdomadaire', icon: 'solar:calendar-bold' },
  { value: 'mensuel', label: 'Mensuel', icon: 'solar:calendar-date-bold' },
];

function StatCard({ title, value, icon, color }) {
  return (
    <Card elevation={0} sx={{ border: (t) => `1px solid ${alpha(t.palette.divider, 0.5)}`, borderRadius: 2 }}>
      <CardContent>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>{value}</Typography>
            <Typography variant="subtitle2" sx={{ color: 'text.secondary', mt: 0.5 }}>{title}</Typography>
          </Box>
          <Box sx={{
            width: 44, height: 44, borderRadius: 1.5,
            bgcolor: (t) => alpha(t.palette[color]?.main || t.palette.primary.main, 0.12),
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon icon={icon} width={22} />
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

// Export CSV basé sur la structure réelle du modèle
const exportCSV = (rapport) => {
  const debut = rapport.periode?.debut ? new Date(rapport.periode.debut).toLocaleDateString('fr-FR') : '';
  const fin = rapport.periode?.fin ? new Date(rapport.periode.fin).toLocaleDateString('fr-FR') : '';
  const c = rapport.contenu || {};
  const rows = [
    ['Champ', 'Valeur'],
    ['Type', rapport.type || ''],
    ['Période début', debut],
    ['Période fin', fin],
    ['Tâches terminées', c.tachesTerminees ?? 0],
    ['Tâches en cours', c.tachesEnCours ?? 0],
    ['Tâches en retard', c.tachesEnRetard ?? 0],
    ['Temps total (min)', c.tempsTotal ?? 0],
    ['Score productivité', c.scoreProductivite ?? 0],
    ['Résumé', `"${(c.resume || '').replace(/"/g, '""')}"`],
  ];
  const csv = rows.map((r) => r.join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `rapport-${rapport.type}-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

export default function Reports() {
  const dispatch = useDispatch();
  const { list: tasks, total: totalTasks } = useSelector((s) => s.task);
  const { list: projects } = useSelector((s) => s.project);
  const { list: expenses, totalAmount } = useSelector((s) => s.expense);

  const [typeSelectionne, setTypeSelectionne] = useState('mensuel');
  const [generating, setGenerating] = useState(false);
  const [loadingList, setLoadingList] = useState(false);
  const [rapports, setRapports] = useState([]);
  const [rapportActif, setRapportActif] = useState(null);
  const [erreur, setErreur] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Chargement des slices pour les KPI locaux
  useEffect(() => {
    dispatch(fetchTasks({}));
    dispatch(fetchProjects({}));
    dispatch(fetchExpenses({}));
  }, [dispatch]);

  // Liste des rapports existants
  const chargerRapports = useCallback(async () => {
    setLoadingList(true);
    try {
      const res = await axios.get('/api/report');
      // La route retourne directement un tableau
      setRapports(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Erreur chargement rapports:', err);
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    chargerRapports();
  }, [chargerRapports]);

  const genererRapport = async () => {
    setErreur('');
    setSuccessMsg('');
    setGenerating(true);
    try {
      const res = await axios.post('/api/report/generer', {
        type: typeSelectionne,
      });
      // La route retourne { message, data: rapport }
      const nouveau = res.data?.data || res.data;
      setSuccessMsg(`Rapport ${typeSelectionne} généré avec succès !`);
      setRapportActif(nouveau);
      await chargerRapports();
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur lors de la génération du rapport');
    } finally {
      setGenerating(false);
    }
  };

  // KPI locaux (depuis les slices)
  const doneTasks = tasks.filter((t) => t.status === 'done').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length;
  const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
  const activeProjects = projects.filter((p) => p.status !== 'termine' && p.status !== 'done').length;

  // PieChart tâches d'un rapport
  const buildTaskPieData = (rapport) => {
    const c = rapport?.contenu || {};
    const data = [
      { name: 'Terminées', value: c.tachesTerminees || 0 },
      { name: 'En cours', value: c.tachesEnCours || 0 },
      { name: 'En retard', value: c.tachesEnRetard || 0 },
    ].filter((d) => d.value > 0);
    return data;
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : '—';

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>Rapports 📊</Typography>
      </Stack>

      {/* === SECTION GÉNÉRATION === */}
      <Card elevation={0} sx={{ border: (t) => `1px solid ${alpha(t.palette.primary.main, 0.25)}`, borderRadius: 2, mb: 3, bgcolor: (t) => alpha(t.palette.primary.main, 0.03) }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            <Icon icon="solar:document-add-bold" style={{ marginRight: 8, verticalAlign: 'middle' }} />
            Générer un rapport
          </Typography>

          <Stack direction="row" spacing={1.5} sx={{ mb: 2.5, flexWrap: 'wrap', gap: 1 }}>
            {RAPPORT_TYPES.map((t) => (
              <Button
                key={t.value}
                variant={typeSelectionne === t.value ? 'contained' : 'outlined'}
                startIcon={<Icon icon={t.icon} />}
                onClick={() => setTypeSelectionne(t.value)}
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
              >
                {t.label}
              </Button>
            ))}
          </Stack>

          {erreur && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 1.5 }} onClose={() => setErreur('')}>
              {erreur}
            </Alert>
          )}
          {successMsg && (
            <Alert severity="success" sx={{ mb: 2, borderRadius: 1.5 }} onClose={() => setSuccessMsg('')}>
              {successMsg}
            </Alert>
          )}

          <Button
            variant="contained"
            size="large"
            onClick={genererRapport}
            disabled={generating}
            startIcon={generating ? <CircularProgress size={18} color="inherit" /> : <Icon icon="solar:play-bold" />}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, px: 4 }}
          >
            {generating ? 'Génération en cours…' : 'Générer le rapport'}
          </Button>
        </CardContent>
      </Card>

      {/* === KPI LOCAUX === */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard title="Tâches totales" value={totalTasks} icon="eva:checkmark-square-2-fill" color="primary" />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard title="Taux de complétion" value={`${completionRate}%`} icon="eva:trending-up-fill" color="success" />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard title="Projets actifs" value={activeProjects} icon="eva:folder-fill" color="info" />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard title="Dépenses totales" value={`${(totalAmount || 0).toLocaleString('fr-FR')} XOF`} icon="eva:credit-card-fill" color="warning" />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* === LISTE DES RAPPORTS === */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card elevation={0} sx={{ border: (t) => `1px solid ${alpha(t.palette.divider, 0.5)}`, borderRadius: 2, height: '100%' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Rapports générés</Typography>
                <MuiTooltip title="Actualiser">
                  <Button size="small" variant="text" onClick={chargerRapports} disabled={loadingList} sx={{ minWidth: 0, px: 1 }}>
                    <Icon icon="eva:refresh-fill" width={18} />
                  </Button>
                </MuiTooltip>
              </Stack>

              {loadingList ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress size={28} />
                </Box>
              ) : rapports.length === 0 ? (
                <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 6 }}>
                  Aucun rapport généré
                </Typography>
              ) : (
                <Stack spacing={1}>
                  {rapports.map((r) => (
                    <Box
                      key={r._id}
                      onClick={() => setRapportActif(r)}
                      sx={{
                        p: 1.5, borderRadius: 1.5, cursor: 'pointer',
                        border: (t) => `1px solid ${rapportActif?._id === r._id ? t.palette.primary.main : alpha(t.palette.divider, 0.5)}`,
                        bgcolor: (t) => rapportActif?._id === r._id ? alpha(t.palette.primary.main, 0.06) : 'transparent',
                        '&:hover': { bgcolor: (t) => alpha(t.palette.primary.main, 0.04) },
                        transition: 'all 0.15s',
                      }}
                    >
                      <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Box>
                          <Chip
                            label={r.type}
                            size="small"
                            color={r.type === 'quotidien' ? 'info' : r.type === 'hebdomadaire' ? 'success' : 'primary'}
                            sx={{ fontWeight: 600, fontSize: 10, height: 20, mb: 0.5 }}
                          />
                          <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                            {formatDate(r.periode?.debut)} – {formatDate(r.periode?.fin)}
                          </Typography>
                        </Box>
                        {r.genereParIA && (
                          <MuiTooltip title="Généré par IA">
                            <Icon icon="solar:stars-bold" color="#F59E0B" width={18} />
                          </MuiTooltip>
                        )}
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* === DÉTAIL DU RAPPORT ACTIF === */}
        <Grid size={{ xs: 12, md: 8 }}>
          <AnimatePresence mode="wait">
            {rapportActif ? (
              <motion.div
                key={rapportActif._id}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.25 }}
              >
                <Card elevation={0} sx={{ border: (t) => `1px solid ${alpha(t.palette.divider, 0.5)}`, borderRadius: 2 }}>
                  <CardContent>
                    {/* En-tête rapport */}
                    <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb: 2 }}>
                      <Box>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip
                            label={rapportActif.type}
                            color={rapportActif.type === 'quotidien' ? 'info' : rapportActif.type === 'hebdomadaire' ? 'success' : 'primary'}
                            sx={{ fontWeight: 700, textTransform: 'capitalize' }}
                          />
                          {rapportActif.genereParIA && (
                            <Chip label="IA" size="small" sx={{ bgcolor: '#FEF3C7', color: '#92400E', fontWeight: 700, fontSize: 10 }} icon={<Icon icon="solar:stars-bold" />} />
                          )}
                        </Stack>
                        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.75 }}>
                          {formatDate(rapportActif.periode?.debut)} → {formatDate(rapportActif.periode?.fin)}
                        </Typography>
                      </Box>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Icon icon="eva:download-fill" />}
                        onClick={() => exportCSV(rapportActif)}
                        sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 600 }}
                      >
                        Export CSV
                      </Button>
                    </Stack>

                    {/* Résumé IA */}
                    {rapportActif.contenu?.resume && (
                      <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: (t) => alpha(t.palette.info.main, 0.06), border: (t) => `1px solid ${alpha(t.palette.info.main, 0.2)}`, mb: 2.5 }}>
                        <Typography variant="body2" sx={{ color: 'text.primary', lineHeight: 1.7 }}>
                          {rapportActif.contenu.resume}
                        </Typography>
                      </Box>
                    )}

                    {/* KPIs du rapport */}
                    <Grid container spacing={2} sx={{ mb: 2.5 }}>
                      <Grid size={{ xs: 6, sm: 3 }}>
                        <Box sx={{ textAlign: 'center', p: 1.5, borderRadius: 1.5, bgcolor: (t) => alpha('#10B981', 0.08) }}>
                          <Typography variant="h5" sx={{ fontWeight: 800, color: '#10B981' }}>{rapportActif.contenu?.tachesTerminees ?? 0}</Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>Terminées</Typography>
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 6, sm: 3 }}>
                        <Box sx={{ textAlign: 'center', p: 1.5, borderRadius: 1.5, bgcolor: (t) => alpha('#6366F1', 0.08) }}>
                          <Typography variant="h5" sx={{ fontWeight: 800, color: '#6366F1' }}>{rapportActif.contenu?.tachesEnCours ?? 0}</Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>En cours</Typography>
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 6, sm: 3 }}>
                        <Box sx={{ textAlign: 'center', p: 1.5, borderRadius: 1.5, bgcolor: (t) => alpha('#EF4444', 0.08) }}>
                          <Typography variant="h5" sx={{ fontWeight: 800, color: '#EF4444' }}>{rapportActif.contenu?.tachesEnRetard ?? 0}</Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>En retard</Typography>
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 6, sm: 3 }}>
                        <Box sx={{ textAlign: 'center', p: 1.5, borderRadius: 1.5, bgcolor: (t) => alpha('#F59E0B', 0.08) }}>
                          <Typography variant="h5" sx={{ fontWeight: 800, color: '#F59E0B' }}>{rapportActif.contenu?.scoreProductivite ?? 0}%</Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>Score</Typography>
                        </Box>
                      </Grid>
                    </Grid>

                    {/* PieChart tâches */}
                    {buildTaskPieData(rapportActif).length > 0 && (
                      <>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Répartition des tâches</Typography>
                        <ResponsiveContainer width="100%" height={180}>
                          <PieChart>
                            <Pie
                              data={buildTaskPieData(rapportActif)}
                              cx="50%" cy="50%"
                              innerRadius={50} outerRadius={80}
                              dataKey="value" paddingAngle={3}
                            >
                              {buildTaskPieData(rapportActif).map((_, i) => (
                                <Cell key={i} fill={COLORS[i % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                        <Divider sx={{ my: 2 }} />
                      </>
                    )}

                    {/* Recommandations IA */}
                    {rapportActif.contenu?.recommandations?.length > 0 && (
                      <>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                          <Icon icon="solar:lightbulb-bold" style={{ marginRight: 6, verticalAlign: 'middle', color: '#F59E0B' }} />
                          Recommandations
                        </Typography>
                        <Stack spacing={0.75}>
                          {rapportActif.contenu.recommandations.map((rec, i) => (
                            <Stack key={i} direction="row" spacing={1} alignItems="flex-start">
                              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#6366F1', mt: 0.8, flexShrink: 0 }} />
                              <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>{rec}</Typography>
                            </Stack>
                          ))}
                        </Stack>
                        <Divider sx={{ my: 2 }} />
                      </>
                    )}

                    {/* Temps total */}
                    {rapportActif.contenu?.tempsTotal > 0 && (
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        ⏱ Temps total tracké : <strong>{Math.floor((rapportActif.contenu.tempsTotal || 0) / 60)}h {(rapportActif.contenu.tempsTotal || 0) % 60}min</strong>
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
                <Card elevation={0} sx={{ border: (t) => `1px solid ${alpha(t.palette.divider, 0.5)}`, borderRadius: 2, height: 360, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
                    <Icon icon="solar:document-text-bold" width={48} style={{ opacity: 0.3 }} />
                    <Typography variant="body2" sx={{ mt: 1, opacity: 0.6 }}>
                      Sélectionnez un rapport ou générez-en un nouveau
                    </Typography>
                  </Box>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </Grid>

        {/* === DÉPENSES PAR CATÉGORIE (depuis les slices locaux) === */}
        {expenses.length > 0 && (() => {
          const expenseCatData = Object.entries(
            expenses.reduce((acc, e) => {
              const cat = e.categorie || e.category || 'autre';
              acc[cat] = (acc[cat] || 0) + (e.montant || e.amount || 0);
              return acc;
            }, {})
          ).slice(0, 6).map(([name, value]) => ({ name, value }));

          return expenseCatData.length > 0 ? (
            <Grid size={{ xs: 12 }}>
              <Card elevation={0} sx={{ border: (t) => `1px solid ${alpha(t.palette.divider, 0.5)}`, borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Dépenses par catégorie</Typography>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={expenseCatData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(145,158,171,0.2)" />
                      <XAxis type="number" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={90} />
                      <Tooltip formatter={(v) => `${v.toLocaleString('fr-FR')} XOF`} contentStyle={{ borderRadius: 8, border: 'none' }} />
                      <Bar dataKey="value" fill="#F59E0B" radius={[0, 4, 4, 0]} name="Montant (XOF)" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          ) : null;
        })()}
      </Grid>
    </motion.div>
  );
}
