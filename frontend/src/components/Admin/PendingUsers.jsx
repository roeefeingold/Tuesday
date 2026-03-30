import { useState } from 'react';
import Button from '../common/Button';
import Avatar from '../common/Avatar';
import { patch } from '../../api/client';
import { timeAgo } from '../../utils/helpers';
import './PendingUsers.css';

export default function PendingUsers({ users, onUpdate }) {
  const [loadingId, setLoadingId] = useState(null);

  const handleApprove = async (userId) => {
    setLoadingId(userId);
    try {
      await patch(`/users/${userId}/approve`, {});
      onUpdate();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to approve user');
    } finally {
      setLoadingId(null);
    }
  };

  const handleReject = async (userId) => {
    setLoadingId(userId);
    try {
      await patch(`/users/${userId}/deactivate`, {});
      onUpdate();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to reject user');
    } finally {
      setLoadingId(null);
    }
  };

  if (users.length === 0) {
    return (
      <div className="pending-empty">
        <span className="pending-empty-icon">&#10004;</span>
        <p>No pending approvals. All caught up!</p>
      </div>
    );
  }

  return (
    <div className="pending-list">
      {users.map((user) => (
        <div key={user.id} className="pending-card">
          <div className="pending-card-info">
            <Avatar name={user.full_name} size="md" />
            <div>
              <div className="pending-card-name">{user.full_name}</div>
              <div className="pending-card-email">{user.email}</div>
              <div className="pending-card-date">Registered {timeAgo(user.created_at)}</div>
            </div>
          </div>
          <div className="pending-card-actions">
            <Button
              variant="success"
              size="sm"
              onClick={() => handleApprove(user.id)}
              disabled={loadingId === user.id}
            >
              Approve
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => handleReject(user.id)}
              disabled={loadingId === user.id}
            >
              Reject
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
