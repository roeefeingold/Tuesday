import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getStatusInfo,
  getPriorityInfo,
  timeAgo,
  getInitials,
  getTicketAge,
  getAgeLabel,
} from '../utils/helpers';
import { PRIORITIES } from '../utils/constants';
import { get, patch, post } from '../api/client';
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
  Alert,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import EditIcon from '@mui/icons-material/Edit';
import LockIcon from '@mui/icons-material/Lock';

function getAgeColor(days) {
  if (days < 5) return 'text.secondary';
  if (days < 10) return '#e67e00';
  return '#d32f2f';
}

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
  const [closeError, setCloseError] = useState('');

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
      alert(err.response?.data?.detail || 'נכשל בעדכון הסטטוס');
    } finally {
      setStatusLoading(false);
    }
  };

  const handleAssign = async (assigneeId) => {
    try {
      await patch(`/tickets/${id}/assign`, { assignee_id: assigneeId || null });
      await fetchTicket();
    } catch (err) {
      alert(err.response?.data?.detail || 'נכשל בשיוך');
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
      alert(err.response?.data?.detail || 'נכשל בעדכון');
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
      alert(err.response?.data?.detail || 'נכשל בהוספת תגובה');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleClose = async () => {
    if (!window.confirm('האם אתה בטוח שברצונך לסגור תקלה זו?')) return;
    setCloseError('');
    try {
      await post(`/tickets/${id}/close`, {});
      navigate('/board');
    } catch (err) {
      setCloseError(err.response?.data?.detail || 'נכשל בסגירת התקלה');
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
          התקלה לא נמצאה
        </Typography>
        <Button variant="outlined" onClick={() => navigate('/board')}>
          חזרה ללוח
        </Button>
      </Box>
    );
  }

  const statusInfo = getStatusInfo(ticket.status);
  const priorityInfo = getPriorityInfo(ticket.priority);
  const canEdit = isAdmin || (ticket.assignee_id && ticket.assignee_id === user?.id);
  const canClose = ticket.status === 'solved' && (isAdmin || ticket.reporter_id === user?.id);
  const comments = ticket.comments || [];
  const days = getTicketAge(ticket.created_at);
  const ageLabel = getAgeLabel(days);
  const ageColor = getAgeColor(days);
  const showAssignee = ticket.status !== 'open';

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
      <Button
        startIcon={<ArrowForwardIcon />}
        onClick={() => navigate('/board')}
        sx={{ mb: 2, color: 'text.secondary' }}
      >
        חזרה ללוח
      </Button>

      {closeError && (
        <Alert severity="error" sx={{ mb: 2 }}>{closeError}</Alert>
      )}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 280px' },
          gap: 3,
          alignItems: 'start',
        }}
      >
        {/* Main Content */}
        <Paper sx={{ p: 3.5, borderRadius: 2, textAlign: 'right' }}>
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
            <Typography
              variant="body2"
              sx={{ color: ageColor, fontWeight: days >= 5 ? 600 : 400 }}
            >
              פתוח {ageLabel}
            </Typography>
          </Box>

          {editing ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mb: 3 }}>
              <TextField
                label="כותרת"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                fullWidth
              />
              <TextField
                label="תיאור"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                multiline
                rows={5}
                fullWidth
              />
              <TextField
                select
                label="עדיפות"
                value={editPriority}
                onChange={(e) => setEditPriority(e.target.value)}
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
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button variant="contained" onClick={handleSaveEdit} disabled={saving}>
                  {saving ? 'שומר...' : 'שמירה'}
                </Button>
                <Button onClick={() => setEditing(false)} color="inherit">
                  ביטול
                </Button>
              </Box>
            </Box>
          ) : (
            <>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.5, lineHeight: 1.4 }}>
                {ticket.title}
              </Typography>
              {ticket.description && (
                <Typography
                  variant="body1"
                  sx={{ color: 'text.secondary', mb: 2, whiteSpace: 'pre-wrap', lineHeight: 1.7 }}
                >
                  {ticket.description}
                </Typography>
              )}
              {canEdit && (
                <Button size="small" startIcon={<EditIcon />} onClick={handleStartEditing} sx={{ mb: 1 }}>
                  עריכה
                </Button>
              )}
            </>
          )}

          <Divider sx={{ my: 2.5 }} />

          {/* Status Actions */}
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 1 }}>
            {ticket.status === 'open' && (
              <Button
                variant="contained"
                sx={{ backgroundColor: '#fdab3d', '&:hover': { backgroundColor: '#e99a2e' } }}
                onClick={() => handleStatusChange('in_process')}
                disabled={statusLoading}
              >
                התחל טיפול
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
                  סמן כטופל
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => handleStatusChange('open')}
                  disabled={statusLoading}
                >
                  החזר לפתוח
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
                פתח מחדש
              </Button>
            )}
            {canClose && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<LockIcon />}
                onClick={handleClose}
              >
                סגירת תקלה
              </Button>
            )}
          </Box>

          <Divider sx={{ my: 2.5 }} />

          {/* Comments */}
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            תגובות ({comments.length})
          </Typography>

          <form onSubmit={handleAddComment}>
            <TextField
              multiline
              rows={3}
              fullWidth
              placeholder="כתוב תגובה..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              sx={{ mb: 1.5 }}
            />
            <Button
              type="submit"
              variant="contained"
              size="small"
              disabled={submittingComment || !commentText.trim()}
              sx={{ mb: 3 }}
            >
              {submittingComment ? 'שולח...' : 'שלח'}
            </Button>
          </form>

          {comments.length === 0 ? (
            <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 2 }}>
              אין תגובות עדיין
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {comments.map((comment) => (
                <Box key={comment.id} sx={{ display: 'flex', gap: 1.5 }}>
                  <Avatar
                    sx={{ width: 32, height: 32, fontSize: '0.75rem', bgcolor: '#0073ea', flexShrink: 0 }}
                  >
                    {getInitials(comment.author_name || 'Unknown')}
                  </Avatar>
                  <Box sx={{ flex: 1, backgroundColor: '#f6f7fb', borderRadius: 2, p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {comment.author_name || 'Unknown'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {timeAgo(comment.created_at)}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                      {comment.body}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </Paper>

        {/* Sidebar */}
        <Paper sx={{ p: 2.5, borderRadius: 2, textAlign: 'right', position: { md: 'sticky' }, top: { md: 80 } }}>
          <Typography
            variant="subtitle2"
            sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5, mb: 2 }}
          >
            פרטים
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
                מדווח
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar sx={{ width: 28, height: 28, fontSize: '0.7rem', bgcolor: '#0073ea' }}>
                  {getInitials(ticket.reporter_name)}
                </Avatar>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {ticket.reporter_name}
                </Typography>
              </Box>
            </Box>

            {showAssignee && (
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
                  משויך
                </Typography>
                {isAdmin ? (
                  <TextField
                    select
                    size="small"
                    value={ticket.assignee_id || ''}
                    onChange={(e) => handleAssign(e.target.value)}
                    fullWidth
                  >
                    <MenuItem value="">
                      <em>ללא שיוך</em>
                    </MenuItem>
                    {activeUsers.map((u) => (
                      <MenuItem key={u.id} value={u.id}>
                        {u.full_name}
                      </MenuItem>
                    ))}
                  </TextField>
                ) : ticket.assignee_name ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 28, height: 28, fontSize: '0.7rem', bgcolor: '#0073ea' }}>
                      {getInitials(ticket.assignee_name)}
                    </Avatar>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {ticket.assignee_name}
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                    לא שויך
                  </Typography>
                )}
              </Box>
            )}

            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
                נפתח
              </Typography>
              <Typography variant="body2">{timeAgo(ticket.created_at)}</Typography>
            </Box>

            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
                עודכן
              </Typography>
              <Typography variant="body2">{timeAgo(ticket.updated_at)}</Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
