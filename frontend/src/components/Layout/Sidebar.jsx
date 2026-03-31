import { Drawer, List, ListItemButton, ListItemIcon, ListItemText, Toolbar } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { label: 'לוח', icon: <DashboardIcon />, path: '/board' },
];

const ADMIN_ITEM = { label: 'ניהול', icon: <AdminPanelSettingsIcon />, path: '/admin' };

export default function Sidebar({ width }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin } = useAuth();

  const items = isAdmin ? [...NAV_ITEMS, ADMIN_ITEM] : NAV_ITEMS;

  const isActive = (path) => location.pathname === path;

  return (
    <Drawer
      variant="permanent"
      sx={{
        width,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width,
          boxSizing: 'border-box',
          backgroundColor: '#fff',
        },
      }}
    >
      <Toolbar />
      <List sx={{ pt: 1, px: 1 }}>
        {items.map((item) => (
          <ListItemButton
            key={item.path}
            selected={isActive(item.path)}
            onClick={() => navigate(item.path)}
            sx={{
              borderRadius: 1.5,
              mb: 0.5,
              py: 1.2,
              '&.Mui-selected': {
                backgroundColor: 'rgba(0, 115, 234, 0.08)',
                '&:hover': { backgroundColor: 'rgba(0, 115, 234, 0.12)' },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 36, color: isActive(item.path) ? 'primary.main' : 'text.secondary' }}>
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
