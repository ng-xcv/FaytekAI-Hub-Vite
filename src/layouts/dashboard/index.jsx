import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';
import useResponsive from '../../hooks/useResponsive';
import { HEADER, NAVBAR } from '../../config';
import DashboardHeader from './header/DashboardHeader';
import NavbarVertical from './navbar/NavbarVertical';

const MainStyle = styled('main')(({ theme }) => ({
  flexGrow: 1,
  paddingTop: HEADER.MOBILE_HEIGHT + 24,
  paddingBottom: HEADER.MOBILE_HEIGHT + 24,
  paddingLeft: 16,
  paddingRight: 16,
  [theme.breakpoints.up('lg')]: {
    paddingTop: HEADER.DASHBOARD_DESKTOP_HEIGHT + 24,
    paddingBottom: HEADER.DASHBOARD_DESKTOP_HEIGHT + 24,
    paddingLeft: 24,
    paddingRight: 24,
    marginLeft: NAVBAR.DASHBOARD_WIDTH,
    width: `calc(100% - ${NAVBAR.DASHBOARD_WIDTH}px)`,
  },
}));

export default function DashboardLayout() {
  const [open, setOpen] = useState(false);
  return (
    <Box sx={{ minHeight: '100vh' }}>
      <DashboardHeader onOpenSidebar={() => setOpen(true)} />
      <NavbarVertical isOpenSidebar={open} onCloseSidebar={() => setOpen(false)} />
      <MainStyle>
        <Outlet />
      </MainStyle>
    </Box>
  );
}
