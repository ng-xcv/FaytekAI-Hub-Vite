import { Box, CircularProgress } from '@mui/material';
export default function LoadingScreen() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', bgcolor: 'background.default' }}>
      <CircularProgress size={48} sx={{ color: 'primary.main' }} />
    </Box>
  );
}
