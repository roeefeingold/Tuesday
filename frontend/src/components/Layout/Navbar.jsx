import { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Box, Avatar, IconButton, Tooltip, Chip } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useAuth } from '../../context/AuthContext';
import { getInitials } from '../../utils/helpers';
import { get } from '../../api/client';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [solvedCount, setSolvedCount] = useState(0);

  useEffect(() => {
    if (user) {
      get('/tickets/stats')
        .then((res) => setSolvedCount(res.data?.by_status?.solved || 0))
        .catch(() => {});
    }
  }, [user]);

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        backgroundColor: '#fff',
        borderBottom: '1px solid #e0e0e0',
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar>
        {/* Right: Logo */}
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#0073ea' }}>
          Tuesday
        </Typography>

        {/* Center: Achievement */}
        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          {user && (
            <Tooltip title="תקלות שנסגרו">
              <Chip
                icon={<CheckCircleIcon sx={{ fontSize: 18 }} />}
                label={`${solvedCount} נסגרו`}
                size="small"
                sx={{
                  backgroundColor: '#e8f5e9',
                  color: '#2e7d32',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  '& .MuiChip-icon': { color: '#2e7d32' },
                }}
              />
            </Tooltip>
          )}
        </Box>

        {/* Left: User */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {user?.full_name}
          </Typography>
          <Avatar
            sx={{ width: 34, height: 34, bgcolor: '#0073ea', fontSize: '0.85rem' }}
          >
            {getInitials(user?.full_name)}
          </Avatar>
          <Tooltip title="התנתקות">
            <IconButton onClick={logout} size="small" sx={{ color: 'text.secondary' }}>
              <LogoutIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
