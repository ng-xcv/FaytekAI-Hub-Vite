import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { styled, alpha } from '@mui/material/styles';
import { Box, Stack, AppBar, Toolbar, Typography, Avatar, MenuItem, Divider, IconButton, Popover, Tooltip, Badge, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import { Icon } from '@iconify/react';
import { useSnackbar } from 'notistack';
import useResponsive from '../../../hooks/useResponsive';
import useAuth from '../../../hooks/useAuth';
import { PATH_AUTH } from '../../../routes/paths';
import { HEADER, NAVBAR } from '../../../config';
import { toggleTheme } from '../../../redux/slices/settingsSlice';

const RootStyle = styled(AppBar)(({ theme }) => ({
  boxShadow: 'none',
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)',
  backgroundColor: alpha(theme.palette.background.default, 0.85),
  borderBottom: `1px dashed ${alpha(theme.palette.primary.main, 0.16)}`,
  height: HEADER.MOBILE_HEIGHT,
  zIndex: theme.zIndex.appBar + 1,
  [theme.breakpoints.up('lg')]: {
    height: HEADER.DASHBOARD_DESKTOP_HEIGHT,
    width: `calc(100% - ${NAVBAR.DASHBOARD_WIDTH + 1}px)`,
  },
}));

function AccountPopover() {
  const navigate = useNavigate();
  const { user, logout, updateProfile } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [anchor, setAnchor] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ prenom: '', nom: '', telephone: '', password: '' });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');

  const openProfile = () => {
    setForm({ prenom: user?.prenom || '', nom: user?.nom || '', telephone: user?.telephone || '', password: '' });
    setAvatarFile(null);
    setAvatarPreview(user?.avatar || '');
    setAnchor(null);
    setProfileOpen(true);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { prenom: form.prenom, nom: form.nom, telephone: form.telephone };
      if (form.password) payload.password = form.password;
      if (avatarFile) payload.avatar = avatarFile;
      await updateProfile(payload);
      enqueueSnackbar('Profil mis à jour', { variant: 'success' });
      setProfileOpen(false);
    } catch {
      enqueueSnackbar('Erreur mise à jour', { variant: 'error' });
    }
    setSaving(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate(PATH_AUTH.login);
  };

  return (
    <>
      <IconButton onClick={(e) => setAnchor(e.currentTarget)} sx={{ p: 0.5 }}>
        <Avatar src={user?.avatar} sx={{ width: 34, height: 34, bgcolor: 'primary.main', fontSize: 13, fontWeight: 700, color: 'primary.contrastText' }}>
          {(user?.prenom || user?.name || 'U')[0].toUpperCase()}
        </Avatar>
      </IconButton>
      <Popover open={Boolean(anchor)} anchorEl={anchor} onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ sx: { mt: 1.5, width: 240, borderRadius: 2 } }}>
        <Box sx={{ my: 1.5, px: 2.5 }}>
          <Typography variant="subtitle2" noWrap>{user?.prenom} {user?.nom || user?.name}</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>{user?.email}</Typography>
        </Box>
        <Divider sx={{ borderStyle: 'dashed' }} />
        <MenuItem onClick={openProfile} sx={{ m: 1, borderRadius: 1 }}>
          <Icon icon="eva:person-fill" width={18} style={{ marginRight: 8 }} /> Mon profil
        </MenuItem>
        <MenuItem onClick={handleLogout} sx={{ m: 1, borderRadius: 1, color: 'error.main', '&:hover': { bgcolor: alpha('#FF4842', 0.08) } }}>
          <Icon icon="eva:log-out-fill" width={18} style={{ marginRight: 8 }} /> Se déconnecter
        </MenuItem>
      </Popover>
      <Dialog open={profileOpen} onClose={() => setProfileOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Mon profil</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            <Stack alignItems="center" spacing={1}>
              <Box sx={{ position: 'relative', cursor: 'pointer' }} onClick={() => document.getElementById('avatar-upload').click()}>
                <Avatar src={avatarPreview} sx={{ width: 80, height: 80, bgcolor: 'primary.main', fontSize: 28 }}>
                  {form.prenom?.[0]?.toUpperCase()}
                </Avatar>
                <Box sx={{ position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: '50%', bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid', borderColor: 'background.paper' }}>
                  <Icon icon="eva:camera-fill" width={14} />
                </Box>
              </Box>
              <input id="avatar-upload" type="file" accept="image/*" hidden onChange={handleAvatarChange} />
            </Stack>
            <Stack direction="row" spacing={2}>
              <TextField label="Prénom" value={form.prenom} onChange={(e) => setForm(f => ({ ...f, prenom: e.target.value }))} fullWidth />
              <TextField label="Nom" value={form.nom} onChange={(e) => setForm(f => ({ ...f, nom: e.target.value }))} fullWidth />
            </Stack>
            <TextField label="Email" value={user?.email || ''} disabled fullWidth />
            <TextField label="Téléphone" value={form.telephone} onChange={(e) => setForm(f => ({ ...f, telephone: e.target.value }))} fullWidth />
            <TextField label="Nouveau mot de passe" type="password" value={form.password} onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))} fullWidth helperText="Laisser vide pour ne pas changer" />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button variant="outlined" color="inherit" onClick={() => setProfileOpen(false)}>Annuler</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>{saving ? 'Enregistrement...' : 'Enregistrer'}</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default function DashboardHeader({ onOpenSidebar }) {
  const isDesktop = useResponsive('up', 'lg');
  const dispatch = useDispatch();
  const themeMode = useSelector(s => s.settings.themeMode);
  const unreadCount = useSelector(s => s.notification.unreadCount);
  const themeIcons = { dark: 'eva:moon-fill', light: 'eva:sun-fill', gold: 'eva:star-fill' };

  return (
    <RootStyle>
      <Toolbar sx={{ minHeight: '100% !important', px: { lg: 5 } }}>
        {!isDesktop && (
          <IconButton onClick={onOpenSidebar} sx={{ mr: 1, color: 'text.primary' }}>
            <Icon icon="eva:menu-2-fill" width={22} />
          </IconButton>
        )}
        <Box sx={{ flexGrow: 1 }} />
        <Stack direction="row" alignItems="center" spacing={1}>
          <Tooltip title={`Thème actuel : ${themeMode}`}>
            <IconButton onClick={() => dispatch(toggleTheme())} sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}>
              <Icon icon={themeIcons[themeMode] || 'eva:moon-fill'} width={22} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Notifications">
            <IconButton sx={{ color: 'text.secondary' }}>
              <Badge badgeContent={unreadCount} color="error" max={99}>
                <Icon icon="eva:bell-fill" width={22} />
              </Badge>
            </IconButton>
          </Tooltip>
          <AccountPopover />
        </Stack>
      </Toolbar>
    </RootStyle>
  );
}
