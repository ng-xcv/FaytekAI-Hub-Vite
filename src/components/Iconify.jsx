import { Icon } from '@iconify/react';
import { Box } from '@mui/material';
export default function Iconify({ icon, sx, width = 20, ...other }) {
  return <Box component={Icon} icon={icon} sx={{ width, height: width, ...sx }} {...other} />;
}
