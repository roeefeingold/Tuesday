import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Alert,
  Box,
} from '@mui/material';
import { PRIORITIES } from '../../utils/constants';
import { post } from '../../api/client';

export default function NewTicketModal({ isOpen, onClose, onCreated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleOpen = () => {
    setTitle('');
    setDescription('');
    setPriority('medium');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('כותרת היא שדה חובה');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await post('/tickets', {
        title: title.trim(),
        description: description.trim(),
        priority,
      });
      onCreated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || 'נכשל ביצירת התקלה');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
     
      TransitionProps={{ onEnter: handleOpen }}
    >
      <DialogTitle sx={{ fontWeight: 600, textAlign: 'right' }}>
        תקלה חדשה
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              label="כותרת"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              fullWidth
              autoFocus
              placeholder="מה צריך לטפל?"
            />

            <TextField
              label="תיאור"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              multiline
              rows={4}
              fullWidth
              placeholder="פרטים נוספים..."
            />

            <TextField
              select
              label="עדיפות"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              fullWidth
            >
              {PRIORITIES.map((p) => (
                <MenuItem key={p.value} value={p.value}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: p.color }} />
                    {p.label}
                  </Box>
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={onClose} color="inherit">
            ביטול
          </Button>
          <Button type="submit" variant="contained" disabled={submitting}>
            {submitting ? 'יוצר...' : 'יצירה'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
