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
      setError('נא למלא את כל השדות');
      return;
    }
    if (password.length < 6) {
      setError('הסיסמה חייבת להכיל לפחות 6 תווים');
      return;
    }
    if (password !== confirmPassword) {
      setError('הסיסמאות לא תואמות');
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
        setError('ההרשמה נכשלה. נסה שוב.');
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
            ההרשמה התקבלה!
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
            מנהל המערכת יאשר את חשבונך.
          </Typography>
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <Button variant="contained" size="large">
              חזרה להתחברות
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
          הרשמה למערכת
        </Typography>

        <form onSubmit={handleSubmit}>
          {error && (
            <Alert severity="error" sx={{ mb: 2, textAlign: 'right' }}>
              {error}
            </Alert>
          )}

          <TextField
            label="שם מלא"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            fullWidth
            sx={{ mb: 2.5 }}
            autoFocus
          />

          <TextField
            label="אימייל"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            sx={{ mb: 2.5 }}
          />

          <TextField
            label="סיסמה"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            sx={{ mb: 2.5 }}
            placeholder="לפחות 6 תווים"
          />

          <TextField
            label="אימות סיסמה"
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
            {loading ? 'נרשם...' : 'הרשמה'}
          </Button>
        </form>

        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {'כבר יש לך חשבון? '}
          <Link to="/login" style={{ color: '#0073ea', textDecoration: 'none', fontWeight: 500 }}>
            התחבר כאן
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
}
