import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Box, Typography, Stack, Card, CardContent, Button, TextField,
  Select, MenuItem, FormControl, InputLabel, CircularProgress, Alert,
  Checkbox, FormControlLabel, Divider,
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

const RECURRENCES = [
  { value: 'mensuel', label: 'Mensuel' },
  { value: 'hebdomadaire', label: 'Hebdomadaire' },
  { value: 'annuel', label: 'Annuel' },
];

export default function ExpenseNewEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState(null);
  const [isRecurrente, setIsRecurrente] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { isSubmitting, errors },
  } = useForm({
    defaultValues: {
      description: '',
      montant: '',
      categorie: 'autre',
      date: new Date().toISOString().split('T')[0],
      workspace: 'bureau',
      typeRecurrence: 'mensuel',
      dateRenouvellement: '',
    },
  });

  useEffect(() => {
    if (isEdit) {
      axiosInstance
        .get(`/api/expense/${id}`)
        .then(({ data }) => {
          const e = data.data || data;
          reset({
            description: e.description || '',
            montant: e.montant || '',
            categorie: e.categorie || 'autre',
            date: e.date ? e.date.split('T')[0] : new Date().toISOString().split('T')[0],
            workspace: e.workspace || 'bureau',
            typeRecurrence: 'mensuel',
            dateRenouvellement: '',
          });
        })
        .catch(() => setError('Impossible de charger la dépense'))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit, reset]);

  const onSubmit = async (formData) => {
    setError(null);
    try {
      const payload = {
        description: formData.description,
        montant: Number(formData.montant),
        categorie: formData.categorie,
        date: formData.date,
        workspace: formData.workspace,
      };

      let expenseResult;
      if (isEdit) {
        const action = await dispatch(updateExpense({ id, payload }));
        expenseResult = action.payload;
      } else {
        const action = await dispatch(createExpense(payload));
        expenseResult = action.payload;
      }

      // Si dépense récurrente et création réussie, créer la récurrence
      if (!isEdit && isRecurrente && expenseResult?._id) {
        if (!formData.typeRecurrence || !formData.dateRenouvellement) {
          setError('Type de récurrence et date de renouvellement requis');
          return;
        }
        await axiosInstance.post('/api/depense-recurrente', {
          depenseId: expenseResult._id,
          typeRecurrence: formData.typeRecurrence,
          dateRenouvellement: formData.dateRenouvellement,
        });
      }

      setSubmitSuccess(true);
      setTimeout(() => navigate('/dashboard/expenses/list'), 800);
    } catch (e) {
      setError("Erreur lors de l'enregistrement");
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 10 }}>
        <CircularProgress />
      </Box>
    );
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

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      {submitSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Dépense {isEdit ? 'modifiée' : 'créée'} avec succès !
        </Alert>
      )}

      <Card
        elevation={0}
        sx={{
          border: (t) => `1px solid ${alpha(t.palette.divider, 0.5)}`,
          borderRadius: 2,
          maxWidth: 640,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={3}>
              {/* Description */}
              <TextField
                {...register('description', { required: 'La description est requise' })}
                label="Description"
                fullWidth
                required
                autoFocus
                error={!!errors.description}
                helperText={errors.description?.message}
              />

              {/* Montant + Date */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  {...register('montant', {
                    required: 'Le montant est requis',
                    min: { value: 1, message: 'Le montant doit être positif' },
                  })}
                  label="Montant (XOF)"
                  type="number"
                  fullWidth
                  required
                  inputProps={{ min: 0, step: 100 }}
                  error={!!errors.montant}
                  helperText={errors.montant?.message}
                />
                <TextField
                  {...register('date')}
                  label="Date"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Stack>

              {/* Catégorie + Workspace */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <FormControl fullWidth>
                  <InputLabel>Catégorie</InputLabel>
                  <Controller
                    name="categorie"
                    control={control}
                    render={({ field }) => (
                      <Select {...field} label="Catégorie">
                        {CATEGORIES.map((c) => (
                          <MenuItem key={c.value} value={c.value}>
                            {c.label}
                          </MenuItem>
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
                          <MenuItem key={w.value} value={w.value}>
                            {w.label}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  />
                </FormControl>
              </Stack>

              {/* Dépense récurrente (seulement en création) */}
              {!isEdit && (
                <>
                  <Divider />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isRecurrente}
                        onChange={(e) => setIsRecurrente(e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Dépense récurrente"
                  />

                  {isRecurrente && (
                    <Stack spacing={2} sx={{ pl: 1 }}>
                      <FormControl fullWidth>
                        <InputLabel>Type de récurrence</InputLabel>
                        <Controller
                          name="typeRecurrence"
                          control={control}
                          rules={{ required: isRecurrente ? 'Type requis' : false }}
                          render={({ field }) => (
                            <Select {...field} label="Type de récurrence">
                              {RECURRENCES.map((r) => (
                                <MenuItem key={r.value} value={r.value}>
                                  {r.label}
                                </MenuItem>
                              ))}
                            </Select>
                          )}
                        />
                        {errors.typeRecurrence && (
                          <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                            {errors.typeRecurrence.message}
                          </Typography>
                        )}
                      </FormControl>

                      <TextField
                        {...register('dateRenouvellement', {
                          required: isRecurrente ? 'La date de renouvellement est requise' : false,
                        })}
                        label="Date de renouvellement"
                        type="date"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        error={!!errors.dateRenouvellement}
                        helperText={errors.dateRenouvellement?.message}
                      />
                    </Stack>
                  )}
                </>
              )}

              {/* Actions */}
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button onClick={() => navigate('/dashboard/expenses/list')} variant="outlined">
                  Annuler
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting || submitSuccess}
                  sx={{ borderRadius: 1.5, fontWeight: 700 }}
                  startIcon={
                    isSubmitting ? (
                      <CircularProgress size={16} />
                    ) : (
                      <Icon icon="eva:save-fill" />
                    )
                  }
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
