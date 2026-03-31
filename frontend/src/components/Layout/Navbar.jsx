import { AppBar, Toolbar, Typography, Box, Avatar, IconButton, Tooltip } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../../context/AuthContext';
import { getInitials } from '../../utils/helpers';

export default function Navbar({ sidebarWidth }) {
  const { user, logout } = useAuth();

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
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#0073ea' }}>
          Tuesday
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {user?.full_name}
          </Typography>
          <Avatar
            sx={{
              width: 34,
              height: 34,
              bgcolor: '#0073ea',
              fontSize: '0.85rem',
            }}
          >
            {getInitials(user?.full_name)}
          </Avatar>
          <Tooltip title="\u05D4\u05EA\u05E0\u05EA\u05E7\u05D5\u05EA">
            <IconButton onClick={logout} size="small" sx={{ color: 'text.secondary' }}>
              <LogoutIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
