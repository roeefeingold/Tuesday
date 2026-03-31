import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, Box, Avatar, Chip,
  Menu, MenuItem, ListItemIcon, ListItemText, Divider,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useAuth } from '../../context/AuthContext';
import { getInitials } from '../../utils/helpers';
import { get } from '../../api/client';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [solvedCount, setSolvedCount] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    if (user) {
      get('/tickets/stats')
        .then((res) => setSolvedCount(res.data?.by_status?.solved || 0))
        .catch(() => {});
    }
  }, [user]);

  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = () => {
    handleMenuClose();
    logout();
  };

  const handleAdmin = () => {
    handleMenuClose();
    navigate('/admin');
  };

  const handleClosedClick = () => {
    navigate('/closed');
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        backgroundColor: '#fff',
        borderBottom: '1px solid #e0e0e0',
        zIndex: 1201,
      }}
    >
      <Toolbar dir="rtl">
        <Typography
          variant="h5"
          sx={{ fontWeight: 700, color: '#0073ea', cursor: 'pointer' }}
          onClick={() => navigate('/board')}
        >
          Tuesday
        </Typography>

        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          {user && (
            <Chip
              icon={<CheckCircleIcon sx={{ fontSize: 18 }} />}
              label={`${solvedCount} נסגרו`}
              size="small"
              onClick={handleClosedClick}
              sx={{
                backgroundColor: '#e8f5e9',
                color: '#2e7d32',
                fontWeight: 600,
                fontSize: '0.8rem',
                cursor: 'pointer',
                '&:hover': { backgroundColor: '#c8e6c9' },
                '& .MuiChip-icon': { color: '#2e7d32' },
              }}
            />
          )}
        </Box>

        <Box
          sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }}
          onClick={handleMenuOpen}
        >
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {user?.full_name}
          </Typography>
          <Avatar sx={{ width: 34, height: 34, bgcolor: '#0073ea', fontSize: '0.85rem' }}>
            {getInitials(user?.full_name)}
          </Avatar>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          slotProps={{ paper: { sx: { minWidth: 160, mt: 1 } } }}
        >
          {isAdmin && (
            <MenuItem onClick={handleAdmin}>
              <ListItemIcon><AdminPanelSettingsIcon fontSize="small" /></ListItemIcon>
              <ListItemText>ניהול מערכת</ListItemText>
            </MenuItem>
          )}
          {isAdmin && <Divider />}
          <MenuItem onClick={handleLogout}>
            <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
            <ListItemText>התנתקות</ListItemText>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
