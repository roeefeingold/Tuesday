import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
} from '@mui/material';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('נא להזין אימייל וסיסמה');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login(email.trim(), password);
      navigate('/board');
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string') {
        setError(detail);
      } else {
        setError('אימייל או סיסמה שגויים');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #0073ea 100%)',
        p: 2,
      }}
    >
      <Paper
        elevation={8}
        sx={{
          p: 5,
          maxWidth: 420,
          width: '100%',
          borderRadius: 3,
          textAlign: 'center',
        }}
        dir="rtl"
      >
        <Typography
          variant="h3"
          sx={{ fontWeight: 800, color: '#0073ea', mb: 1 }}
        >
          Tuesday
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4 }}>
          מערכת ניהול תקלות לצוות
        </Typography>

        <form onSubmit={handleSubmit}>
          {error && (
            <Alert severity="error" sx={{ mb: 2, textAlign: 'right' }}>
              {error}
            </Alert>
          )}

          <TextField
            label="אימייל"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            sx={{ mb: 2.5 }}
            autoFocus
          />

          <TextField
            label="סיסמה"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            sx={{ mb: 3 }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={loading}
            sx={{ py: 1.3, fontSize: '1rem', mb: 2 }}
          >
            {loading ? 'מתחבר...' : 'כניסה'}
          </Button>
        </form>

        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {'אין לך חשבון? '}
          <Link to="/register" style={{ color: '#0073ea', textDecoration: 'none', fontWeight: 500 }}>
            הירשם כאן
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
}
