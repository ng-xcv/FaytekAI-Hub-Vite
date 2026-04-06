import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Typography, Stack, Card, CardContent, Button, TextField, InputAdornment,
  Select, MenuItem, Chip, IconButton, CircularProgress, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, Avatar,
  Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { fetchContacts, createContact } from '../../redux/slices/crmSlice';

const STATUS_CONFIG = {
  'à_contacter': { label: 'À contacter', color: 'default' },
  'contacté': { label: 'Contacté', color: 'secondary' },
  'en_cours': { label: 'En cours', color: 'info' },
  'intéressé': { label: 'Intéressé', color: 'warning' },
  'converti': { label: 'Converti', color: 'success' },
  'perdu': { label: 'Perdu', color: 'error' },
};

const SECTORS = ['BTP', 'Restauration', 'Immobilier', 'Logistique', 'Tech', 'Commerce', 'Santé', 'Éducation', 'Autre'];
const PRIORITIES = ['haute', 'moyenne', 'faible'];

function ContactFormDialog({ open, onClose }) {
  const dispatch = useDispatch();
  const { register, handleSubmit, reset, control } = useForm({
    defaultValues: { company_name: '', contact_name: '', email: '', phone: '', sector: 'Autre', status: 'à_contacter', priority: 'moyenne', city: '', notes: '' },
  });
  useEffect(() => { if (open) reset(); }, [open, reset]);
  const onSubmit = async (data) => {
    await dispatch(createContact(data));
    onClose();
  };
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle sx={{ fontWeight: 700 }}>Nouveau contact</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField {...register('company_name')} label="Nom de l'entreprise" fullWidth required autoFocus />
            <TextField {...register('contact_name')} label="Nom du contact" fullWidth />
            <Stack direction="row" spacing={2}>
              <TextField {...register('email')} label="Email" type="email" fullWidth />
              <TextField {...register('phone')} label="Téléphone" fullWidth />
            </Stack>
            <Stack direction="row" spacing={2}>
              <FormControl fullWidth>
                <InputLabel>Secteur</InputLabel>
                <Controller name="sector" control={control} render={({ field }) => (
                  <Select {...field} label="Secteur">{SECTORS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}</Select>
                )} />
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Priorité</InputLabel>
                <Controller name="priority" control={control} render={({ field }) => (
                  <Select {...field} label="Priorité">{PRIORITIES.map((p) => <MenuItem key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</MenuItem>)}</Select>
                )} />
              </FormControl>
            </Stack>
            <TextField {...register('city')} label="Ville" fullWidth />
            <TextField {...register('notes')} label="Notes" fullWidth multiline rows={2} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={onClose} variant="outlined">Annuler</Button>
          <Button type="submit" variant="contained" sx={{ borderRadius: 1.5, fontWeight: 700 }}>Créer</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default function CrmContacts() {
  const dispatch = useDispatch();
  const { contacts, isLoading, total } = useSelector((s) => s.crm);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSector, setFilterSector] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchContacts({}));
  }, [dispatch]);

  const filtered = contacts.filter((c) => {
    const matchSearch = !search || c.company_name?.toLowerCase().includes(search.toLowerCase()) || c.contact_name?.toLowerCase().includes(search.toLowerCase()) || c.city?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || c.status === filterStatus;
    const matchSector = filterSector === 'all' || c.sector === filterSector;
    return matchSearch && matchStatus && matchSector;
  });

  // Stats
  const stats = [
    { label: 'Total', value: total || contacts.length, color: 'primary', icon: 'eva:people-fill' },
    { label: 'Convertis', value: contacts.filter((c) => c.status === 'converti').length, color: 'success', icon: 'eva:checkmark-circle-2-fill' },
    { label: 'En cours', value: contacts.filter((c) => c.status === 'en_cours').length, color: 'info', icon: 'eva:loader-fill' },
    { label: 'À contacter', value: contacts.filter((c) => c.status === 'à_contacter').length, color: 'warning', icon: 'eva:phone-fill' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>Contacts CRM</Typography>
        <Button
          variant="contained"
          startIcon={<Icon icon="eva:plus-fill" />}
          onClick={() => setDialogOpen(true)}
          sx={{ borderRadius: 1.5, fontWeight: 700 }}
        >
          Nouveau contact
        </Button>
      </Stack>

      {/* Stats */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
        {stats.map((s) => (
          <Card key={s.label} elevation={0} sx={{ flex: 1, border: (t) => `1px solid ${alpha(t.palette.divider, 0.5)}`, borderRadius: 2 }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: (t) => alpha(t.palette[s.color].main, 0.12), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon icon={s.icon} width={20} />
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

      {/* Filters */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
        <TextField
          size="small"
          placeholder="Rechercher un contact..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><Icon icon="eva:search-fill" width={18} /></InputAdornment> }}
          sx={{ flexGrow: 1 }}
        />
        <Select size="small" value={filterSector} onChange={(e) => setFilterSector(e.target.value)} sx={{ minWidth: 140 }}>
          <MenuItem value="all">Tous les secteurs</MenuItem>
          {SECTORS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
        </Select>
        <Select size="small" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} sx={{ minWidth: 150 }}>
          <MenuItem value="all">Tous les statuts</MenuItem>
          {Object.entries(STATUS_CONFIG).map(([v, c]) => <MenuItem key={v} value={v}>{c.label}</MenuItem>)}
        </Select>
      </Stack>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ border: (t) => `1px solid ${alpha(t.palette.divider, 0.5)}`, borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: (t) => alpha(t.palette.grey[500], 0.05) }}>
                {['Entreprise', 'Contact', 'Secteur', 'Statut', 'Priorité', 'Ville', 'Dernier contact', 'Actions'].map((h) => (
                  <TableCell key={h} sx={{ fontWeight: 700, fontSize: 12, textTransform: 'uppercase', color: 'text.secondary' }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={8} sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>Aucun contact trouvé</TableCell></TableRow>
              ) : (
                filtered.map((contact) => {
                  const sc = STATUS_CONFIG[contact.status] || { label: contact.status || '—', color: 'default' };
                  return (
                    <TableRow key={contact._id || contact.id} sx={{ '&:hover': { bgcolor: (t) => alpha(t.palette.grey[500], 0.04) } }}>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Avatar sx={{ width: 28, height: 28, fontSize: 12, bgcolor: 'primary.main' }}>
                            {contact.company_name?.[0]?.toUpperCase() || '?'}
                          </Avatar>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{contact.company_name}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ fontSize: 13 }}>{contact.contact_name || '—'}</TableCell>
                      <TableCell>
                        <Chip label={contact.sector || '—'} size="small" variant="outlined" sx={{ height: 22, fontSize: 11 }} />
                      </TableCell>
                      <TableCell>
                        <Chip label={sc.label} size="small" color={sc.color} sx={{ height: 22, fontSize: 11 }} />
                      </TableCell>
                      <TableCell sx={{ fontSize: 13, textTransform: 'capitalize' }}>{contact.priority || '—'}</TableCell>
                      <TableCell sx={{ fontSize: 13 }}>{contact.city || '—'}</TableCell>
                      <TableCell sx={{ fontSize: 13, color: 'text.secondary' }}>
                        {contact.last_contact_at ? new Date(contact.last_contact_at).toLocaleDateString('fr-FR') : 'Jamais'}
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5}>
                          {contact.phone && <IconButton size="small" component="a" href={`tel:${contact.phone}`}><Icon icon="eva:phone-fill" width={15} /></IconButton>}
                          {contact.email && <IconButton size="small" component="a" href={`mailto:${contact.email}`}><Icon icon="eva:email-fill" width={15} /></IconButton>}
                          <IconButton size="small"><Icon icon="eva:edit-2-fill" width={15} /></IconButton>
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

      <ContactFormDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </motion.div>
  );
}
