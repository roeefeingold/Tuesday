import { useState, useEffect, useCallback } from 'react';
import { get, post, put, patch } from '../api/client';
import { ROLES } from '../utils/constants';
import { timeAgo, getInitials } from '../utils/helpers';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Button,
  Chip,
  Switch,
  Select,
  MenuItem,
  TextField,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import NotificationsIcon from '@mui/icons-material/Notifications';

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tabIndex, setTabIndex] = useState(0);
  const [updatingId, setUpdatingId] = useState(null);

  const [emailConfig, setEmailConfig] = useState({
    smtp_host: '',
    smtp_port: 587,
    smtp_user: '',
    smtp_password: '',
    sender_email: '',
    is_enabled: false,
  });
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailMsg, setEmailMsg] = useState({ type: '', text: '' });

  const fetchData = useCallback(async () => {
    try {
      const [usersRes, pendingRes] = await Promise.all([
        get('/users'),
        get('/users/pending'),
      ]);
      setUsers(usersRes.data);
      setPendingUsers(pendingRes.data);
      setStats({
        total: usersRes.data.length,
        pending: pendingRes.data.length,
        active: usersRes.data.filter((u) => u.is_active).length,
      });
    } catch (err) {
      console.error('Failed to fetch admin data', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchEmailConfig = useCallback(async () => {
    try {
      const res = await get('/email-config');
      if (res.data) {
        setEmailConfig({
          smtp_host: res.data.smtp_host || '',
          smtp_port: res.data.smtp_port || 587,
          smtp_user: res.data.smtp_user || '',
          smtp_password: '',
          sender_email: res.data.sender_email || '',
          is_enabled: res.data.is_enabled || false,
        });
      }
    } catch {
      // Config might not exist yet
    }
  }, []);

  useEffect(() => {
    fetchData();
    fetchEmailConfig();
  }, [fetchData, fetchEmailConfig]);

  const handleApprove = async (userId) => {
    setUpdatingId(userId);
    try {
      await patch(`/users/${userId}/approve`, {});
      fetchData();
    } catch (err) {
      alert(err.response?.data?.detail || 'נכשל באישור');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleReject = async (userId) => {
    setUpdatingId(userId);
    try {
      await patch(`/users/${userId}/deactivate`, {});
      fetchData();
    } catch (err) {
      alert(err.response?.data?.detail || 'נכשל בדחייה');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    setUpdatingId(userId);
    try {
      await patch(`/users/${userId}/role`, { role: newRole });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.detail || 'נכשל בעדכון תפקיד');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleActive = async (userId, isActive) => {
    setUpdatingId(userId);
    try {
      await patch(`/users/${userId}/deactivate`, {});
      fetchData();
    } catch (err) {
      alert(err.response?.data?.detail || 'נכשל בעדכון');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSaveEmail = async () => {
    setEmailLoading(true);
    setEmailMsg({ type: '', text: '' });
    try {
      await put('/email-config', emailConfig);
      setEmailMsg({ type: 'success', text: 'הגדרות הדוא״ל נשמרו בהצלחה' });
    } catch (err) {
      setEmailMsg({ type: 'error', text: err.response?.data?.detail || 'נכשל בשמירה' });
    } finally {
      setEmailLoading(false);
    }
  };

  const handleTestEmail = async () => {
    setEmailLoading(true);
    setEmailMsg({ type: '', text: '' });
    try {
      await post('/email-config/test', {});
      setEmailMsg({ type: 'success', text: 'אימייל בדיקה נשלח בהצלחה' });
    } catch (err) {
      setEmailMsg({ type: 'error', text: err.response?.data?.detail || 'נכשל בשליחת אימייל בדיקה' });
    } finally {
      setEmailLoading(false);
    }
  };

  const handleSendAlerts = async () => {
    setEmailLoading(true);
    setEmailMsg({ type: '', text: '' });
    try {
      const res = await post('/email-config/send-alerts', {});
      setEmailMsg({ type: 'success', text: `התראות נשלחו בהצלחה (${res.data?.emails_sent || 0} אימיילים)` });
    } catch (err) {
      setEmailMsg({ type: 'error', text: err.response?.data?.detail || 'נכשל בשליחת התראות' });
    } finally {
      setEmailLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        ניהול מערכת
      </Typography>

      {stats && (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 2, mb: 3 }}>
          <Card elevation={0} sx={{ border: '1px solid #e6e9ef', borderTop: '3px solid #0073ea' }}>
            <CardContent sx={{ textAlign: 'center', py: 2.5 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#0073ea' }}>
                {stats.total}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                סה״כ משתמשים
              </Typography>
            </CardContent>
          </Card>
          <Card elevation={0} sx={{ border: '1px solid #e6e9ef', borderTop: '3px solid #fdab3d' }}>
            <CardContent sx={{ textAlign: 'center', py: 2.5 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#fdab3d' }}>
                {stats.pending}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                ממתינים לאישור
              </Typography>
            </CardContent>
          </Card>
          <Card elevation={0} sx={{ border: '1px solid #e6e9ef', borderTop: '3px solid #00c875' }}>
            <CardContent sx={{ textAlign: 'center', py: 2.5 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#00c875' }}>
                {stats.active}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                משתמשים פעילים
              </Typography>
            </CardContent>
          </Card>
        </Box>
      )}

      <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Tabs
          value={tabIndex}
          onChange={(_, v) => setTabIndex(v)}
          sx={{ borderBottom: '1px solid #e6e9ef', px: 2 }}
        >
          <Tab label={`ממתינים לאישור (${pendingUsers.length})`} />
          <Tab label="כל המשתמשים" />
          <Tab label="הגדרות דוא״ל" />
        </Tabs>

        {/* Pending Approvals */}
        {tabIndex === 0 && (
          <Box sx={{ p: 3 }}>
            {pendingUsers.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 5, color: 'text.secondary' }}>
                <CheckIcon sx={{ fontSize: 40, color: '#00c875', mb: 1 }} />
                <Typography>אין משתמשים הממתינים לאישור</Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {pendingUsers.map((u) => (
                  <Card key={u.id} elevation={0} sx={{ border: '1px solid #e6e9ef' }}>
                    <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: '#0073ea' }}>{getInitials(u.full_name)}</Avatar>
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>{u.full_name}</Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>{u.email}</Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            נרשם {timeAgo(u.created_at)}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          startIcon={<CheckIcon />}
                          onClick={() => handleApprove(u.id)}
                          disabled={updatingId === u.id}
                        >
                          אשר
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          startIcon={<CloseIcon />}
                          onClick={() => handleReject(u.id)}
                          disabled={updatingId === u.id}
                        >
                          דחה
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </Box>
        )}

        {/* All Users */}
        {tabIndex === 1 && (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f9fafb' }}>
                  <TableCell sx={{ fontWeight: 600 }}>משתמש</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>אימייל</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>תפקיד</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>סטטוס</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>פעיל</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ width: 30, height: 30, fontSize: '0.75rem', bgcolor: '#0073ea' }}>
                          {getInitials(u.full_name)}
                        </Avatar>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>{u.full_name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>{u.email}</Typography>
                    </TableCell>
                    <TableCell>
                      <Select
                        size="small"
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        disabled={updatingId === u.id}
                        sx={{ minWidth: 100 }}
                      >
                        {ROLES.map((r) => (
                          <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>
                        ))}
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={u.is_approved ? 'מאושר' : 'ממתין'}
                        size="small"
                        sx={{
                          backgroundColor: u.is_approved ? '#00c875' : '#fdab3d',
                          color: '#fff',
                          fontWeight: 500,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={u.is_active}
                        onChange={() => handleToggleActive(u.id, u.is_active)}
                        disabled={updatingId === u.id}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Email Config */}
        {tabIndex === 2 && (
          <Box sx={{ p: 3, maxWidth: 500 }}>
            {emailMsg.text && (
              <Alert severity={emailMsg.type} sx={{ mb: 2 }}>
                {emailMsg.text}
              </Alert>
            )}

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <TextField
                label="SMTP Host"
                value={emailConfig.smtp_host}
                onChange={(e) => setEmailConfig({ ...emailConfig, smtp_host: e.target.value })}
                fullWidth
              />
              <TextField
                label="SMTP Port"
                type="number"
                value={emailConfig.smtp_port}
                onChange={(e) => setEmailConfig({ ...emailConfig, smtp_port: Number(e.target.value) })}
                fullWidth
              />
              <TextField
                label="SMTP User"
                value={emailConfig.smtp_user}
                onChange={(e) => setEmailConfig({ ...emailConfig, smtp_user: e.target.value })}
                fullWidth
              />
              <TextField
                label="SMTP Password"
                type="password"
                value={emailConfig.smtp_password}
                onChange={(e) => setEmailConfig({ ...emailConfig, smtp_password: e.target.value })}
                fullWidth
              />
              <TextField
                label="אימייל שולח"
                value={emailConfig.sender_email}
                onChange={(e) => setEmailConfig({ ...emailConfig, sender_email: e.target.value })}
                fullWidth
              />

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Switch
                  checked={emailConfig.is_enabled}
                  onChange={(e) => setEmailConfig({ ...emailConfig, is_enabled: e.target.checked })}
                />
                <Typography variant="body2">
                  {emailConfig.is_enabled ? 'מופעל' : 'מושבת'}
                </Typography>
              </Box>

              <Divider />

              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  onClick={handleSaveEmail}
                  disabled={emailLoading}
                >
                  שמור
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<SendIcon />}
                  onClick={handleTestEmail}
                  disabled={emailLoading}
                >
                  שלח בדיקה
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  startIcon={<NotificationsIcon />}
                  onClick={handleSendAlerts}
                  disabled={emailLoading}
                >
                  שלח התראות
                </Button>
              </Box>
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
