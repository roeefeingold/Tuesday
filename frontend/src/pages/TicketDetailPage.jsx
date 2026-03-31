import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getStatusInfo,
  getPriorityInfo,
  timeAgo,
  getInitials,
  getTicketAge,
  getAgeEmoji,
  getAgeLabel,
} from '../utils/helpers';
import { PRIORITIES } from '../utils/constants';
import { get, patch, post, del } from '../api/client';
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  Avatar,
  TextField,
  MenuItem,
  Divider,
  CircularProgress,
  IconButton,
  Alert,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

export default function TicketDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPriority, setEditPriority] = useState('');
  const [saving, setSaving] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [activeUsers, setActiveUsers] = useState([]);
  const [deleteError, setDeleteError] = useState('');

  const fetchTicket = useCallback(async () => {
    try {
      const res = await get(`/tickets/${id}`);
      setTicket(res.data);
    } catch (err) {
      console.error('Failed to fetch ticket', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTicket();
    get('/users/active')
      .then((res) => setActiveUsers(res.data))
      .catch(() => {});
  }, [fetchTicket]);

  const handleStatusChange = async (newStatus) => {
    setStatusLoading(true);
    try {
      if (newStatus === 'in_process' && !ticket.assignee_id) {
        await patch(`/tickets/${id}/assign`, { assignee_id: user.id });
      }
      await patch(`/tickets/${id}/status`, { status: newStatus });
      await fetchTicket();
    } catch (err) {
      alert(err.response?.data?.detail || '\u05E0\u05DB\u05E9\u05DC \u05D1\u05E2\u05D3\u05DB\u05D5\u05DF \u05D4\u05E1\u05D8\u05D8\u05D5\u05E1');
    } finally {
      setStatusLoading(false);
    }
  };

  const handleAssign = async (assigneeId) => {
    try {
      await patch(`/tickets/${id}/assign`, { assignee_id: assigneeId || null });
      await fetchTicket();
    } catch (err) {
      alert(err.response?.data?.detail || '\u05E0\u05DB\u05E9\u05DC \u05D1\u05E9\u05D9\u05D5\u05DA');
    }
  };

  const handleStartEditing = () => {
    setEditTitle(ticket.title);
    setEditDescription(ticket.description || '');
    setEditPriority(ticket.priority);
    setEditing(true);
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      await patch(`/tickets/${id}`, {
        title: editTitle.trim(),
        description: editDescription.trim(),
        priority: editPriority,
      });
      setEditing(false);
      await fetchTicket();
    } catch (err) {
      alert(err.response?.data?.detail || '\u05E0\u05DB\u05E9\u05DC \u05D1\u05E2\u05D3\u05DB\u05D5\u05DF');
    } finally {
      setSaving(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmittingComment(true);
    try {
      await post(`/tickets/${id}/comments`, { body: commentText.trim() });
      setCommentText('');
      await fetchTicket();
    } catch (err) {
      alert(err.response?.data?.detail || '\u05E0\u05DB\u05E9\u05DC \u05D1\u05D4\u05D5\u05E1\u05E4\u05EA \u05EA\u05D2\u05D5\u05D1\u05D4');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('\u05D4\u05D0\u05DD \u05D0\u05EA\u05D4 \u05D1\u05D8\u05D5\u05D7 \u05E9\u05D1\u05E8\u05E6\u05D5\u05E0\u05DA \u05DC\u05DE\u05D7\u05D5\u05E7 \u05E7\u05E8\u05D9\u05D0\u05D4 \u05D6\u05D5?')) return;
    setDeleteError('');
    try {
      await del(`/tickets/${id}`);
      navigate('/board');
    } catch (err) {
      setDeleteError(err.response?.data?.detail || '\u05E0\u05DB\u05E9\u05DC \u05D1\u05DE\u05D7\u05D9\u05E7\u05EA \u05D4\u05E7\u05E8\u05D9\u05D0\u05D4');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!ticket) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {'\u05D4\u05E7\u05E8\u05D9\u05D0\u05D4 \u05DC\u05D0 \u05E0\u05DE\u05E6\u05D0\u05D4'}
        </Typography>
        <Button variant="outlined" onClick={() => navigate('/board')}>
          {'\u05D7\u05D6\u05E8\u05D4 \u05DC\u05DC\u05D5\u05D7'}
        </Button>
      </Box>
    );
  }

  const statusInfo = getStatusInfo(ticket.status);
  const priorityInfo = getPriorityInfo(ticket.priority);
  const canEdit = isAdmin || (ticket.assignee_id && ticket.assignee_id === user?.id);
  const canDelete = ticket.status === 'solved' && (isAdmin || ticket.reporter_id === user?.id);
  const comments = ticket.comments || [];
  const days = getTicketAge(ticket.created_at);
  const ageEmoji = getAgeEmoji(days);
  const ageLabel = getAgeLabel(days);

  return (
    <Box>
      <Button
        startIcon={<ArrowForwardIcon />}
        onClick={() => navigate('/board')}
        sx={{ mb: 2, color: 'text.secondary' }}
      >
        {'\u05D7\u05D6\u05E8\u05D4 \u05DC\u05DC\u05D5\u05D7'}
      </Button>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 300px' },
          gap: 3,
          alignItems: 'start',
        }}
      >
        {/* Main Content */}
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
              #{ticket.id}
            </Typography>
            <Chip
              label={statusInfo.label}
              size="small"
              sx={{ backgroundColor: statusInfo.color, color: '#fff', fontWeight: 600 }}
            />
            <Chip
              label={priorityInfo.label}
              size="small"
              sx={{ backgroundColor: priorityInfo.color, color: '#fff', fontWeight: 600 }}
            />
          </Box>

          {editing ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
              <TextField
                label={'\u05DB\u05D5\u05EA\u05E8\u05EA'}
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                fullWidth
              />
              <TextField
                label={'\u05EA\u05D9\u05D0\u05D5\u05E8'}
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                multiline
                rows={5}
                fullWidth
              />
              <TextField
                select
                label={'\u05E2\u05D3\u05D9\u05E4\u05D5\u05EA'}
                value={editPriority}
                onChange={(e) => setEditPriority(e.target.value)}
                fullWidth
              >
                {PRIORITIES.map((p) => (
                  <MenuItem key={p.value} value={p.value}>
                    {p.label}
                  </MenuItem>
                ))}
              </TextField>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button variant="outlined" onClick={() => setEditing(false)}>
                  {'\u05D1\u05D9\u05D8\u05D5\u05DC'}
                </Button>
                <Button variant="contained" onClick={handleSaveEdit} disabled={saving}>
                  {saving ? '\u05E9\u05D5\u05DE\u05E8...' : '\u05E9\u05DE\u05D9\u05E8\u05D4'}
                </Button>
              </Box>
            </Box>
          ) : (
            <>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                {ticket.title}
              </Typography>
              {ticket.description && (
                <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2, whiteSpace: 'pre-wrap' }}>
                  {ticket.description}
                </Typography>
              )}

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {`\u05E4\u05EA\u05D5\u05D7 \u05DB\u05D1\u05E8 ${ageLabel} ${ageEmoji}`}
                </Typography>
              </Box>

              {canEdit && (
                <IconButton size="small" onClick={handleStartEditing} sx={{ mb: 1 }}>
                  <EditIcon fontSize="small" />
                </IconButton>
              )}
            </>
          )}

          <Divider sx={{ my: 2 }} />

          {/* Status Actions */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
            {ticket.status === 'open' && (
              <Button
                variant="contained"
                color="warning"
                onClick={() => handleStatusChange('in_process')}
                disabled={statusLoading}
              >
                {'\u05D4\u05EA\u05D7\u05DC \u05D8\u05D9\u05E4\u05D5\u05DC'}
              </Button>
            )}
            {ticket.status === 'in_process' && (
              <>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => handleStatusChange('solved')}
                  disabled={statusLoading}
                >
                  {'\u05E1\u05DE\u05DF \u05DB\u05D8\u05D5\u05E4\u05DC'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => handleStatusChange('open')}
                  disabled={statusLoading}
                >
                  {'\u05D4\u05D7\u05D6\u05E8 \u05DC\u05E4\u05EA\u05D5\u05D7'}
                </Button>
              </>
            )}
            {ticket.status === 'solved' && isAdmin && (
              <Button
                variant="outlined"
                color="warning"
                onClick={() => handleStatusChange('open')}
                disabled={statusLoading}
              >
                {'\u05E4\u05EA\u05D7 \u05DE\u05D7\u05D3\u05E9'}
              </Button>
            )}
            {canDelete && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleDelete}
              >
                {'\u05DE\u05D7\u05E7 \u05E7\u05E8\u05D9\u05D0\u05D4'}
              </Button>
            )}
          </Box>

          {deleteError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {deleteError}
            </Alert>
          )}

          <Divider sx={{ my: 2 }} />

          {/* Comments */}
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            {`\u05EA\u05D2\u05D5\u05D1\u05D5\u05EA (${comments.length})`}
          </Typography>

          <Box component="form" onSubmit={handleAddComment} sx={{ mb: 3 }}>
            <TextField
              placeholder={'\u05DB\u05EA\u05D5\u05D1 \u05EA\u05D2\u05D5\u05D1\u05D4...'}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              multiline
              rows={3}
              fullWidth
              sx={{ mb: 1 }}
            />
            <Button
              type="submit"
              variant="contained"
              size="small"
              disabled={submittingComment || !commentText.trim()}
            >
              {submittingComment ? '\u05E9\u05D5\u05DC\u05D7...' : '\u05E9\u05DC\u05D7'}
            </Button>
          </Box>

          {comments.length === 0 ? (
            <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 2 }}>
              {'\u05D0\u05D9\u05DF \u05EA\u05D2\u05D5\u05D1\u05D5\u05EA \u05E2\u05D3\u05D9\u05D9\u05DF. \u05D4\u05D9\u05D5 \u05D4\u05E8\u05D0\u05E9\u05D5\u05E0\u05D9\u05DD \u05DC\u05D4\u05D2\u05D9\u05D1.'}
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {comments.map((comment) => (
                <Box key={comment.id} sx={{ display: 'flex', gap: 1.5 }}>
                  <Avatar sx={{ width: 32, height: 32, fontSize: '0.75rem', bgcolor: '#0073ea' }}>
                    {getInitials(comment.author_name || '?')}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {comment.author_name || '\u05DC\u05D0 \u05D9\u05D3\u05D5\u05E2'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {timeAgo(comment.created_at)}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      {comment.body}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </Paper>

        {/* Sidebar */}
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
            {'\u05E4\u05E8\u05D8\u05D9\u05DD'}
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                {'\u05DE\u05D3\u05D5\u05D5\u05D7'}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                <Avatar sx={{ width: 28, height: 28, fontSize: '0.7rem', bgcolor: '#0073ea' }}>
                  {getInitials(ticket.reporter_name || '?')}
                </Avatar>
                <Typography variant="body2">
                  {ticket.reporter_name || '\u05DC\u05D0 \u05D9\u05D3\u05D5\u05E2'}
                </Typography>
              </Box>
            </Box>

            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                {'\u05DE\u05E9\u05D5\u05D9\u05DA'}
              </Typography>
              {isAdmin ? (
                <TextField
                  select
                  size="small"
                  value={ticket.assignee_id || ''}
                  onChange={(e) => handleAssign(e.target.value ? Number(e.target.value) : null)}
                  fullWidth
                  sx={{ mt: 0.5 }}
                >
                  <MenuItem value="">
                    <em>{'\u05DC\u05DC\u05D0 \u05E9\u05D9\u05D5\u05DA'}</em>
                  </MenuItem>
                  {activeUsers.map((u) => (
                    <MenuItem key={u.id} value={u.id}>
                      {u.full_name}
                    </MenuItem>
                  ))}
                </TextField>
              ) : ticket.assignee_name ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                  <Avatar sx={{ width: 28, height: 28, fontSize: '0.7rem', bgcolor: '#0073ea' }}>
                    {getInitials(ticket.assignee_name)}
                  </Avatar>
                  <Typography variant="body2">
                    {ticket.assignee_name}
                  </Typography>
                </Box>
              ) : (
                <Typography variant="body2" sx={{ color: 'text.disabled', mt: 0.5 }}>
                  {'\u05DC\u05D0 \u05E9\u05D5\u05D9\u05DA'}
                </Typography>
              )}
            </Box>

            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                {'\u05E0\u05E4\u05EA\u05D7'}
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {timeAgo(ticket.created_at)}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                {'\u05E2\u05D5\u05D3\u05DB\u05DF'}
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {timeAgo(ticket.updated_at)}
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
