import { Box, Typography } from '@mui/material';
export default function Settings() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 3 }}>Paramètres</Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>Module en cours de développement...</Typography>
    </Box>
  );
}
