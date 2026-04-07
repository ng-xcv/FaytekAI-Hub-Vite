import { useState, useEffect } from 'react';
import {
  Box, Typography, Stack, Card, CardContent, Grid, Button,
  Switch, Divider, Avatar, Chip, Tab, Tabs, Alert, CircularProgress,
  FormControl, InputLabel, Select, MenuItem,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import useAuth from '../../hooks/useAuth';
import axiosInstance from '../../utils/axios';

function TabPanel({ children, value, index }) {
  return value === index ? <Box sx={{ py: 3 }}>{children}</Box> : null;
}

function SectionCard({ title, icon, children }) {
  return (
    <Card elevation={0} sx={{ border: (t) => `1px solid ${alpha(t.palette.divider, 0.5)}`, borderRadius: 2, mb: 2.5 }}>
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2.5 }}>
          <Icon icon={icon} width={20} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>{title}</Typography>
        </Stack>
        {children}
      </CardContent>
    </Card>
  );
}

function StatusBadge({ connected }) {
  return (
    <Chip
      label={connected ? 'Connecté' : 'Non connecté'}
      color={connected ? 'success' : 'default'}
      size="small"
      sx={{ fontWeight: 600 }}
    />
  );
}

// ─── Onglet Intégrations ─────────────────────────────────────────────────────
function IntegrationsTab() {
  const [ms365, setMs365] = useState(null);
  const [telegram, setTelegram] = useState(null);
  const [loadingMs, setLoadingMs] = useState(true);
  const [loadingTg, setLoadingTg] = useState(true);

  useEffect(() => {
    axiosInstance.get('/api/integration/ms365/status')
      .then(({ data }) => setMs365(data))
      .catch(() => setMs365({ configured: false, connected: false }))
      .finally(() => setLoadingMs(false));

    axiosInstance.get('/api/integration/telegram/status')
      .then(({ data }) => setTelegram(data))
      .catch(() => setTelegram({ connected: false }))
      .finally(() => setLoadingTg(false));
  }, []);

  const handleMs365Connect = async () => {
    try {
      const { data } = await axiosInstance.get('/api/integration/ms365/auth');
      if (data.authUrl) window.open(data.authUrl, '_blank', 'width=600,height=700');
    } catch {
      /* silent */
    }
  };

  return (
    <>
      {/* MS365 */}
      <SectionCard title="Microsoft 365" icon="logos:microsoft-icon">
        {loadingMs ? (
          <CircularProgress size={20} />
        ) : (
          <Stack spacing={2}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Avatar sx={{ width: 40, height: 40, bgcolor: '#0078d4' }}>
                  <Icon icon="mdi:microsoft-outlook" width={22} color="#fff" />
                </Avatar>
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>Outlook / Calendrier</Typography>
                  {ms365?.email && (
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>{ms365.email}</Typography>
                  )}
                  {ms365?.expiresAt && (
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                      Expire : {new Date(ms365.expiresAt).toLocaleDateString('fr-FR')}
                    </Typography>
                  )}
                </Box>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={1}>
                <StatusBadge connected={ms365?.connected} />
                {ms365?.connected ? (
                  <Button variant="outlined" color="error" size="small" sx={{ borderRadius: 1.5, fontWeight: 700 }}>
                    Déconnecter
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    size="small"
                    onClick={handleMs365Connect}
                    disabled={!ms365?.configured}
                    startIcon={<Icon icon="eva:external-link-fill" width={14} />}
                    sx={{ borderRadius: 1.5, fontWeight: 700 }}
                  >
                    Connecter
                  </Button>
                )}
              </Stack>
            </Stack>
            {!ms365?.configured && (
              <Alert severity="warning" sx={{ py: 0.5 }}>
                Les variables d'environnement MS365 ne sont pas configurées sur le serveur.
              </Alert>
            )}
          </Stack>
        )}
      </SectionCard>

      {/* Telegram */}
      <SectionCard title="Telegram" icon="logos:telegram">
        {loadingTg ? (
          <CircularProgress size={20} />
        ) : (
          <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Avatar sx={{ width: 40, height: 40, bgcolor: '#229ED9' }}>
                <Icon icon="mdi:telegram" width={24} color="#fff" />
              </Avatar>
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 700 }}>Bot Telegram</Typography>
                {telegram?.botName && (
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>@{telegram.botName}</Typography>
                )}
              </Box>
            </Stack>
            <StatusBadge connected={telegram?.connected} />
          </Stack>
        )}
      </SectionCard>
    </>
  );
}

