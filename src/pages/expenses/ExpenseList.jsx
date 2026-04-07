import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Stack, Card, CardContent, Button, TextField, InputAdornment,
  Select, MenuItem, Chip, IconButton, CircularProgress, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, Alert, Badge, Collapse,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  fetchExpenses,
  fetchExpenseStats,
  deleteExpense,
  fetchAlertes,
  marquerAlerteLue,
} from '../../redux/slices/expenseSlice';

const COLOR_MAP = {
  primary: '#6366f1',
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  default: '#6b7280',
};


const CATEGORY_LABELS = {
  transport: 'Transport', restauration: 'Restauration', hebergement: 'Hébergement',
  materiel: 'Matériel', logiciel: 'Logiciel', communication: 'Communication',
  formation: 'Formation', marketing: 'Marketing', fournitures: 'Fournitures', autre: 'Autre',
};

// Mois courant par défaut
const getCurrentMonthFilter = () => {
  const now = new Date();
  return { mois: now.getMonth() + 1, annee: now.getFullYear() };
};

export default function ExpenseList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list: expenses, isLoading, totalAmount, stats, alertes } = useSelector((s) => s.expense);
  const [filterCat, setFilterCat] = useState('all');
  const [showAlertes, setShowAlertes] = useState(true);
  const { mois, annee } = getCurrentMonthFilter();

  useEffect(() => {
    dispatch(fetchExpenses({ mois, annee }));
    dispatch(fetchExpenseStats({ mois, annee }));
    dispatch(fetchAlertes());
  }, [dispatch, mois, annee]);

  const filtered = expenses.filter((e) => {
    return filterCat === 'all' || e.categorie === filterCat;
  });

  // Données pour le graphique trend (depuis stats)
  const trendData = (stats.trend || []).map((t) => ({
    name: t.label || `${t.mois}/${t.annee}`,
    total: t.total,
  }));

  // Top catégories depuis stats
  const topCategories = (stats.byCategory || []).slice(0, 5);

  const handleDelete = (id) => {
    if (window.confirm('Supprimer cette dépense ?')) dispatch(deleteExpense(id));
  };

  const handleMarquerLue = (alerteId) => {
    dispatch(marquerAlerteLue(alerteId));
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>Dépenses</Typography>
        <Stack direction="row" spacing={1.5} alignItems="center">
          {alertes.length > 0 && (
            <Badge badgeContent={alertes.length} color="error">
              <Button
                variant="outlined"
                color="warning"
                size="small"
                startIcon={<Icon icon="eva:bell-fill" />}
                onClick={() => setShowAlertes((v) => !v)}
                sx={{ borderRadius: 1.5 }}
              >
                Alertes
              </Button>
            </Badge>
          )}
          <Button
            variant="contained"
            startIcon={<Icon icon="eva:plus-fill" />}
            onClick={() => navigate('/dashboard/expenses/new')}
            sx={{ borderRadius: 1.5, fontWeight: 700 }}
          >
            Nouvelle dépense
          </Button>
        </Stack>
      </Stack>

      {/* Alertes banner */}
      <Collapse in={showAlertes && alertes.length > 0}>
        <Stack spacing={1} sx={{ mb: 3 }}>
          {alertes.map((alerte) => (
            <Alert
              key={alerte._id}
              severity="warning"
              icon={<Icon icon="eva:clock-fill" />}
              action={
                <Button
                  size="small"
                  color="warning"
                  onClick={() => handleMarquerLue(alerte._id)}
                  sx={{ fontWeight: 600, fontSize: 11 }}
                >
                  Marquer comme lue
                </Button>
              }
            >
              <strong>[{alerte.type}]</strong> {alerte.message}
            </Alert>
          ))}
        </Stack>
      </Collapse>

      {/* Stats Row */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
        {[
          {
            label: 'Total du mois',
            value: `${(stats.summary?.total || totalAmount || 0).toLocaleString('fr-FR')} XOF`,
            icon: 'eva:credit-card-fill',
            color: 'primary',
          },
          {
            label: 'Nombre de dépenses',
            value: stats.summary?.count || expenses.length,
            icon: 'eva:file-text-fill',
            color: 'info',
          },
          {
            label: 'Moyenne',
            value: stats.summary?.moyenne
              ? `${Math.round(stats.summary.moyenne).toLocaleString('fr-FR')} XOF`
              : expenses.length > 0
              ? `${Math.round((totalAmount || 0) / expenses.length).toLocaleString('fr-FR')} XOF`
              : '—',
            icon: 'eva:trending-up-fill',
            color: 'success',
          },
        ].map((s) => (
          <Card
            key={s.label}
            elevation={0}
            sx={{ flex: 1, border: (t) => `1px solid ${alpha(t.palette.divider, 0.5)}`, borderRadius: 2 }}
          >
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Box
                  sx={{
                    width: 44, height: 44, borderRadius: 1.5,
                    bgcolor: (t) => alpha(COLOR_MAP[s.color] || '#6366f1', 0.12),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <Icon icon={s.icon} width={22} />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>{s.value}</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>{s.label}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>

      {/* Charts row */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }}>
        {/* Trend chart */}
        {trendData.length > 0 && (
          <Card
            elevation={0}
            sx={{ flex: 2, border: (t) => `1px solid ${alpha(t.palette.divider, 0.5)}`, borderRadius: 2 }}
          >
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Tendance mensuelle</Typography>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(145,158,171,0.2)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(v) => `${v.toLocaleString('fr-FR')} XOF`}
                    contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
                  />
                  <Bar dataKey="total" fill="#6366F1" radius={[4, 4, 0, 0]} name="Montant" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Top catégories */}
        {topCategories.length > 0 && (
          <Card
            elevation={0}
            sx={{ flex: 1, border: (t) => `1px solid ${alpha(t.palette.divider, 0.5)}`, borderRadius: 2 }}
          >
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Top catégories</Typography>
              <Stack spacing={1.5}>
                {topCategories.map((cat) => (
                  <Stack key={cat.categorie} direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {CATEGORY_LABELS[cat.categorie] || cat.categorie}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      {cat.total.toLocaleString('fr-FR')} XOF
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>
        )}
      </Stack>

      {/* Filtre catégorie */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
        <Select
          size="small"
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value)}
          sx={{ minWidth: 220 }}
        >
          <MenuItem value="all">Toutes les catégories</MenuItem>
          {Object.entries(CATEGORY_LABELS).map(([v, l]) => (
            <MenuItem key={v} value={v}>{l}</MenuItem>
          ))}
        </Select>
        <Typography variant="body2" sx={{ color: 'text.secondary', alignSelf: 'center' }}>
          {filtered.length} dépense{filtered.length > 1 ? 's' : ''}
        </Typography>
      </Stack>

      {/* Table */}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{ border: (t) => `1px solid ${alpha(t.palette.divider, 0.5)}`, borderRadius: 2 }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: (t) => alpha(t.palette.grey[500], 0.05) }}>
                {['Description', 'Catégorie', 'Montant', 'Date', 'Actions'].map((h) => (
                  <TableCell
                    key={h}
                    sx={{ fontWeight: 700, fontSize: 12, textTransform: 'uppercase', color: 'text.secondary' }}
                  >
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
                    Aucune dépense pour cette période
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((expense) => (
                  <TableRow
                    key={expense._id}
                    sx={{ '&:hover': { bgcolor: (t) => alpha(t.palette.grey[500], 0.04) } }}
                  >
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {expense.description || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={CATEGORY_LABELS[expense.categorie] || expense.categorie || '—'}
                        size="small"
                        sx={{ height: 22, fontSize: 11 }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>
                      {(expense.montant || 0).toLocaleString('fr-FR')} XOF
                    </TableCell>
                    <TableCell sx={{ color: 'text.secondary', fontSize: 13 }}>
                      {expense.date ? new Date(expense.date).toLocaleDateString('fr-FR') : '—'}
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5}>
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/dashboard/expenses/${expense._id}/edit`)}
                        >
                          <Icon icon="eva:edit-2-fill" width={16} />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDelete(expense._id)}>
                          <Icon icon="eva:trash-2-fill" width={16} />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </motion.div>
  );
}
