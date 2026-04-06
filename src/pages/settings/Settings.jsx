import { useState } from 'react';
import {
  Box, Typography, Stack, Card, CardContent, Grid, Button, TextField,
  Switch, FormControlLabel, Divider, Avatar, Chip, Tab, Tabs, Alert, CircularProgress,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
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

export default function Settings() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true, push: false, telegram: true, daily_briefing: true,
  });
  const [appearance, setAppearance] = useState({ theme: 'dark', language: 'fr', compact: false });

  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: {
      prenom: user?.prenom || user?.firstName || '',
      nom: user?.nom || user?.lastName || '',
      email: user?.email || '',
    },
  });

  const onSubmitProfile = async (data) => {
    setSaving(true);
    try {
      await axiosInstance.put('/api/auth/profile', data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {}
    setSaving(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 3 }}>Paramètres</Typography>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 1, borderBottom: (t) => `1px solid ${alpha(t.palette.divider, 0.4)}` }}>
        <Tab label="Profil" icon={<Icon icon="eva:person-fill" width={18} />} iconPosition="start" />
        <Tab label="Notifications" icon={<Icon icon="eva:bell-fill" width={18} />} iconPosition="start" />
        <Tab label="Apparence" icon={<Icon icon="eva:monitor-fill" width={18} />} iconPosition="start" />
        <Tab label="Sécurité" icon={<Icon icon="eva:shield-fill" width={18} />} iconPosition="start" />
      </Tabs>

      {/* Profile Tab */}
      <TabPanel value={tab} index={0}>
        {saved && <Alert severity="success" sx={{ mb: 2 }}>Profil enregistré avec succès !</Alert>}

        <SectionCard title="Informations personnelles" icon="eva:person-outline">
          <form onSubmit={handleSubmit(onSubmitProfile)}>
            <Stack spacing={2.5}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Avatar sx={{ width: 72, height: 72, fontSize: 28, bgcolor: 'primary.main' }}>
                  {(user?.prenom || user?.firstName || user?.email || 'U')[0].toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{user?.prenom || user?.name || 'Utilisateur'}</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>{user?.email}</Typography>
                </Box>
              </Box>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField {...register('prenom')} label="Prénom" fullWidth />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField {...register('nom')} label="Nom" fullWidth />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField {...register('email')} label="Email" type="email" fullWidth />
                </Grid>
              </Grid>

              <Box>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting || saving}
                  startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <Icon icon="eva:save-fill" />}
                  sx={{ borderRadius: 1.5, fontWeight: 700 }}
                >
                  Enregistrer
                </Button>
              </Box>
            </Stack>
          </form>
        </SectionCard>
      </TabPanel>

      {/* Notifications Tab */}
      <TabPanel value={tab} index={1}>
        <SectionCard title="Canaux de notification" icon="eva:bell-outline">
          <Stack spacing={2}>
            {[
              { key: 'email', label: 'Notifications Email', desc: 'Recevoir les alertes par email' },
              { key: 'push', label: 'Notifications Push', desc: 'Alertes dans le navigateur' },
              { key: 'telegram', label: 'Telegram', desc: 'Messages via Telegram bot' },
              { key: 'daily_briefing', label: 'Briefing quotidien', desc: 'Résumé journalier automatique' },
            ].map((item) => (
              <Stack key={item.key} direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.label}</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>{item.desc}</Typography>
                </Box>
                <Switch
                  checked={notifications[item.key]}
                  onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                />
              </Stack>
            ))}
          </Stack>
        </SectionCard>
      </TabPanel>

      {/* Appearance Tab */}
      <TabPanel value={tab} index={2}>
        <SectionCard title="Thème et affichage" icon="eva:monitor-outline">
          <Stack spacing={2.5}>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Thème</Typography>
              <Stack direction="row" spacing={1}>
                {['light', 'dark', 'system'].map((t) => (
                  <Button
                    key={t}
                    variant={appearance.theme === t ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => setAppearance({ ...appearance, theme: t })}
                    sx={{ borderRadius: 1.5, textTransform: 'capitalize', fontWeight: 600 }}
                  >
                    {t === 'light' ? '☀️ Clair' : t === 'dark' ? '🌙 Sombre' : '💻 Système'}
                  </Button>
                ))}
              </Stack>
            </Box>
            <FormControlLabel
              control={<Switch checked={appearance.compact} onChange={(e) => setAppearance({ ...appearance, compact: e.target.checked })} />}
              label="Mode compact"
            />
          </Stack>
        </SectionCard>
      </TabPanel>

      {/* Security Tab */}
      <TabPanel value={tab} index={3}>
        <SectionCard title="Mot de passe" icon="eva:lock-outline">
          <Stack spacing={2}>
            <TextField label="Mot de passe actuel" type="password" fullWidth />
            <TextField label="Nouveau mot de passe" type="password" fullWidth />
            <TextField label="Confirmer le nouveau mot de passe" type="password" fullWidth />
            <Button variant="contained" sx={{ borderRadius: 1.5, fontWeight: 700, alignSelf: 'flex-start' }}>
              Changer le mot de passe
            </Button>
          </Stack>
        </SectionCard>

        <SectionCard title="Danger Zone" icon="eva:alert-triangle-fill">
          <Stack spacing={2}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Ces actions sont irréversibles. Procédez avec prudence.
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
      </TabPanel>
    </motion.div>
  );
}
