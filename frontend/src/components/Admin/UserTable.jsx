import { useState } from 'react';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';
import { ROLES } from '../../utils/constants';
import { patch } from '../../api/client';
import './UserTable.css';

export default function UserTable({ users, onUpdate }) {
  const [updatingId, setUpdatingId] = useState(null);

  const handleRoleChange = async (userId, newRole) => {
    setUpdatingId(userId);
    try {
      await patch(`/users/${userId}/role`, { role: newRole });
      onUpdate();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update role');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleActive = async (userId, isActive) => {
    setUpdatingId(userId);
    try {
      if (isActive) {
        await patch(`/users/${userId}/deactivate`, {});
      } else {
        await patch(`/users/${userId}/approve`, {});
      }
      onUpdate();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update user');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="user-table-wrapper">
      <table className="user-table">
        <thead>
          <tr>
            <th>User</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Active</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>
                <div className="user-table-user">
                  <Avatar name={user.full_name} size="sm" />
                  <span>{user.full_name}</span>
                </div>
              </td>
              <td className="user-table-email">{user.email}</td>
              <td>
                <select
                  className="user-table-role-select"
                  value={user.role}
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  disabled={updatingId === user.id}
                >
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </td>
              <td>
                <Badge
                  label={user.is_approved ? 'Approved' : 'Pending'}
                  color={user.is_approved ? 'var(--color-solved)' : 'var(--color-in-process)'}
                  size="sm"
                />
              </td>
              <td>
                <label className="user-table-toggle">
                  <input
                    type="checkbox"
                    checked={user.is_active}
                    onChange={() => handleToggleActive(user.id, user.is_active)}
                    disabled={updatingId === user.id}
                  />
                  <span className="user-table-toggle-slider" />
                </label>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
