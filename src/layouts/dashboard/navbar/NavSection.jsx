import { List, Box, ListSubheader } from '@mui/material';
import { styled } from '@mui/material/styles';
import NavItem from './NavItem';

const ListSubheaderStyle = styled(ListSubheader)(({ theme }) => ({
  ...theme.typography.overline,
  fontSize: 11,
  paddingTop: theme.spacing(3),
  paddingLeft: theme.spacing(2),
  paddingBottom: theme.spacing(1),
  color: theme.palette.text.disabled,
}));

export default function NavSection({ navConfig }) {
  return (
    <Box>
      {navConfig.map((group) => (
        <List key={group.subheader} disablePadding sx={{ px: 2 }}>
          <ListSubheaderStyle disableSticky disableGutters>{group.subheader}</ListSubheaderStyle>
          {group.items.map((item) => <NavItem key={item.title} item={item} />)}
        </List>
      ))}
    </Box>
  );
}
