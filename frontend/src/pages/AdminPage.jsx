import { useState, useEffect, useCallback } from 'react';
import PendingUsers from '../components/Admin/PendingUsers';
import UserTable from '../components/Admin/UserTable';
import Spinner from '../components/common/Spinner';
import { get } from '../api/client';
import './AdminPage.css';

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [usersRes, pendingRes] = await Promise.all([
        get('/users'),
        get('/users/pending'),
      ]);
      setUsers(usersRes.data);
      setPendingUsers(pendingRes.data);

      const total = usersRes.data.length;
      const pending = pendingRes.data.length;
      const active = usersRes.data.filter((u) => u.is_active).length;
      setStats({ total, pending, active });
    } catch (err) {
      console.error('Failed to fetch admin data', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) return <Spinner size={40} />;

  return (
    <div className="admin-page">
      <h1 className="admin-title">Admin Panel</h1>

      {stats && (
        <div className="admin-stats">
          <div className="admin-stat-card">
            <span className="admin-stat-value">{stats.total}</span>
            <span className="admin-stat-label">Total Users</span>
          </div>
          <div className="admin-stat-card admin-stat-card--warning">
            <span className="admin-stat-value">{stats.pending}</span>
            <span className="admin-stat-label">Pending Approvals</span>
          </div>
          <div className="admin-stat-card admin-stat-card--success">
            <span className="admin-stat-value">{stats.active}</span>
            <span className="admin-stat-label">Active Users</span>
          </div>
        </div>
      )}

      <section className="admin-section">
        <h2 className="admin-section-title">Pending Approvals</h2>
        <PendingUsers users={pendingUsers} onUpdate={fetchData} />
      </section>

      <section className="admin-section">
        <h2 className="admin-section-title">All Users</h2>
        <UserTable users={users} onUpdate={fetchData} />
      </section>
    </div>
  );
}
