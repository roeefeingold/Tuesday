import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';
import App from './App';
import './index.css';

const cacheRtl = createCache({
  key: 'muirtl',
  stylisPlugins: [prefixer, rtlPlugin],
});

const theme = createTheme({
  direction: 'rtl',
  palette: {
    primary: { main: '#0073ea' },
    secondary: { main: '#00c875' },
    background: { default: '#f6f7fb', paper: '#ffffff' },
  },
  typography: {
    fontFamily: "'Rubik', 'Inter', system-ui, sans-serif",
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 500 },
      },
    },
    MuiTextField: {
      defaultProps: { size: 'small' },
    },
  },
});

// Set RTL via HTML attribute - this controls flexbox/grid direction
// stylis-plugin-rtl flips CSS margin/padding but also flips direction:rtl to ltr
// The HTML dir attribute takes precedence for layout flow
document.documentElement.dir = 'rtl';
document.documentElement.lang = 'he';
document.body.dir = 'rtl';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CacheProvider value={cacheRtl}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ThemeProvider>
    </CacheProvider>
  </React.StrictMode>
);
