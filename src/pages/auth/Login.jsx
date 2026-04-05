import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { Box, Stack, Typography, TextField, Button, Divider, Alert, InputAdornment, IconButton, Paper } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import { useSnackbar } from 'notistack';
import useAuth from '../../hooks/useAuth';
import { PATH_DASHBOARD } from '../../routes/paths';

const schema = Yup.object({ email: Yup.string().email('Email invalide').required('Email requis'), password: Yup.string().required('Mot de passe requis') });

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async (values) => {
    setLoading(true); setError('');
    try {
      await login(values.email, values.password);
      navigate(PATH_DASHBOARD.root);
      enqueueSnackbar('Connexion réussie !', { variant: 'success' });
    } catch (err) {
      setError(err?.message || err || 'Identifiants incorrects');
    }
    setLoading(false);
  };

  const handleMicrosoftLogin = () => {
    window.location.href = `${import.meta.env.VITE_HOST_API_KEY || ''}/api/auth/microsoft/redirect`;
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', p: 2 }}>
      <Paper elevation={0} sx={{ width: '100%', maxWidth: 420, p: 4, borderRadius: 3, bgcolor: 'background.paper', border: (t) => `1px solid ${alpha(t.palette.primary.main, 0.12)}` }}>
        <Stack alignItems="center" spacing={1} sx={{ mb: 4 }}>
          <Box sx={{ width: 52, height: 52, borderRadius: 2, bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography sx={{ fontSize: 22, fontWeight: 900, color: 'primary.contrastText' }}>F</Typography>
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>FaytekAI Hub</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>Connectez-vous à votre espace</Typography>
        </Stack>

        <Button fullWidth variant="outlined" size="large" startIcon={<Icon icon="logos:microsoft-icon" width={20} />}
          onClick={handleMicrosoftLogin}
          sx={{ mb: 2, borderRadius: 1.5, borderColor: (t) => alpha(t.palette.text.primary, 0.2), color: 'text.primary', fontWeight: 600 }}>
          Continuer avec Microsoft
        </Button>

        <Divider sx={{ my: 2 }}><Typography variant="body2" sx={{ color: 'text.disabled', px: 1 }}>ou</Typography></Divider>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={2.5}>
            <TextField label="Email" type="email" fullWidth {...register('email')} error={!!errors.email} helperText={errors.email?.message} />
            <TextField label="Mot de passe" type={showPassword ? 'text' : 'password'} fullWidth {...register('password')} error={!!errors.password} helperText={errors.password?.message}
              InputProps={{ endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowPassword(v => !v)} edge="end"><Icon icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} width={20} /></IconButton></InputAdornment> }} />
            <Button type="submit" fullWidth variant="contained" size="large" disabled={loading} sx={{ borderRadius: 1.5, fontWeight: 700, py: 1.5 }}>
              {loading ? 'Connexion...' : 'Se connecter'}
            </Button>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
}
