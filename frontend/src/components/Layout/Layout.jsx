import { Box } from '@mui/material';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const SIDEBAR_WIDTH = 220;

export default function Layout({ children }) {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', direction: 'rtl' }}>
      <Navbar sidebarWidth={SIDEBAR_WIDTH} />
      <Sidebar width={SIDEBAR_WIDTH} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          mt: '64px',
          mr: `${SIDEBAR_WIDTH}px`,
          p: 3,
          backgroundColor: 'background.default',
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