// ─── Onglet Préférences ───────────────────────────────────────────────────────
function PreferencesTab() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [notifications, setNotifications] = useState({
    email: false,
    push: false,
    briefingMatinal: false,
    rappelsTaches: false,
  });

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      theme: 'dark',
      langue: 'fr',
      fuseau: 'Africa/Dakar',
    },
  });

  useEffect(() => {
    axiosInstance.get('/api/preference')
      .then(({ data }) => {
        reset({
          theme: data.theme || 'dark',
          langue: data.langue || 'fr',
          fuseau: data.fuseau || 'Africa/Dakar',
        });
        if (data.notifications) {
          setNotifications({
            email: data.notifications.email || false,
            push: data.notifications.push || false,
            briefingMatinal: data.notifications.briefingMatinal || false,
            rappelsTaches: data.notifications.rappelsTaches || false,
          });
        }
      })
      .catch(() => { /* garder defaults */ })
      .finally(() => setLoading(false));
  }, [reset]);

  const onSubmit = async (formData) => {
    setSaving(true);
    try {
      await axiosInstance.put('/api/preference', {
        ...formData,
        notifications,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch { /* silent */ }
    setSaving(false);
  };

  if (loading) return <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {saved && <Alert severity="success" sx={{ mb: 2 }}>Préférences enregistrées ✓</Alert>}

      <SectionCard title="Affichage" icon="eva:monitor-outline">
        <Stack spacing={2.5}>
          <Controller
            name="theme"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth size="small">
                <InputLabel>Thème</InputLabel>
                <Select {...field} label="Thème">
                  <MenuItem value="dark">🌙 Sombre</MenuItem>
                  <MenuItem value="light">☀️ Clair</MenuItem>
                  <MenuItem value="faytek">⚡ Faytek</MenuItem>
                </Select>
              </FormControl>
            )}
          />
          <Controller
            name="langue"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth size="small">
                <InputLabel>Langue</InputLabel>
                <Select {...field} label="Langue">
                  <MenuItem value="fr">🇫🇷 Français</MenuItem>
                  <MenuItem value="en">🇬🇧 English</MenuItem>
                </Select>
              </FormControl>
            )}
          />
          <Controller
            name="fuseau"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth size="small">
                <InputLabel>Fuseau horaire</InputLabel>
                <Select {...field} label="Fuseau horaire">
                  <MenuItem value="Africa/Dakar">🌍 Africa/Dakar (GMT+0)</MenuItem>
                  <MenuItem value="Europe/Paris">🇫🇷 Europe/Paris (GMT+1/+2)</MenuItem>
                  <MenuItem value="UTC">🌐 UTC</MenuItem>
                  <MenuItem value="America/New_York">🇺🇸 America/New_York</MenuItem>
                </Select>
              </FormControl>
            )}
          />
        </Stack>
      </SectionCard>

      <SectionCard title="Notifications" icon="eva:bell-outline">
        <Stack spacing={2}>
          {[
            { key: 'email', label: 'Notifications Email', desc: 'Recevoir les alertes importantes par email' },
            { key: 'push', label: 'Notifications Push', desc: 'Alertes dans le navigateur' },
            { key: 'briefingMatinal', label: 'Briefing matinal', desc: 'Résumé quotidien automatique chaque matin' },
            { key: 'rappelsTaches', label: 'Rappels de tâches', desc: 'Notifications pour les tâches à échéance' },
          ].map((item) => (
            <Stack key={item.key} direction="row" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.label}</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>{item.desc}</Typography>
              </Box>
              <Switch
                checked={notifications[item.key] || false}
                onChange={(e) => setNotifications((prev) => ({ ...prev, [item.key]: e.target.checked }))}
              />
            </Stack>
          ))}
        </Stack>
      </SectionCard>

      <Button
        type="submit"
        variant="contained"
        disabled={saving}
        startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <Icon icon="eva:save-fill" />}
        sx={{ borderRadius: 1.5, fontWeight: 700 }}
      >
        {saving ? 'Enregistrement…' : 'Enregistrer'}
      </Button>
    </form>
  );
}

// ─── Onglet Compte ────────────────────────────────────────────────────────────
function CompteTab() {
  const { user, logout } = useAuth();

  return (
    <>
      <SectionCard title="Mon compte" icon="eva:person-outline">
        <Stack spacing={2}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar sx={{ width: 64, height: 64, fontSize: 26, bgcolor: 'primary.main' }}>
              {((user?.prenom || user?.email || 'U')[0]).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {[user?.prenom, user?.nom].filter(Boolean).join(' ') || 'Utilisateur'}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>{user?.email}</Typography>
              {user?.role && (
                <Chip label={user.role} size="small" color="primary" variant="outlined" sx={{ mt: 0.5 }} />
              )}
            </Box>
          </Stack>

          <Divider />

          <Stack spacing={1}>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>Prénom</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{user?.prenom || '—'}</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>Nom</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{user?.nom || '—'}</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>Email</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{user?.email || '—'}</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>Rôle</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{user?.role || '—'}</Typography>
            </Stack>
          </Stack>
        </Stack>
      </SectionCard>

      <SectionCard title="Danger Zone" icon="eva:alert-triangle-fill">
        <Stack spacing={1.5}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Déconnexion de votre session en cours. Vous serez redirigé vers la page de connexion.
          </Typography>
          <Button
            variant="outlined"
            color="error"
            startIcon={<Icon icon="eva:log-out-fill" />}
            onClick={logout}
            sx={{ borderRadius: 1.5, fontWeight: 700, alignSelf: 'flex-start' }}
          >
            Se déconnecter
          </Button>
        </Stack>
      </SectionCard>
    </>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function Settings() {
  const [tab, setTab] = useState(0);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 3 }}>Paramètres ⚙️</Typography>

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{ mb: 1, borderBottom: (t) => `1px solid ${alpha(t.palette.divider, 0.4)}` }}
      >
        <Tab label="Intégrations" icon={<Icon icon="eva:link-2-fill" width={18} />} iconPosition="start" />
        <Tab label="Préférences" icon={<Icon icon="eva:settings-2-fill" width={18} />} iconPosition="start" />
        <Tab label="Compte" icon={<Icon icon="eva:person-fill" width={18} />} iconPosition="start" />
      </Tabs>

      <TabPanel value={tab} index={0}>
        <IntegrationsTab />
      </TabPanel>

      <TabPanel value={tab} index={1}>
        <PreferencesTab />
      </TabPanel>

      <TabPanel value={tab} index={2}>
        <CompteTab />
      </TabPanel>
    </motion.div>
  );
}
