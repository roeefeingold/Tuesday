import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import App from './App';
import './index.css';

const theme = createTheme({
  direction: 'rtl',
  palette: {
    primary: { main: '#0073ea' },
    secondary: { main: '#00c875' },
    background: { default: '#f6f7fb', paper: '#ffffff' },
  },
  typography: {
    fontFamily: "'Rubik', 'Inter', sans-serif",
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
    MuiInputBase: {
      styleOverrides: {
        root: { direction: 'rtl' },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        notchedOutline: {
          textAlign: 'right',
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          right: 14,
          left: 'auto',
          transformOrigin: 'top right',
        },
      },
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);
