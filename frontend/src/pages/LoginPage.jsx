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
      setError('\u05E0\u05D0 \u05DC\u05D4\u05D6\u05D9\u05DF \u05D0\u05D9\u05DE\u05D9\u05D9\u05DC \u05D5\u05E1\u05D9\u05E1\u05DE\u05D4');
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
        setError('\u05D0\u05D9\u05DE\u05D9\u05D9\u05DC \u05D0\u05D5 \u05E1\u05D9\u05E1\u05DE\u05D4 \u05E9\u05D2\u05D5\u05D9\u05D9\u05DD');
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
      >
        <Typography
          variant="h3"
          sx={{ fontWeight: 800, color: '#0073ea', mb: 1 }}
        >
          Tuesday
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4 }}>
          {'\u05DE\u05E2\u05E8\u05DB\u05EA \u05E0\u05D9\u05D4\u05D5\u05DC \u05E7\u05E8\u05D9\u05D0\u05D5\u05EA \u05DC\u05E6\u05D5\u05D5\u05EA'}
        </Typography>

        <form onSubmit={handleSubmit}>
          {error && (
            <Alert severity="error" sx={{ mb: 2, textAlign: 'right' }}>
              {error}
            </Alert>
          )}

          <TextField
            label={'\u05D0\u05D9\u05DE\u05D9\u05D9\u05DC'}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
            autoFocus
          />

          <TextField
            label={'\u05E1\u05D9\u05E1\u05DE\u05D4'}
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
            {loading ? '\u05DE\u05EA\u05D7\u05D1\u05E8...' : '\u05DB\u05E0\u05D9\u05E1\u05D4'}
          </Button>
        </form>

        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {'\u05D0\u05D9\u05DF \u05DC\u05DA \u05D7\u05E9\u05D1\u05D5\u05DF? '}
          <Link to="/register" style={{ color: '#0073ea', textDecoration: 'none', fontWeight: 500 }}>
            {'\u05D4\u05D9\u05E8\u05E9\u05DD \u05DB\u05D0\u05DF'}
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
}
