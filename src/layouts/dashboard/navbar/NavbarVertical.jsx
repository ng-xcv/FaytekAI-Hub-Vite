import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { styled, alpha } from '@mui/material/styles';
import { Box, Stack, Drawer, Typography, Divider } from '@mui/material';
import { Icon } from '@iconify/react';
import useResponsive from '../../../hooks/useResponsive';
import useAuth from '../../../hooks/useAuth';
import NavSection from './NavSection';
import navConfig from './NavConfig';
import { NAVBAR } from '../../../config';

function FaytekLogo() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', px: 2.5, py: 2.5 }}>
      <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 1.5, flexShrink: 0 }}>
        <Typography sx={{ fontSize: 16, fontWeight: 900, color: 'primary.contrastText', lineHeight: 1 }}>F</Typography>
      </Box>
      <Box>
        <Typography variant="subtitle1" sx={{ color: 'text.primary', fontWeight: 800, lineHeight: 1.2 }}>FaytekAI</Typography>
        <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600 }}>Hub ✦</Typography>
      </Box>
    </Box>
  );
}

function NavbarAccount({ user }) {
  return (
    <Stack direction="row" alignItems="center" sx={{ px: 2, py: 1.5 }} spacing={1.5}>
      <Box sx={{ width: 38, height: 38, borderRadius: '50%', bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 14, fontWeight: 700, color: 'primary.contrastText' }}>
        {(user?.prenom || user?.name || 'U')[0].toUpperCase()}
      </Box>
      <Box sx={{ overflow: 'hidden' }}>
        <Typography variant="subtitle2" noWrap>{user?.prenom} {user?.nom}</Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap>{user?.role || 'Utilisateur'}</Typography>
      </Box>
    </Stack>
  );
}

function SidebarInner({ user }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <FaytekLogo />
      <Divider sx={{ borderStyle: 'dashed' }} />
      <NavbarAccount user={user} />
      <Divider sx={{ borderStyle: 'dashed', mb: 0.5 }} />
      <Box sx={{ flexGrow: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        <NavSection navConfig={navConfig} />
      </Box>
      <Box sx={{ p: 2, flexShrink: 0 }}>
        <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: (t) => alpha(t.palette.primary.main, 0.06), border: (t) => `1px dashed ${alpha(t.palette.primary.main, 0.2)}` }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Icon icon="eva:flash-fill" width={14} />
            <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600 }}>FaytekAI Hub v2.0</Typography>
          </Stack>
          <Typography variant="caption" display="block" sx={{ color: 'text.disabled', mt: 0.3 }}>© 2026 Faytek Solution</Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default function NavbarVertical({ isOpenSidebar, onCloseSidebar }) {
  const { pathname } = useLocation();
  const isDesktop = useResponsive('up', 'lg');
  const { user } = useAuth();

  useEffect(() => {
    if (isOpenSidebar) onCloseSidebar();
  }, [pathname]); // eslint-disable-line

  return (
    <>
      {/* Mobile: Drawer overlay */}
      <Drawer
        open={isDesktop ? false : isOpenSidebar}
        onClose={onCloseSidebar}
        PaperProps={{ sx: { width: NAVBAR.DASHBOARD_WIDTH } }}
      >
        <SidebarInner user={user} />
      </Drawer>

      {/* Desktop: sidebar fixe via Box */}
      <Box
        sx={{
          display: { xs: 'none', lg: 'block' },
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: NAVBAR.DASHBOARD_WIDTH,
          zIndex: 1200,
          bgcolor: 'background.default',
          borderRight: (t) => `1px dashed ${alpha(t.palette.divider, 1)}`,
          boxShadow: 'none',
        }}
      >
        <SidebarInner user={user} />
      </Box>
    </>
  );
}
