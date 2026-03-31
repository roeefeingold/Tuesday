import { useState, useEffect } from 'react';
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
import { get, post } from '../../api/client';

export default function NewTicketModal({ isOpen, onClose, onCreated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [assigneeId, setAssigneeId] = useState('');
  const [activeUsers, setActiveUsers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      get('/users/active')
        .then((res) => setActiveUsers(res.data))
        .catch(() => {});
      setTitle('');
      setDescription('');
      setPriority('medium');
      setAssigneeId('');
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('\u05DB\u05D5\u05EA\u05E8\u05EA \u05D4\u05D9\u05D0 \u05E9\u05D3\u05D4 \u05D7\u05D5\u05D1\u05D4');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        priority,
      };
      if (assigneeId) {
        payload.assignee_id = assigneeId;
      }
      await post('/tickets', payload);
      onCreated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || '\u05E0\u05DB\u05E9\u05DC \u05D1\u05D9\u05E6\u05D9\u05E8\u05EA \u05D4\u05E7\u05E8\u05D9\u05D0\u05D4');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>
        {'\u05E7\u05E8\u05D9\u05D0\u05D4 \u05D7\u05D3\u05E9\u05D4'}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label={'\u05DB\u05D5\u05EA\u05E8\u05EA'}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              fullWidth
              autoFocus
              placeholder={'\u05DE\u05D4 \u05E6\u05E8\u05D9\u05DA \u05DC\u05D8\u05E4\u05DC?'}
            />

            <TextField
              label={'\u05EA\u05D9\u05D0\u05D5\u05E8'}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              multiline
              rows={4}
              fullWidth
              placeholder={'\u05E4\u05E8\u05D8\u05D9\u05DD \u05E0\u05D5\u05E1\u05E4\u05D9\u05DD...'}
            />

            <TextField
              select
              label={'\u05E2\u05D3\u05D9\u05E4\u05D5\u05EA'}
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

            <TextField
              select
              label={'\u05E9\u05D9\u05D5\u05DA \u05DC\u05DE\u05E9\u05EA\u05DE\u05E9'}
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              fullWidth
            >
              <MenuItem value="">
                <em>{'\u05DC\u05DC\u05D0 \u05E9\u05D9\u05D5\u05DA'}</em>
              </MenuItem>
              {activeUsers.map((u) => (
                <MenuItem key={u.id} value={String(u.id)}>
                  {u.full_name}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} color="inherit">
            {'\u05D1\u05D9\u05D8\u05D5\u05DC'}
          </Button>
          <Button type="submit" variant="contained" disabled={submitting}>
            {submitting ? '\u05D9\u05D5\u05E6\u05E8...' : '\u05D9\u05E6\u05D9\u05E8\u05D4'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
