import { useEffect, useState } from 'react';
import {
  Box, Typography, Stack, Card, CardContent, List, ListItem, ListItemButton,
  ListItemText, ListItemAvatar, Avatar, Chip, TextField, InputAdornment,
  IconButton, Divider, CircularProgress, Button,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import axiosInstance from '../../utils/axios';

const CATEGORY_CONFIG = {
  inbox: { label: 'Boîte de réception', icon: 'eva:inbox-fill' },
  sent: { label: 'Envoyés', icon: 'eva:paper-plane-fill' },
  drafts: { label: 'Brouillons', icon: 'eva:edit-2-fill' },
  starred: { label: 'Favoris', icon: 'eva:star-fill' },
  trash: { label: 'Corbeille', icon: 'eva:trash-2-fill' },
};

function EmailListItem({ email, selected, onClick }) {
  return (
    <ListItemButton
      selected={selected}
      onClick={onClick}
      sx={{
        borderRadius: 1.5,
        mb: 0.5,
        '&.Mui-selected': { bgcolor: (t) => alpha(t.palette.primary.main, 0.08) },
      }}
    >
      <ListItemAvatar>
        <Avatar sx={{ width: 36, height: 36, fontSize: 14, bgcolor: 'primary.main' }}>
          {(email.from || email.sender || '?')[0].toUpperCase()}
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="body2" sx={{ fontWeight: email.unread ? 700 : 400, flexGrow: 1 }} noWrap>
              {email.subject || '(Sans objet)'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', flexShrink: 0 }}>
              {email.date ? new Date(email.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : ''}
            </Typography>
          </Stack>
        }
        secondary={
          <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap>
            {email.from || email.sender} — {email.preview || email.body?.substring(0, 60)}
          </Typography>
        }
      />
    </ListItemButton>
  );
}

export default function EmailsInbox() {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('inbox');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await axiosInstance.get('/api/emails', { params: { category } });
        setEmails(data.emails || data || []);
      } catch {
        setEmails([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [category]);

  const filtered = emails.filter(
    (e) => !search || e.subject?.toLowerCase().includes(search.toLowerCase()) || e.from?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 3 }}>Emails</Typography>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ height: 'calc(100vh - 200px)' }}>
        {/* Sidebar */}
        <Card elevation={0} sx={{ width: { md: 200 }, flexShrink: 0, border: (t) => `1px solid ${alpha(t.palette.divider, 0.5)}`, borderRadius: 2 }}>
          <CardContent sx={{ p: 1.5 }}>
            <Button
              variant="contained"
              fullWidth
              startIcon={<Icon icon="eva:edit-2-fill" />}
              sx={{ borderRadius: 1.5, fontWeight: 700, mb: 2 }}
            >
              Composer
            </Button>
            <List dense>
              {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
                <ListItemButton
                  key={key}
                  selected={category === key}
                  onClick={() => setCategory(key)}
                  sx={{ borderRadius: 1, mb: 0.25 }}
                >
                  <Icon icon={cfg.icon} width={18} style={{ marginRight: 8 }} />
                  <ListItemText primary={cfg.label} primaryTypographyProps={{ variant: 'body2', fontWeight: category === key ? 700 : 400 }} />
                </ListItemButton>
              ))}
            </List>
          </CardContent>
        </Card>

        {/* Email list */}
        <Card elevation={0} sx={{ flex: 1, border: (t) => `1px solid ${alpha(t.palette.divider, 0.5)}`, borderRadius: 2, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Box sx={{ p: 1.5, borderBottom: (t) => `1px solid ${alpha(t.palette.divider, 0.4)}` }}>
            <TextField
              size="small"
              fullWidth
              placeholder="Rechercher un email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Icon icon="eva:search-fill" width={18} /></InputAdornment>,
              }}
            />
          </Box>
          <Box sx={{ flex: 1, overflowY: 'auto', p: 1 }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
            ) : filtered.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Icon icon="eva:inbox-outline" width={48} style={{ opacity: 0.3 }} />
                <Typography sx={{ color: 'text.secondary', mt: 1 }}>Aucun email</Typography>
              </Box>
            ) : (
              <List dense disablePadding>
                {filtered.map((email, i) => (
                  <EmailListItem
                    key={email._id || email.id || i}
                    email={email}
                    selected={selected?._id === email._id || selected?.id === email.id}
                    onClick={() => setSelected(email)}
                  />
                ))}
              </List>
            )}
          </Box>
        </Card>

        {/* Email detail */}
        {selected && (
          <Card elevation={0} sx={{ flex: 1.5, border: (t) => `1px solid ${alpha(t.palette.divider, 0.5)}`, borderRadius: 2, display: { xs: 'none', lg: 'flex' }, flexDirection: 'column' }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2, borderBottom: (t) => `1px solid ${alpha(t.palette.divider, 0.4)}` }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>{selected.subject || '(Sans objet)'}</Typography>
              <IconButton size="small" onClick={() => setSelected(null)}>
                <Icon icon="eva:close-fill" />
              </IconButton>
            </Stack>
            <Box sx={{ p: 3, overflowY: 'auto', flex: 1 }}>
              <Stack direction="row" spacing={1.5} sx={{ mb: 3 }}>
                <Avatar>{(selected.from || '?')[0].toUpperCase()}</Avatar>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{selected.from || selected.sender}</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {selected.date ? new Date(selected.date).toLocaleString('fr-FR') : ''}
                  </Typography>
                </Box>
              </Stack>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
                {selected.body || selected.preview || 'Contenu non disponible'}
              </Typography>
            </Box>
          </Card>
        )}
      </Stack>
    </motion.div>
  );
}
