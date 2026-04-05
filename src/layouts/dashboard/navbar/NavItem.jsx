import { useState } from 'react';
import { NavLink as RouterLink, useLocation } from 'react-router-dom';
import { Box, List, ListItemText, ListItemIcon, Collapse, ListItemButton } from '@mui/material';
import { alpha, styled } from '@mui/material/styles';
import { Icon } from '@iconify/react';

const ListItemStyle = styled(ListItemButton)(({ theme }) => ({
  ...theme.typography.body2,
  height: 48,
  position: 'relative',
  textTransform: 'capitalize',
  color: alpha(theme.palette.text.primary, 0.6),
  borderRadius: theme.shape.borderRadius,
  marginBottom: 2,
  '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.08), color: theme.palette.primary.main },
  '&.active': {
    color: theme.palette.primary.main,
    backgroundColor: alpha(theme.palette.primary.main, 0.12),
    fontWeight: theme.typography.fontWeightMedium,
    '&::before': { top: 0, right: 0, width: 3, bottom: 0, content: "''", display: 'block', position: 'absolute', borderRadius: '3px 0 0 3px', backgroundColor: theme.palette.primary.main },
  },
}));

const ListItemIconStyle = styled(ListItemIcon)({ width: 22, height: 22, color: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 'auto', marginRight: 16 });

function NavItemRoot({ item, open, onOpen }) {
  const { title, path, icon, children } = item;
  const { pathname } = useLocation();
  const base = path?.split('/').slice(0, 3).join('/');
  const isActive = children ? (base && pathname.startsWith(base) && base.length > 12) : pathname === path || pathname.startsWith(path + '/');

  if (children) {
    return (
      <ListItemStyle onClick={onOpen} className={isActive ? 'active' : ''}>
        <ListItemIconStyle>{icon}</ListItemIconStyle>
        <ListItemText disableTypography primary={title} />
        <Icon icon={open ? 'eva:arrow-ios-downward-fill' : 'eva:arrow-ios-forward-fill'} width={16} style={{ flexShrink: 0, color: 'inherit', opacity: 0.6 }} />
      </ListItemStyle>
    );
  }
  return (
    <ListItemStyle component={RouterLink} to={path} className={isActive ? 'active' : ''}>
      <ListItemIconStyle>{icon}</ListItemIconStyle>
      <ListItemText disableTypography primary={title} />
    </ListItemStyle>
  );
}

function NavItemSub({ item }) {
  const { pathname } = useLocation();
  return (
    <ListItemStyle component={RouterLink} to={item.path} sx={{ height: 40, pl: 5 }} className={pathname === item.path ? 'active' : ''}>
      <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'currentColor', mr: 2, opacity: 0.5, flexShrink: 0 }} />
      <ListItemText disableTypography primary={item.title} />
    </ListItemStyle>
  );
}

export default function NavItem({ item }) {
  const { children } = item;
  const [open, setOpen] = useState(false);
  return (
    <>
      <NavItemRoot item={item} open={open} onOpen={() => setOpen(v => !v)} />
      {children && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {children.map((sub) => <NavItemSub key={sub.title} item={sub} />)}
          </List>
        </Collapse>
      )}
    </>
  );
}
