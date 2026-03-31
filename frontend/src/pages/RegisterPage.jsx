import { useState } from 'react';
import { Link } from 'react-router-dom';
import { post } from '../api/client';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim() || !email.trim() || !password) {
      setError('\u05E0\u05D0 \u05DC\u05DE\u05DC\u05D0 \u05D0\u05EA \u05DB\u05DC \u05D4\u05E9\u05D3\u05D5\u05EA');
      return;
    }
    if (password.length < 6) {
      setError('\u05D4\u05E1\u05D9\u05E1\u05DE\u05D4 \u05D7\u05D9\u05D9\u05D1\u05EA \u05DC\u05D4\u05DB\u05D9\u05DC \u05DC\u05E4\u05D7\u05D5\u05EA 6 \u05EA\u05D5\u05D5\u05D9\u05DD');
      return;
    }
    if (password !== confirmPassword) {
      setError('\u05D4\u05E1\u05D9\u05E1\u05DE\u05D0\u05D5\u05EA \u05DC\u05D0 \u05EA\u05D5\u05D0\u05DE\u05D5\u05EA');
      return;
    }

    setLoading(true);
    try {
      await post('/auth/register', {
        full_name: fullName.trim(),
        email: email.trim(),
        password,
      });
      setSuccess(true);
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string') {
        setError(detail);
      } else {
        setError('\u05D4\u05D4\u05E8\u05E9\u05DE\u05D4 \u05E0\u05DB\u05E9\u05DC\u05D4. \u05E0\u05E1\u05D4 \u05E9\u05D5\u05D1.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
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
          sx={{ p: 5, maxWidth: 420, width: '100%', borderRadius: 3, textAlign: 'center' }}
        >
          <CheckCircleOutlineIcon sx={{ fontSize: 60, color: '#00c875', mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
            {'\u05D4\u05D4\u05E8\u05E9\u05DE\u05D4 \u05D4\u05EA\u05E7\u05D1\u05DC\u05D4!'}
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
            {'\u05DE\u05E0\u05D4\u05DC \u05D4\u05DE\u05E2\u05E8\u05DB\u05EA \u05D9\u05D0\u05E9\u05E8 \u05D0\u05EA \u05D7\u05E9\u05D1\u05D5\u05E0\u05DA.'}
          </Typography>
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <Button variant="contained" size="large">
              {'\u05D7\u05D6\u05E8\u05D4 \u05DC\u05D4\u05EA\u05D7\u05D1\u05E8\u05D5\u05EA'}
            </Button>
          </Link>
        </Paper>
      </Box>
    );
  }

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
        sx={{ p: 5, maxWidth: 420, width: '100%', borderRadius: 3, textAlign: 'center' }}
      >
        <Typography variant="h3" sx={{ fontWeight: 800, color: '#0073ea', mb: 1 }}>
          Tuesday
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4 }}>
          {'\u05D4\u05E8\u05E9\u05DE\u05D4 \u05DC\u05DE\u05E2\u05E8\u05DB\u05EA'}
        </Typography>

        <form onSubmit={handleSubmit}>
          {error && (
            <Alert severity="error" sx={{ mb: 2, textAlign: 'right' }}>
              {error}
            </Alert>
          )}

          <TextField
            label={'\u05E9\u05DD \u05DE\u05DC\u05D0'}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
            autoFocus
          />

          <TextField
            label={'\u05D0\u05D9\u05DE\u05D9\u05D9\u05DC'}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />

          <TextField
            label={'\u05E1\u05D9\u05E1\u05DE\u05D4'}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
            placeholder={'\u05DC\u05E4\u05D7\u05D5\u05EA 6 \u05EA\u05D5\u05D5\u05D9\u05DD'}
          />

          <TextField
            label={'\u05D0\u05D9\u05DE\u05D5\u05EA \u05E1\u05D9\u05E1\u05DE\u05D4'}
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
            {loading ? '\u05E0\u05E8\u05E9\u05DD...' : '\u05D4\u05E8\u05E9\u05DE\u05D4'}
          </Button>
        </form>

        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {'\u05DB\u05D1\u05E8 \u05D9\u05E9 \u05DC\u05DA \u05D7\u05E9\u05D1\u05D5\u05DF? '}
          <Link to="/login" style={{ color: '#0073ea', textDecoration: 'none', fontWeight: 500 }}>
            {'\u05D4\u05EA\u05D7\u05D1\u05E8 \u05DB\u05D0\u05DF'}
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
}
