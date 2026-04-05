import PropTypes from 'prop-types';
import SimpleBarReact from 'simplebar-react';
import { Box } from '@mui/material';

Scrollbar.propTypes = { children: PropTypes.node, sx: PropTypes.object };

export default function Scrollbar({ children, sx, ...other }) {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  if (isMobile) return <Box sx={{ overflowX: 'auto', ...sx }} {...other}>{children}</Box>;
  return (
    <SimpleBarReact clickOnTrack={false} style={{ maxHeight: '100%', ...sx }} {...other}>
      {children}
    </SimpleBarReact>
  );
}
