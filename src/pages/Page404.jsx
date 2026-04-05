import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
export default function Page404() {
  const navigate = useNavigate();
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', gap: 2 }}>
      <Typography variant="h1" sx={{ fontWeight: 900, color: 'primary.main' }}>404</Typography>
      <Typography variant="h5" sx={{ fontWeight: 700 }}>Page introuvable</Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>La page que vous cherchez n&apos;existe pas.</Typography>
      <Button variant="contained" onClick={() => navigate('/')} sx={{ mt: 2 }}>Retour à l&apos;accueil</Button>
    </Box>
  );
}
