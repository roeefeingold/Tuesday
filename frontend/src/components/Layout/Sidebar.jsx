import { Drawer, List, ListItemButton, ListItemIcon, ListItemText, Toolbar } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { label: '\u05DC\u05D5\u05D7', icon: <DashboardIcon />, path: '/board' },
  { label: '\u05D4\u05E7\u05E8\u05D9\u05D0\u05D5\u05EA \u05E9\u05DC\u05D9', icon: <AssignmentIndIcon />, path: '/board?my=1' },
];

const ADMIN_ITEM = { label: '\u05E0\u05D9\u05D4\u05D5\u05DC', icon: <AdminPanelSettingsIcon />, path: '/admin' };

export default function Sidebar({ width }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin } = useAuth();

  const items = isAdmin ? [...NAV_ITEMS, ADMIN_ITEM] : NAV_ITEMS;

  const isActive = (path) => {
    if (path === '/board?my=1') return location.pathname === '/board' && location.search === '?my=1';
    if (path === '/board') return location.pathname === '/board' && location.search !== '?my=1';
    return location.pathname === path;
  };

  return (
    <Drawer
      variant="permanent"
      anchor="right"
      sx={{
        width,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width,
          boxSizing: 'border-box',
          borderLeft: '1px solid #e0e0e0',
          borderRight: 'none',
          backgroundColor: '#fff',
        },
      }}
    >
      <Toolbar />
      <List sx={{ pt: 1 }}>
        {items.map((item) => (
          <ListItemButton
            key={item.path}
            selected={isActive(item.path)}
            onClick={() => navigate(item.path)}
            sx={{
              mx: 1,
              borderRadius: 1,
              mb: 0.5,
              '&.Mui-selected': {
                backgroundColor: 'rgba(0, 115, 234, 0.08)',
                '&:hover': { backgroundColor: 'rgba(0, 115, 234, 0.12)' },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: isActive(item.path) ? 'primary.main' : 'text.secondary' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{
                fontSize: '0.9rem',
                fontWeight: isActive(item.path) ? 600 : 400,
                color: isActive(item.path) ? 'primary.main' : 'text.primary',
              }}
            />
          </ListItemButton>
        ))}
      </List>
    </Drawer>
  );
}
