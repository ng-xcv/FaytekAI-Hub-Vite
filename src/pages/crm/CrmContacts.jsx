import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Button, Chip, CircularProgress, Dialog, DialogContent, DialogTitle,
  Drawer, FormControl, Grid, IconButton, InputLabel, LinearProgress, MenuItem,
  Paper, Select, Stack, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, TextField, Typography, Divider, Alert
} from '@mui/material';
import {
  Add as AddIcon, Delete as DeleteIcon, Upload as UploadIcon,
  Close as CloseIcon, PersonAdd as PersonAddIcon
} from '@mui/icons-material';
import {
  fetchContacts, createContact, updateContact, deleteContact,
  fetchContactInteractions, createInteraction, fetchCRMStats
} from '../../redux/slices/crmSlice';

const SECTEURS = [
  'Comptabilité', 'BTP', 'Immobilier', 'Logistique', 'Tech',
  'Commerce', 'Santé', 'Éducation', 'Agriculture', 'Finance',
  'Industrie', 'Transport', 'Tourisme', 'Médias', 'Autre'
];


const STATUT_COLORS = {
  prospect: 'default',
  contact: 'secondary',
  qualified: 'info',
  won: 'success',
  lost: 'error',
};

const STATUTS = ['prospect', 'contact', 'qualified', 'won', 'lost'];
const TYPES_INTERACTION = ['email', 'appel', 'reunion', 'note'];

const defaultContactForm = {
  nom: '', prenom: '', email: '', telephone: '',
  entreprise: '', secteur: 'Autre', pays: 'Sénégal', statutPipeline: 'prospect', notes: ''
};

const defaultInteractionForm = {
  type: 'note', notes: '', dateInteraction: new Date().toISOString().slice(0, 16)
};

