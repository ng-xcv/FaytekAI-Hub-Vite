import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, CircularProgress, Snackbar, Alert,
  Chip, Divider, TextField, Dialog, DialogTitle, DialogContent,
  DialogActions, IconButton, Tooltip, Badge, List, ListItem,
  ListItemButton, ListItemText, ToggleButtonGroup, ToggleButton,
  Paper
} from '@mui/material';
import SyncIcon from '@mui/icons-material/Sync';
import ReplyIcon from '@mui/icons-material/Reply';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import InboxIcon from '@mui/icons-material/Inbox';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || '';

export default function EmailsInbox() {
  const [emails, setEmails] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all' | 'unread' | 'imported'
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyCorps, setReplyCorps] = useState('');
  const [replying, setReplying] = useState(false);
  const [converting, setConverting] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  const limit = 20;

  const showSnack = (message, severity = 'success') => {
    setSnack({ open: true, message, severity });
  };

  const buildFilter = useCallback(() => {
    const params = { page, limit };
    if (filter === 'unread') params.lu = 'false';
    if (filter === 'imported') params.importeAutomatiquement = 'true';
    return params;
  }, [page, filter]);

  const fetchEmails = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/api/email`, { params: buildFilter() });
      setEmails(data.emails || []);
      setTotal(data.total || 0);
    } catch (err) {
      showSnack(err?.response?.data?.message || 'Erreur lors du chargement des emails', 'error');
    } finally {
      setLoading(false);
    }
  }, [buildFilter]);

  useEffect(() => {
    fetchEmails();
  }, [fetchEmails]);

  const handleFilterChange = (_, val) => {
    if (val !== null) {
      setFilter(val);
      setPage(1);
      setSelected(null);
    }
  };

  const handleSelect = async (email) => {
    setSelected(email);
    if (!email.lu) {
      try {
        const { data } = await axios.get(`${API}/api/email/${email._id}`);
        setEmails(prev => prev.map(e => e._id === email._id ? { ...e, lu: true } : e));
        setSelected(data);
      } catch (err) {
        console.warn('Erreur marquage lu:', err.message);
      }
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const { data } = await axios.post(`${API}/api/email/sync`);
      showSnack(data.message || `${data.imported ?? 0} email(s) importé(s)`, 'success');
      setPage(1);
      fetchEmails();
    } catch (err) {
      showSnack(err?.response?.data?.message || 'Erreur lors de la synchronisation', 'error');
    } finally {
      setSyncing(false);
    }
  };

  const handleReply = async () => {
    if (!replyCorps.trim() || !selected) return;
    setReplying(true);
    try {
      const { data } = await axios.post(`${API}/api/email/${selected._id}/reply`, { corps: replyCorps });
      showSnack(data.message || 'Réponse envoyée', 'success');
      setReplyOpen(false);
      setReplyCorps('');
    } catch (err) {
      showSnack(err?.response?.data?.message || 'Erreur lors de l\'envoi', 'error');
    } finally {
      setReplying(false);
    }
  };

  const handleConvert = async () => {
    if (!selected) return;
    setConverting(true);
    try {
      const { data } = await axios.post(`${API}/api/email/${selected._id}/convert-tache`);
      showSnack(data.message || 'Tâche créée avec succès', 'success');
      setSelected(prev => ({ ...prev, converti: true, tacheLiee: data.tache?._id }));
      setEmails(prev => prev.map(e => e._id === selected._id ? { ...e, converti: true } : e));
    } catch (err) {
      showSnack(err?.response?.data?.message || 'Erreur lors de la conversion', 'error');
    } finally {
      setConverting(false);
    }
  };

  const formatDate = (d) => {
    if (!d) return '';
    return new Date(d).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const unreadCount = emails.filter(e => !e.lu).length;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 2, gap: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h5" fontWeight={700}>
          📧 Emails Outlook
          {unreadCount > 0 && (
            <Badge badgeContent={unreadCount} color="primary" sx={{ ml: 2 }} />
          )}
        </Typography>
        <Button
          variant="contained"
          startIcon={syncing ? <CircularProgress size={16} color="inherit" /> : <SyncIcon />}
          onClick={handleSync}
          disabled={syncing}
          sx={{ textTransform: 'none' }}
        >
          {syncing ? 'Synchronisation...' : 'Sync Outlook'}
        </Button>
      </Box>

      {/* Filtres */}
      <ToggleButtonGroup
        value={filter}
        exclusive
        onChange={handleFilterChange}
        size="small"
      >
        <ToggleButton value="all">Tous ({total})</ToggleButton>
        <ToggleButton value="unread">Non lus</ToggleButton>
        <ToggleButton value="imported">Auto-importés</ToggleButton>
      </ToggleButtonGroup>

      {/* Layout 2 colonnes */}
      <Box sx={{ display: 'flex', gap: 2, flex: 1, minHeight: 0 }}>
        {/* Liste emails */}
        <Paper
          variant="outlined"
          sx={{ width: { xs: '100%', md: 340 }, flexShrink: 0, overflow: 'auto', display: 'flex', flexDirection: 'column' }}
        >
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, p: 4 }}>
              <CircularProgress />
            </Box>
          ) : emails.length === 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, p: 4, gap: 1, color: 'text.secondary' }}>
              <InboxIcon sx={{ fontSize: 48, opacity: 0.4 }} />
              <Typography variant="body2">Aucun email</Typography>
              <Typography variant="caption">Cliquez sur "Sync Outlook" pour importer</Typography>
            </Box>
          ) : (
            <List disablePadding>
              {emails.map((email, idx) => (
                <Box key={email._id}>
                  <ListItem disablePadding>
                    <ListItemButton
                      selected={selected?._id === email._id}
                      onClick={() => handleSelect(email)}
                      sx={{ flexDirection: 'column', alignItems: 'flex-start', py: 1.5, px: 2 }}
                    >
                      <Box sx={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography
                          variant="body2"
                          fontWeight={email.lu ? 400 : 700}
                          noWrap
                          sx={{ flex: 1, mr: 1 }}
                        >
                          {email.sujet || '(Sans sujet)'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                          {new Date(email.dateReception).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary" noWrap sx={{ width: '100%' }}>
                        {email.de}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
                        {!email.lu && (
                          <Chip label="Non lu" size="small" color="primary" sx={{ height: 18, fontSize: '0.65rem' }} />
                        )}
                        {email.importeAutomatiquement && (
                          <Chip label="Auto" size="small" color="info" sx={{ height: 18, fontSize: '0.65rem' }} />
                        )}
                        {email.converti && (
                          <Chip label="→ Tâche" size="small" color="success" sx={{ height: 18, fontSize: '0.65rem' }} />
                        )}
                        {email.importance === 'high' && (
                          <Chip label="⚡ Urgent" size="small" color="error" sx={{ height: 18, fontSize: '0.65rem' }} />
                        )}
                      </Box>
                    </ListItemButton>
                  </ListItem>
                  {idx < emails.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          )}
        </Paper>

        {/* Détail email */}
        <Paper
          variant="outlined"
          sx={{ flex: 1, overflow: 'auto', p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          {!selected ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, color: 'text.secondary', gap: 1 }}>
              <MarkEmailReadIcon sx={{ fontSize: 64, opacity: 0.3 }} />
              <Typography variant="body1">Sélectionnez un email pour le lire</Typography>
            </Box>
          ) : (
            <>
              {/* En-tête email */}
              <Box>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  {selected.sujet || '(Sans sujet)'}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                  {selected.importance === 'high' && <Chip label="⚡ Urgent" size="small" color="error" />}
                  {selected.importeAutomatiquement && <Chip label="Auto-importé" size="small" color="info" />}
                  {selected.converti && <Chip label="✅ Converti en tâche" size="small" color="success" />}
                </Box>
                <Typography variant="body2" color="text.secondary">
                  <strong>De :</strong> {selected.de}
                </Typography>
                {selected.a?.length > 0 && (
                  <Typography variant="body2" color="text.secondary">
                    <strong>À :</strong> {selected.a.join(', ')}
                  </Typography>
                )}
                {selected.cc?.length > 0 && (
                  <Typography variant="body2" color="text.secondary">
                    <strong>Cc :</strong> {selected.cc.join(', ')}
                  </Typography>
                )}
                <Typography variant="body2" color="text.secondary">
                  <strong>Reçu le :</strong> {formatDate(selected.dateReception)}
                </Typography>
              </Box>

              <Divider />

              {/* Corps */}
              <Box sx={{ flex: 1, overflow: 'auto' }}>
                {selected.contenuHtml ? (
                  <Box
                    dangerouslySetInnerHTML={{ __html: selected.contenuHtml }}
                    sx={{ '& *': { maxWidth: '100%' }, fontSize: '0.9rem', lineHeight: 1.6 }}
                  />
                ) : selected.apercu ? (
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {selected.apercu}
                  </Typography>
                ) : (
                  <Typography variant="body2" color="text.secondary" fontStyle="italic">
                    Aucun contenu disponible
                  </Typography>
                )}
              </Box>

              <Divider />

              {/* Actions */}
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  startIcon={<ReplyIcon />}
                  onClick={() => setReplyOpen(true)}
                  sx={{ textTransform: 'none' }}
                >
                  Répondre
                </Button>
                <Tooltip title={selected.converti ? 'Déjà converti en tâche' : 'Créer une tâche depuis cet email'}>
                  <span>
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={converting ? <CircularProgress size={16} color="inherit" /> : <TaskAltIcon />}
                      onClick={handleConvert}
                      disabled={selected.converti || converting}
                      sx={{ textTransform: 'none' }}
                    >
                      {converting ? 'Conversion...' : selected.converti ? 'Converti en tâche' : 'Convertir en tâche'}
                    </Button>
                  </span>
                </Tooltip>
              </Box>
            </>
          )}
        </Paper>
      </Box>

      {/* Dialog Répondre */}
      <Dialog open={replyOpen} onClose={() => setReplyOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Répondre à l'email</DialogTitle>
        <DialogContent>
          {selected && (
            <Typography variant="caption" color="text.secondary" gutterBottom display="block">
              En réponse à : <strong>{selected.sujet}</strong> — de {selected.de}
            </Typography>
          )}
          <TextField
            autoFocus
            multiline
            rows={6}
            fullWidth
            placeholder="Votre réponse..."
            value={replyCorps}
            onChange={e => setReplyCorps(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setReplyOpen(false); setReplyCorps(''); }} sx={{ textTransform: 'none' }}>
            Annuler
          </Button>
          <Button
            variant="contained"
            onClick={handleReply}
            disabled={!replyCorps.trim() || replying}
            startIcon={replying ? <CircularProgress size={16} color="inherit" /> : <ReplyIcon />}
            sx={{ textTransform: 'none' }}
          >
            {replying ? 'Envoi...' : 'Envoyer'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snack.severity} onClose={() => setSnack(s => ({ ...s, open: false }))} variant="filled">
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
