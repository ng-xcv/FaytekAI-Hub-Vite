import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Box, Typography, Stack, Card, CardContent, Button, TextField,
  Select, MenuItem, FormControl, InputLabel, CircularProgress, Alert,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { createExpense, updateExpense } from '../../redux/slices/expenseSlice';
import axiosInstance from '../../utils/axios';

const CATEGORIES = [
  { value: 'transport', label: 'Transport' },
  { value: 'restauration', label: 'Restauration' },
  { value: 'hebergement', label: 'Hébergement' },
  { value: 'materiel', label: 'Matériel' },
  { value: 'logiciel', label: 'Logiciel' },
  { value: 'communication', label: 'Communication' },
  { value: 'formation', label: 'Formation' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'fournitures', label: 'Fournitures' },
  { value: 'autre', label: 'Autre' },
];

const WORKSPACES = [
  { value: 'bureau', label: 'Bureau' },
  { value: 'faytek', label: 'Faytek' },
];

export default function ExpenseNewEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState(null);

  const { register, handleSubmit, reset, control, formState: { isSubmitting } } = useForm({
    defaultValues: {
      title: '', description: '', montant: '', categorie: 'autre',
      date: new Date().toISOString().split('T')[0], workspace: 'bureau', notes: '',
    },
  });

  useEffect(() => {
    if (isEdit) {
      axiosInstance.get(`/api/expenses/${id}`)
        .then(({ data }) => {
          const e = data.expense || data;
          reset({
            title: e.title || e.description || '',
            description: e.description || '',
            montant: e.montant || e.amount || '',
            categorie: e.categorie || 'autre',
            date: e.date ? e.date.split('T')[0] : new Date().toISOString().split('T')[0],
            workspace: e.workspace || 'bureau',
            notes: e.notes || '',
          });
        })
        .catch(() => setError('Impossible de charger la dépense'))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit, reset]);

  const onSubmit = async (data) => {
    const payload = { ...data, montant: Number(data.montant) };
    try {
      if (isEdit) {
        await dispatch(updateExpense({ id, payload }));
      } else {
        await dispatch(createExpense(payload));
      }
      navigate('/dashboard/expenses/list');
    } catch (e) {
      setError('Erreur lors de l\'enregistrement');
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', pt: 10 }}><CircularProgress /></Box>;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
        <Button
          startIcon={<Icon icon="eva:arrow-back-fill" />}
          onClick={() => navigate('/dashboard/expenses/list')}
          sx={{ color: 'text.secondary' }}
        >
          Retour
        </Button>
      </Stack>

      <Typography variant="h4" sx={{ fontWeight: 800, mb: 3 }}>
        {isEdit ? 'Modifier la dépense' : 'Nouvelle dépense'}
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Card elevation={0} sx={{ border: (t) => `1px solid ${alpha(t.palette.divider, 0.5)}`, borderRadius: 2, maxWidth: 640 }}>
        <CardContent sx={{ p: 3 }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={3}>
              <TextField {...register('title')} label="Titre / Description courte" fullWidth required autoFocus />

              <TextField {...register('description')} label="Description détaillée" fullWidth multiline rows={3} />

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  {...register('montant', { required: true, min: 0 })}
                  label="Montant (XOF)"
                  type="number"
                  fullWidth
                  required
                  inputProps={{ min: 0, step: 100 }}
                />
                <TextField
                  {...register('date')}
                  label="Date"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Stack>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <FormControl fullWidth>
                  <InputLabel>Catégorie</InputLabel>
                  <Controller
                    name="categorie"
                    control={control}
                    render={({ field }) => (
                      <Select {...field} label="Catégorie">
                        {CATEGORIES.map((c) => (
                          <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>
                        ))}
                      </Select>
                    )}
                  />
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Workspace</InputLabel>
                  <Controller
                    name="workspace"
                    control={control}
                    render={({ field }) => (
                      <Select {...field} label="Workspace">
                        {WORKSPACES.map((w) => (
                          <MenuItem key={w.value} value={w.value}>{w.label}</MenuItem>
                        ))}
                      </Select>
                    )}
                  />
                </FormControl>
              </Stack>

              <TextField {...register('notes')} label="Notes" fullWidth multiline rows={2} />

              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button onClick={() => navigate('/dashboard/expenses/list')} variant="outlined">
                  Annuler
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting}
                  sx={{ borderRadius: 1.5, fontWeight: 700 }}
                  startIcon={isSubmitting ? <CircularProgress size={16} /> : <Icon icon="eva:save-fill" />}
                >
                  {isEdit ? 'Enregistrer' : 'Créer la dépense'}
                </Button>
              </Stack>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
