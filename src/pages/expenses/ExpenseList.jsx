import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Stack, Card, CardContent, Button, TextField, InputAdornment,
  Select, MenuItem, Chip, IconButton, CircularProgress, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchExpenses, deleteExpense } from '../../redux/slices/expenseSlice';

const CATEGORY_LABELS = {
  transport: 'Transport', restauration: 'Restauration', hebergement: 'Hébergement',
  materiel: 'Matériel', logiciel: 'Logiciel', communication: 'Communication',
  formation: 'Formation', marketing: 'Marketing', fournitures: 'Fournitures', autre: 'Autre',
};

const STATUS_CONFIG = {
  pending: { label: 'En attente', color: 'warning' },
  approved: { label: 'Approuvé', color: 'success' },
  rejected: { label: 'Rejeté', color: 'error' },
};

export default function ExpenseList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list: expenses, isLoading, totalAmount } = useSelector((s) => s.expense);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('all');

  useEffect(() => {
    dispatch(fetchExpenses({}));
  }, [dispatch]);

  const filtered = expenses.filter((e) => {
    const matchSearch = !search || e.title?.toLowerCase().includes(search.toLowerCase()) || e.description?.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === 'all' || e.categorie === filterCat;
    return matchSearch && matchCat;
  });

  // Build chart data by category
  const catTotals = filtered.reduce((acc, e) => {
    const cat = CATEGORY_LABELS[e.categorie] || e.categorie || 'Autre';
    acc[cat] = (acc[cat] || 0) + (e.montant || e.amount || 0);
    return acc;
  }, {});
  const chartData = Object.entries(catTotals).slice(0, 6).map(([name, value]) => ({ name, value }));

  const handleDelete = (id) => {
    if (window.confirm('Supprimer cette dépense ?')) dispatch(deleteExpense(id));
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>Dépenses</Typography>
        <Button
          variant="contained"
          startIcon={<Icon icon="eva:plus-fill" />}
          onClick={() => navigate('/dashboard/expenses/new')}
          sx={{ borderRadius: 1.5, fontWeight: 700 }}
        >
          Nouvelle dépense
        </Button>
      </Stack>

      {/* Stats Row */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Total du mois', value: `${(totalAmount || 0).toLocaleString('fr-FR')} XOF`, icon: 'eva:credit-card-fill', color: 'primary' },
          { label: 'Nombre', value: expenses.length, icon: 'eva:file-text-fill', color: 'info' },
          { label: 'Moyenne', value: expenses.length > 0 ? `${Math.round((totalAmount || 0) / expenses.length).toLocaleString('fr-FR')} XOF` : '—', icon: 'eva:trending-up-fill', color: 'success' },
        ].map((s) => (
          <Card key={s.label} elevation={0} sx={{ flex: 1, border: (t) => `1px solid ${alpha(t.palette.divider, 0.5)}`, borderRadius: 2 }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Box sx={{ width: 44, height: 44, borderRadius: 1.5, bgcolor: (t) => alpha(t.palette[s.color].main, 0.12), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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

      {/* Chart */}
      {chartData.length > 0 && (
        <Card elevation={0} sx={{ border: (t) => `1px solid ${alpha(t.palette.divider, 0.5)}`, borderRadius: 2, mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Dépenses par catégorie</Typography>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(145,158,171,0.2)" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v) => `${v.toLocaleString('fr-FR')} XOF`} contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }} />
                <Bar dataKey="value" fill="#6366F1" radius={[4, 4, 0, 0]} name="Montant" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
        <TextField
          size="small"
          placeholder="Rechercher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><Icon icon="eva:search-fill" width={18} /></InputAdornment> }}
          sx={{ flexGrow: 1 }}
        />
        <Select size="small" value={filterCat} onChange={(e) => setFilterCat(e.target.value)} sx={{ minWidth: 180 }}>
          <MenuItem value="all">Toutes les catégories</MenuItem>
          {Object.entries(CATEGORY_LABELS).map(([v, l]) => (
            <MenuItem key={v} value={v}>{l}</MenuItem>
          ))}
        </Select>
      </Stack>

      {/* Table */}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ border: (t) => `1px solid ${alpha(t.palette.divider, 0.5)}`, borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: (t) => alpha(t.palette.grey[500], 0.05) }}>
                {['Description', 'Catégorie', 'Montant', 'Date', 'Statut', 'Actions'].map((h) => (
                  <TableCell key={h} sx={{ fontWeight: 700, fontSize: 12, textTransform: 'uppercase', color: 'text.secondary' }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
                    Aucune dépense
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((expense) => {
                  const sc = STATUS_CONFIG[expense.statut || expense.status] || { label: expense.statut || expense.status || '—', color: 'default' };
                  return (
                    <TableRow key={expense._id} sx={{ '&:hover': { bgcolor: (t) => alpha(t.palette.grey[500], 0.04) } }}>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>{expense.title || expense.description || '—'}</Typography>
                        {expense.description && expense.title && (
                          <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap>{expense.description}</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip label={CATEGORY_LABELS[expense.categorie] || expense.categorie || '—'} size="small" sx={{ height: 22, fontSize: 11 }} />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>
                        {(expense.montant || expense.amount || 0).toLocaleString('fr-FR')} XOF
                      </TableCell>
                      <TableCell sx={{ color: 'text.secondary', fontSize: 13 }}>
                        {expense.date ? new Date(expense.date).toLocaleDateString('fr-FR') : '—'}
                      </TableCell>
                      <TableCell>
                        <Chip label={sc.label} size="small" color={sc.color} sx={{ height: 22, fontSize: 11 }} />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5}>
                          <IconButton size="small" onClick={() => navigate(`/dashboard/expenses/${expense._id}/edit`)}>
                            <Icon icon="eva:edit-2-fill" width={16} />
                          </IconButton>
                          <IconButton size="small" color="error" onClick={() => handleDelete(expense._id)}>
                            <Icon icon="eva:trash-2-fill" width={16} />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </motion.div>
  );
}