export default function CrmContacts() {
  const dispatch = useDispatch();
  const { contacts, interactions, stats, isLoading } = useSelector(s => s.crm);

  const [search, setSearch] = useState('');
  const [filterStatut, setFilterStatut] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [contactForm, setContactForm] = useState(defaultContactForm);
  const [editingContact, setEditingContact] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [interactionForm, setInteractionForm] = useState(defaultInteractionForm);
  const [interactionDialogOpen, setInteractionDialogOpen] = useState(false);
  const [importAlert, setImportAlert] = useState(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef();

  useEffect(() => {
    dispatch(fetchContacts({ search, statutPipeline: filterStatut }));
    dispatch(fetchCRMStats());
  }, [dispatch, search, filterStatut]);

  const handleOpenContact = (contact) => {
    setSelectedContact(contact);
    setDrawerOpen(true);
    dispatch(fetchContactInteractions(contact._id));
  };

  const handleSaveContact = async () => {
    setSaving(true);
    try {
      if (editingContact) {
        await dispatch(updateContact({ id: editingContact._id, payload: contactForm })).unwrap();
      } else {
        await dispatch(createContact(contactForm)).unwrap();
      }
      setDialogOpen(false);
      setEditingContact(null);
      setContactForm(defaultContactForm);
      dispatch(fetchCRMStats());
    } catch (err) {
      // silently ignore
    }
    setSaving(false);
  };

  const handleEditContact = (contact, e) => {
    e.stopPropagation();
    setEditingContact(contact);
    setContactForm({
      nom: contact.nom || '', prenom: contact.prenom || '',
      email: contact.email || '', telephone: contact.telephone || '',
      entreprise: contact.entreprise || '', secteur: contact.secteur || 'Autre', pays: contact.pays || 'Sénégal',
      statutPipeline: contact.statutPipeline || 'prospect', notes: contact.notes || ''
    });
    setDialogOpen(true);
  };

  const handleDeleteContact = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Supprimer ce contact ?')) return;
    await dispatch(deleteContact(id)).unwrap();
    if (selectedContact?._id === id) { setDrawerOpen(false); setSelectedContact(null); }
    dispatch(fetchCRMStats());
  };

  const handleAddInteraction = async () => {
    if (!selectedContact || !interactionForm.notes.trim()) return;
    setSaving(true);
    try {
      await dispatch(createInteraction({ contactId: selectedContact._id, payload: interactionForm })).unwrap();
      setInteractionDialogOpen(false);
      setInteractionForm(defaultInteractionForm);
    } catch (err) {}
    setSaving(false);
  };

  const handleImportCSV = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/crm/contacts/import-csv', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      setImportAlert({ type: res.ok ? 'success' : 'error', message: data.message });
      if (res.ok) dispatch(fetchContacts({ search, statutPipeline: filterStatut }));
    } catch (err) {
      setImportAlert({ type: 'error', message: 'Erreur import' });
    }
    fileInputRef.current.value = '';
    setTimeout(() => setImportAlert(null), 5000);
  };

  const contactInteractions = selectedContact ? (interactions[selectedContact._id] || []) : [];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        CRM — Contacts
      </Typography>

      {/* Stats pipeline */}
      {stats && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="primary" fontWeight={700}>{stats.totalContacts}</Typography>
              <Typography variant="body2" color="text.secondary">Total contacts</Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="success.main" fontWeight={700}>{stats.tauxConversion}%</Typography>
              <Typography variant="body2" color="text.secondary">Taux de conversion</Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="secondary.main" fontWeight={700}>{stats.recentInteractions}</Typography>
              <Typography variant="body2" color="text.secondary">Interactions (30j)</Typography>
            </Paper>
          </Grid>
          {/* Pipeline bar */}
          <Grid size={{ xs: 12 }}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>Pipeline</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {STATUTS.map(s => (
                  <Chip
                    key={s}
                    label={`${s}: ${stats.pipeline?.[s] || 0}`}
                    color={STATUT_COLORS[s]}
                    size="small"
                  />
                ))}
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Alertes */}
      {importAlert && (
        <Alert severity={importAlert.type} sx={{ mb: 2 }}>{importAlert.message}</Alert>
      )}

      {/* Filtres + actions */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
        <TextField
          size="small"
          placeholder="Rechercher..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          sx={{ minWidth: 220 }}
        />
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Statut pipeline</InputLabel>
          <Select value={filterStatut} label="Statut pipeline" onChange={e => setFilterStatut(e.target.value)}>
            <MenuItem value="">Tous</MenuItem>
            {STATUTS.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </Select>
        </FormControl>
        <Box sx={{ flex: 1 }} />
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          style={{ display: 'none' }}
          onChange={handleImportCSV}
        />
        <Button
          variant="outlined"
          startIcon={<UploadIcon />}
          onClick={() => fileInputRef.current?.click()}
          size="small"
        >
          Import CSV
        </Button>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => { setEditingContact(null); setContactForm(defaultContactForm); setDialogOpen(true); }}
          size="small"
        >
          Nouveau contact
        </Button>
      </Stack>

      {/* Table */}
      <TableContainer component={Paper}>
        {isLoading && <LinearProgress />}
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Nom</TableCell>
              <TableCell>Prénom</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Téléphone</TableCell>
              <TableCell>Entreprise</TableCell>
                <TableCell>Secteur</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {contacts.map(contact => (
              <TableRow
                key={contact._id}
                hover
                sx={{ cursor: 'pointer' }}
                onClick={() => handleOpenContact(contact)}
              >
                <TableCell>{contact.nom}</TableCell>
                <TableCell>{contact.prenom}</TableCell>
                <TableCell>{contact.email}</TableCell>
                <TableCell>{contact.telephone}</TableCell>
                <TableCell>{contact.entreprise}</TableCell>
                  <TableCell>{contact.secteur || '—'}</TableCell>
                <TableCell>
                  <Chip
                    label={contact.statutPipeline}
                    color={STATUT_COLORS[contact.statutPipeline] || 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={e => handleEditContact(contact, e)}>
                    <PersonAddIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={e => handleDeleteContact(contact._id, e)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {!isLoading && contacts.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="body2" color="text.secondary" py={3}>
                    Aucun contact trouvé
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog Nouveau / Edit Contact */}
      <Dialog open={dialogOpen} onClose={() => { setDialogOpen(false); setEditingContact(null); }} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingContact ? 'Modifier le contact' : 'Nouveau contact'}
          <IconButton sx={{ position: 'absolute', right: 8, top: 8 }} onClick={() => { setDialogOpen(false); setEditingContact(null); }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Nom *"
              value={contactForm.nom}
              onChange={e => setContactForm(f => ({ ...f, nom: e.target.value }))}
              required fullWidth size="small"
            />
            <TextField
              label="Prénom"
              value={contactForm.prenom}
              onChange={e => setContactForm(f => ({ ...f, prenom: e.target.value }))}
              fullWidth size="small"
            />
            <TextField
              label="Email"
              type="email"
              value={contactForm.email}
              onChange={e => setContactForm(f => ({ ...f, email: e.target.value }))}
              fullWidth size="small"
            />
            <TextField
              label="Téléphone"
              value={contactForm.telephone}
              onChange={e => setContactForm(f => ({ ...f, telephone: e.target.value }))}
              fullWidth size="small"
            />
            <TextField
              label="Entreprise"
              value={contactForm.entreprise}
              onChange={e => setContactForm(f => ({ ...f, entreprise: e.target.value }))}
              fullWidth size="small"
            />
            <TextField
              label="Pays"
              value={contactForm.secteur || 'Autre'}
              onChange={e => setContactForm(f => ({ ...f, secteur: e.target.value }))}
              select
              label="Secteur"
            >
              {SECTEURS.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </TextField>
            <TextField
              fullWidth size="small"
              label="Pays"
              value={contactForm.pays}
              onChange={e => setContactForm(f => ({ ...f, pays: e.target.value }))}
              fullWidth size="small"
            />
            <FormControl fullWidth size="small">
              <InputLabel>Statut pipeline</InputLabel>
              <Select
                value={contactForm.statutPipeline}
                label="Statut pipeline"
                onChange={e => setContactForm(f => ({ ...f, statutPipeline: e.target.value }))}
              >
                {STATUTS.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField
              label="Notes"
              value={contactForm.notes}
              onChange={e => setContactForm(f => ({ ...f, notes: e.target.value }))}
              fullWidth multiline rows={2} size="small"
            />
            <Button
              variant="contained"
              disabled={!contactForm.nom.trim() || saving}
              onClick={handleSaveContact}
            >
              {saving ? <CircularProgress size={20} /> : (editingContact ? 'Enregistrer' : 'Créer')}
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>

      {/* Drawer détail contact */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setSelectedContact(null); }}
        PaperProps={{ sx: { width: { xs: '100%', sm: 420 }, p: 3 } }}
      >
        {selectedContact && (
          <>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
              <Typography variant="h6">{selectedContact.nom} {selectedContact.prenom}</Typography>
              <IconButton onClick={() => { setDrawerOpen(false); setSelectedContact(null); }}>
                <CloseIcon />
              </IconButton>
            </Stack>
            <Stack spacing={1} sx={{ mb: 2 }}>
              <Typography variant="body2"><strong>Email :</strong> {selectedContact.email || '—'}</Typography>
              <Typography variant="body2"><strong>Téléphone :</strong> {selectedContact.telephone || '—'}</Typography>
              <Typography variant="body2"><strong>Entreprise :</strong> {selectedContact.entreprise || '—'}</Typography>
              <Typography variant="body2"><strong>Secteur :</strong> {selectedContact.secteur || '—'}</Typography>
            <Typography variant="body2"><strong>Pays :</strong> {selectedContact.pays}</Typography>
              <Typography variant="body2">
                <strong>Statut :</strong>{' '}
                <Chip label={selectedContact.statutPipeline} color={STATUT_COLORS[selectedContact.statutPipeline]} size="small" />
              </Typography>
              {selectedContact.notes && (
                <Typography variant="body2"><strong>Notes :</strong> {selectedContact.notes}</Typography>
              )}
            </Stack>
            <Divider sx={{ mb: 2 }} />
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
              <Typography variant="subtitle1" fontWeight={600}>Interactions</Typography>
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={() => setInteractionDialogOpen(true)}
              >
                Ajouter
              </Button>
            </Stack>
            <Stack spacing={1}>
              {contactInteractions.length === 0 && (
                <Typography variant="body2" color="text.secondary">Aucune interaction</Typography>
              )}
              {contactInteractions.map(inter => (
                <Paper key={inter._id} variant="outlined" sx={{ p: 1.5 }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip label={inter.type} size="small" />
                    <Typography variant="caption" color="text.secondary">
                      {new Date(inter.dateInteraction).toLocaleDateString('fr-FR')}
                    </Typography>
                  </Stack>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>{inter.notes}</Typography>
                </Paper>
              ))}
            </Stack>
          </>
        )}
      </Drawer>

      {/* Dialog ajouter interaction */}
      <Dialog open={interactionDialogOpen} onClose={() => setInteractionDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Ajouter une interaction
          <IconButton sx={{ position: 'absolute', right: 8, top: 8 }} onClick={() => setInteractionDialogOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Type</InputLabel>
              <Select
                value={interactionForm.type}
                label="Type"
                onChange={e => setInteractionForm(f => ({ ...f, type: e.target.value }))}
              >
                {TYPES_INTERACTION.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField
              label="Notes *"
              value={interactionForm.notes}
              onChange={e => setInteractionForm(f => ({ ...f, notes: e.target.value }))}
              fullWidth multiline rows={3} size="small" required
            />
            <TextField
              label="Date"
              type="datetime-local"
              value={interactionForm.dateInteraction}
              onChange={e => setInteractionForm(f => ({ ...f, dateInteraction: e.target.value }))}
              fullWidth size="small"
              InputLabelProps={{ shrink: true }}
            />
            <Button
              variant="contained"
              disabled={!interactionForm.notes.trim() || saving}
              onClick={handleAddInteraction}
            >
              {saving ? <CircularProgress size={20} /> : 'Ajouter'}
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
