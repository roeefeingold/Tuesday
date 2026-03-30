import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Badge from '../components/common/Badge';
import Avatar from '../components/common/Avatar';
import Button from '../components/common/Button';
import Select from '../components/common/Select';
import Spinner from '../components/common/Spinner';
import { getStatusInfo, getPriorityInfo, timeAgo } from '../utils/helpers';
import { PRIORITIES } from '../utils/constants';
import { get, patch, post } from '../api/client';
import './TicketDetailPage.css';

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
  const [developers, setDevelopers] = useState([]);

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
    get('/users/developers')
      .then((res) => setDevelopers(res.data))
      .catch(() => {});
  }, [fetchTicket]);

  const handleStatusChange = async (newStatus) => {
    setStatusLoading(true);
    try {
      // If moving to in_process and no assignee, auto-assign current user
      if (newStatus === 'in_process' && !ticket.assignee_id) {
        await patch(`/tickets/${id}/assign`, { assignee_id: user.id });
      }
      await patch(`/tickets/${id}/status`, { status: newStatus });
      await fetchTicket();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update status');
    } finally {
      setStatusLoading(false);
    }
  };

  const handleAssign = async (assigneeId) => {
    try {
      await patch(`/tickets/${id}/assign`, { assignee_id: assigneeId || null });
      await fetchTicket();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to assign');
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
      alert(err.response?.data?.detail || 'Failed to update ticket');
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
      alert(err.response?.data?.detail || 'Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) return <div className="ticket-detail-loading"><Spinner size={40} /></div>;
  if (!ticket) {
    return (
      <div className="ticket-detail-empty">
        <h2>Ticket not found</h2>
        <Button variant="ghost" onClick={() => navigate('/board')}>Back to Board</Button>
      </div>
    );
  }

  const statusInfo = getStatusInfo(ticket.status);
  const priorityInfo = getPriorityInfo(ticket.priority);
  const categoryColor = ticket.category === 'bug' ? 'var(--color-critical)' : 'var(--color-primary)';
  const canEdit = isAdmin || (ticket.assignee_id && ticket.assignee_id === user?.id);
  const comments = ticket.comments || [];

  const devOptions = developers.map((d) => ({
    value: d.id,
    label: d.full_name,
  }));

  return (
    <div className="ticket-detail">
      <button className="ticket-detail-back" onClick={() => navigate('/board')}>
        &#8592; Back to Board
      </button>

      <div className="ticket-detail-layout">
        <div className="ticket-detail-main">
          <div className="ticket-detail-header">
            <span className="ticket-detail-id">#{ticket.id}</span>
            <div className="ticket-detail-badges">
              <Badge label={statusInfo.label} color={statusInfo.color} />
              <Badge label={priorityInfo.label} color={priorityInfo.color} />
              <Badge label={ticket.category === 'bug' ? 'Bug' : 'Task'} color={categoryColor} />
            </div>
          </div>

          {editing ? (
            <div className="ticket-detail-edit-form">
              <div className="form-group">
                <label className="form-label">Title</label>
                <input
                  type="text"
                  className="form-input"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  rows={5}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                />
              </div>
              <Select
                label="Priority"
                value={editPriority}
                onChange={setEditPriority}
                options={PRIORITIES}
              />
              <div className="ticket-detail-edit-actions">
                <Button variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
                <Button variant="primary" onClick={handleSaveEdit} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          ) : (
            <>
              <h1 className="ticket-detail-title">{ticket.title}</h1>
              {ticket.description && (
                <p className="ticket-detail-description">{ticket.description}</p>
              )}
              {canEdit && (
                <Button variant="ghost" size="sm" onClick={handleStartEditing}>
                  Edit
                </Button>
              )}
            </>
          )}

          <div className="ticket-detail-status-actions">
            {ticket.status === 'open' && (
              <Button
                variant="warning"
                onClick={() => handleStatusChange('in_process')}
                disabled={statusLoading}
              >
                Start Working
              </Button>
            )}
            {ticket.status === 'in_process' && (
              <Button
                variant="success"
                onClick={() => handleStatusChange('solved')}
                disabled={statusLoading}
              >
                Mark as Solved
              </Button>
            )}
            {ticket.status === 'in_process' && (
              <Button
                variant="ghost"
                onClick={() => handleStatusChange('open')}
                disabled={statusLoading}
              >
                Reopen
              </Button>
            )}
            {ticket.status === 'solved' && isAdmin && (
              <Button
                variant="warning"
                onClick={() => handleStatusChange('open')}
                disabled={statusLoading}
              >
                Reopen
              </Button>
            )}
          </div>

          {/* Comments Section */}
          <div className="ticket-detail-comments">
            <h3 className="ticket-detail-comments-title">
              Comments ({comments.length})
            </h3>

            <form className="ticket-detail-comment-form" onSubmit={handleAddComment}>
              <textarea
                className="form-textarea"
                placeholder="Write a comment..."
                rows={3}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={submittingComment || !commentText.trim()}
              >
                {submittingComment ? 'Posting...' : 'Post Comment'}
              </Button>
            </form>

            <div className="ticket-detail-comment-list">
              {comments.length === 0 ? (
                <p className="ticket-detail-no-comments">No comments yet. Be the first to comment.</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="ticket-comment">
                    <Avatar name={comment.author_name || 'Unknown'} size="sm" />
                    <div className="ticket-comment-body">
                      <div className="ticket-comment-header">
                        <span className="ticket-comment-author">
                          {comment.author_name || 'Unknown'}
                        </span>
                        <span className="ticket-comment-time">
                          {timeAgo(comment.created_at)}
                        </span>
                      </div>
                      <p className="ticket-comment-text">{comment.body}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="ticket-detail-sidebar">
          <div className="ticket-detail-info-card">
            <h3>Details</h3>

            <div className="ticket-detail-info-row">
              <span className="ticket-detail-info-label">Reporter</span>
              <div className="ticket-detail-info-value">
                <div className="ticket-detail-person">
                  <Avatar name={ticket.reporter_name || 'Unknown'} size="sm" />
                  <span>{ticket.reporter_name || 'Unknown'}</span>
                </div>
              </div>
            </div>

            <div className="ticket-detail-info-row">
              <span className="ticket-detail-info-label">Assignee</span>
              <div className="ticket-detail-info-value">
                {isAdmin ? (
                  <Select
                    value={ticket.assignee_id || ''}
                    onChange={handleAssign}
                    options={devOptions}
                    placeholder="Unassigned"
                  />
                ) : ticket.assignee_name ? (
                  <div className="ticket-detail-person">
                    <Avatar name={ticket.assignee_name} size="sm" />
                    <span>{ticket.assignee_name}</span>
                  </div>
                ) : (
                  <span className="ticket-detail-info-empty">Unassigned</span>
                )}
              </div>
            </div>

            <div className="ticket-detail-info-row">
              <span className="ticket-detail-info-label">Created</span>
              <span className="ticket-detail-info-value">{timeAgo(ticket.created_at)}</span>
            </div>

            <div className="ticket-detail-info-row">
              <span className="ticket-detail-info-label">Updated</span>
              <span className="ticket-detail-info-value">{timeAgo(ticket.updated_at)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
