import { Box } from '@mui/material';
import Navbar from './Navbar';

export default function Layout({ children }) {
  return (
    <Box dir="rtl" sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      <Navbar />
      <Box
        component="main"
        dir="rtl"
        sx={{
          mt: '64px',
          p: { xs: 2, md: 3 },
          maxWidth: 1400,
          mx: 'auto',
          textAlign: 'right',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
