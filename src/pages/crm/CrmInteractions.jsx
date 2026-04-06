import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Typography, Stack, Card, CardContent, Button, Chip, CircularProgress,
  Avatar, Divider, TextField, InputAdornment, Select, MenuItem,
  Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { fetchInteractions, fetchContacts } from '../../redux/slices/crmSlice';
import axiosInstance from '../../utils/axios';

const TYPE_CONFIG = {
  appel: { label: 'Appel', icon: 'eva:phone-fill', color: 'info' },
  email: { label: 'Email', icon: 'eva:email-fill', color: 'primary' },
  reunion: { label: 'Réunion', icon: 'eva:people-fill', color: 'warning' },
  whatsapp: { label: 'WhatsApp', icon: 'eva:message-circle-fill', color: 'success' },
  visite: { label: 'Visite', icon: 'eva:pin-fill', color: 'error' },
  autre: { label: 'Autre', icon: 'eva:more-horizontal-fill', color: 'default' },
};

function InteractionFormDialog({ open, onClose, contacts }) {
  const { register, handleSubmit, reset, control } = useForm({
    defaultValues: { contact_id: '', type: 'appel', notes: '', date: new Date().toISOString().split('T')[0], outcome: '' },
  });
  useEffect(() => { if (open) reset(); }, [open, reset]);
  const onSubmit = async (data) => {
    try {
      await axiosInstance.post(`/api/crm/contacts/${data.contact_id}/interactions`, data);
    } catch {}
    onClose();
  };
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle sx={{ fontWeight: 700 }}>Nouvelle interaction</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <FormControl fullWidth required>
              <InputLabel>Contact</InputLabel>
              <Controller name="contact_id" control={control} render={({ field }) => (
                <Select {...field} label="Contact">
                  {contacts.map((c) => <MenuItem key={c._id || c.id} value={c._id || c.id}>{c.company_name} {c.contact_name ? `- ${c.contact_name}` : ''}</MenuItem>)}
                </Select>
              )} />
            </FormControl>
            <Stack direction="row" spacing={2}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Controller name="type" control={control} render={({ field }) => (
                  <Select {...field} label="Type">
                    {Object.entries(TYPE_CONFIG).map(([v, c]) => <MenuItem key={v} value={v}>{c.label}</MenuItem>)}
                  </Select>
                )} />
              </FormControl>
              <TextField {...register('date')} label="Date" type="date" fullWidth InputLabelProps={{ shrink: true }} />
            </Stack>
            <TextField {...register('notes')} label="Notes / Résumé" fullWidth multiline rows={3} autoFocus />
            <TextField {...register('outcome')} label="Issue / Prochain RDV" fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={onClose} variant="outlined">Annuler</Button>
          <Button type="submit" variant="contained" sx={{ borderRadius: 1.5, fontWeight: 700 }}>Enregistrer</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default function CrmInteractions() {
  const dispatch = useDispatch();
  const { interactions, contacts, isLoading } = useSelector((s) => s.crm);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchInteractions({}));
    dispatch(fetchContacts({}));
  }, [dispatch]);

  const filtered = interactions.filter((i) => {
    const matchSearch = !search || i.notes?.toLowerCase().includes(search.toLowerCase()) || i.contact?.company_name?.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'all' || i.type === filterType;
    return matchSearch && matchType;
  });

  // Group by date
  const groups = filtered.reduce((acc, item) => {
    const date = item.date || item.createdAt || new Date().toISOString();
    const key = new Date(date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>Interactions CRM</Typography>
        <Button
          variant="contained"
          startIcon={<Icon icon="eva:plus-fill" />}
          onClick={() => setDialogOpen(true)}
          sx={{ borderRadius: 1.5, fontWeight: 700 }}
        >
          Nouvelle interaction
        </Button>
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <TextField
          size="small"
          placeholder="Rechercher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><Icon icon="eva:search-fill" width={18} /></InputAdornment> }}
          sx={{ flexGrow: 1 }}
        />
        <Select size="small" value={filterType} onChange={(e) => setFilterType(e.target.value)} sx={{ minWidth: 140 }}>
          <MenuItem value="all">Tous les types</MenuItem>
          {Object.entries(TYPE_CONFIG).map(([v, c]) => <MenuItem key={v} value={v}>{c.label}</MenuItem>)}
        </Select>
      </Stack>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
      ) : filtered.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Icon icon="eva:message-circle-outline" width={48} style={{ opacity: 0.3 }} />
          <Typography sx={{ color: 'text.secondary', mt: 1 }}>Aucune interaction</Typography>
        </Box>
      ) : (
        <Stack spacing={3}>
          {Object.entries(groups).map(([date, items]) => (
            <Box key={date}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'capitalize', mb: 1.5 }}>
                {date}
              </Typography>
              <Stack spacing={1.5}>
                {items.map((item, idx) => {
                  const tc = TYPE_CONFIG[item.type] || TYPE_CONFIG.autre;
                  return (
                    <Card key={item._id || item.id || idx} elevation={0} sx={{ border: (t) => `1px solid ${alpha(t.palette.divider, 0.5)}`, borderRadius: 2 }}>
                      <CardContent>
                        <Stack direction="row" spacing={1.5}>
                          <Box
                            sx={{
                              width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                              bgcolor: (t) => alpha(t.palette[tc.color]?.main || t.palette.grey[500], 0.12),
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}
                          >
                            <Icon icon={tc.icon} width={20} />
                          </Box>
                          <Box sx={{ flexGrow: 1 }}>
                            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                              {item.contact && (
                                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                  {item.contact.company_name || item.contact.contact_name}
                                </Typography>
                              )}
                              <Chip label={tc.label} size="small" color={tc.color} sx={{ height: 20, fontSize: 10 }} />
                            </Stack>
                            {item.notes && (
                              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>{item.notes}</Typography>
                            )}
                            {item.outcome && (
                              <Typography variant="caption" sx={{ color: 'primary.main', fontStyle: 'italic' }}>
                                → {item.outcome}
                              </Typography>
                            )}
                          </Box>
                          <Typography variant="caption" sx={{ color: 'text.secondary', flexShrink: 0 }}>
                            {item.date ? new Date(item.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : ''}
                          </Typography>
                        </Stack>
                      </CardContent>
                    </Card>
                  );
                })}
              </Stack>
            </Box>
          ))}
        </Stack>
      )}

      <InteractionFormDialog open={dialogOpen} onClose={() => setDialogOpen(false)} contacts={contacts} />
    </motion.div>
  );
}
