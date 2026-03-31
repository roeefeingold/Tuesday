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

  // Email config state
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

  const fetchEmailConfig = useCallback(async () => {
    try {
      const res = await get('/email-config');
      if (res.data) {
        setEmailConfig({
          smtp_host: res.data.smtp_host || '',
          smtp_port: res.data.smtp_port || 587,
          smtp_user: res.data.smtp_user || '',
          smtp_password: res.data.smtp_password || '',
          sender_email: res.data.sender_email || '',
          is_enabled: res.data.is_enabled || false,
        });
      }
    } catch {
      // Email config might not exist yet
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
      alert(err.response?.data?.detail || '\u05E0\u05DB\u05E9\u05DC \u05D1\u05D0\u05D9\u05E9\u05D5\u05E8');
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
      alert(err.response?.data?.detail || '\u05E0\u05DB\u05E9\u05DC \u05D1\u05D3\u05D7\u05D9\u05D9\u05D4');
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
      alert(err.response?.data?.detail || '\u05E0\u05DB\u05E9\u05DC \u05D1\u05E2\u05D3\u05DB\u05D5\u05DF \u05EA\u05E4\u05E7\u05D9\u05D3');
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
      fetchData();
    } catch (err) {
      alert(err.response?.data?.detail || '\u05E0\u05DB\u05E9\u05DC \u05D1\u05E2\u05D3\u05DB\u05D5\u05DF');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSaveEmail = async () => {
    setEmailLoading(true);
    setEmailMsg({ type: '', text: '' });
    try {
      await put('/email-config', emailConfig);
      setEmailMsg({ type: 'success', text: '\u05D4\u05D2\u05D3\u05E8\u05D5\u05EA \u05D4\u05D3\u05D5\u05D0\u05F4\u05DC \u05E0\u05E9\u05DE\u05E8\u05D5 \u05D1\u05D4\u05E6\u05DC\u05D7\u05D4' });
    } catch (err) {
      setEmailMsg({ type: 'error', text: err.response?.data?.detail || '\u05E0\u05DB\u05E9\u05DC \u05D1\u05E9\u05DE\u05D9\u05E8\u05D4' });
    } finally {
      setEmailLoading(false);
    }
  };

  const handleTestEmail = async () => {
    setEmailLoading(true);
    setEmailMsg({ type: '', text: '' });
    try {
      await post('/email-config/test', {});
      setEmailMsg({ type: 'success', text: '\u05D0\u05D9\u05DE\u05D9\u05D9\u05DC \u05D1\u05D3\u05D9\u05E7\u05D4 \u05E0\u05E9\u05DC\u05D7 \u05D1\u05D4\u05E6\u05DC\u05D7\u05D4' });
    } catch (err) {
      setEmailMsg({ type: 'error', text: err.response?.data?.detail || '\u05E0\u05DB\u05E9\u05DC \u05D1\u05E9\u05DC\u05D9\u05D7\u05EA \u05D0\u05D9\u05DE\u05D9\u05D9\u05DC \u05D1\u05D3\u05D9\u05E7\u05D4' });
    } finally {
      setEmailLoading(false);
    }
  };

  const handleSendAlerts = async () => {
    setEmailLoading(true);
    setEmailMsg({ type: '', text: '' });
    try {
      await post('/email-config/send-alerts', {});
      setEmailMsg({ type: 'success', text: '\u05D4\u05EA\u05E8\u05D0\u05D5\u05EA \u05E0\u05E9\u05DC\u05D7\u05D5 \u05D1\u05D4\u05E6\u05DC\u05D7\u05D4' });
    } catch (err) {
      setEmailMsg({ type: 'error', text: err.response?.data?.detail || '\u05E0\u05DB\u05E9\u05DC \u05D1\u05E9\u05DC\u05D9\u05D7\u05EA \u05D4\u05EA\u05E8\u05D0\u05D5\u05EA' });
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
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        {'\u05E0\u05D9\u05D4\u05D5\u05DC \u05DE\u05E2\u05E8\u05DB\u05EA'}
      </Typography>

      {/* Stats Cards */}
      {stats && (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, mb: 3 }}>
          <Card elevation={0} sx={{ border: '1px solid #e6e9ef' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                {stats.total}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {'\u05E1\u05D4\u05F4\u05DB \u05DE\u05E9\u05EA\u05DE\u05E9\u05D9\u05DD'}
              </Typography>
            </CardContent>
          </Card>
          <Card elevation={0} sx={{ border: '1px solid #e6e9ef' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#fdab3d' }}>
                {stats.pending}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {'\u05DE\u05DE\u05EA\u05D9\u05E0\u05D9\u05DD \u05DC\u05D0\u05D9\u05E9\u05D5\u05E8'}
              </Typography>
            </CardContent>
          </Card>
          <Card elevation={0} sx={{ border: '1px solid #e6e9ef' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#00c875' }}>
                {stats.active}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {'\u05DE\u05E9\u05EA\u05DE\u05E9\u05D9\u05DD \u05E4\u05E2\u05D9\u05DC\u05D9\u05DD'}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Tabs */}
      <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Tabs
          value={tabIndex}
          onChange={(_, v) => setTabIndex(v)}
          sx={{ borderBottom: '1px solid #e6e9ef', px: 2 }}
        >
          <Tab label={`\u05DE\u05DE\u05EA\u05D9\u05E0\u05D9\u05DD \u05DC\u05D0\u05D9\u05E9\u05D5\u05E8 (${pendingUsers.length})`} />
          <Tab label={'\u05DB\u05DC \u05D4\u05DE\u05E9\u05EA\u05DE\u05E9\u05D9\u05DD'} />
          <Tab label={'\u05D4\u05D2\u05D3\u05E8\u05D5\u05EA \u05D3\u05D5\u05D0\u05F4\u05DC'} />
        </Tabs>

        {/* Pending Approvals Tab */}
        {tabIndex === 0 && (
          <Box sx={{ p: 3 }}>
            {pendingUsers.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                <CheckIcon sx={{ fontSize: 40, color: '#00c875', mb: 1 }} />
                <Typography>{'\u05D0\u05D9\u05DF \u05DE\u05E9\u05EA\u05DE\u05E9\u05D9\u05DD \u05D4\u05DE\u05DE\u05EA\u05D9\u05E0\u05D9\u05DD \u05DC\u05D0\u05D9\u05E9\u05D5\u05E8'}</Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {pendingUsers.map((u) => (
                  <Card key={u.id} elevation={0} sx={{ border: '1px solid #e6e9ef' }}>
                    <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: '#0073ea' }}>{getInitials(u.full_name)}</Avatar>
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>{u.full_name}</Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>{u.email}</Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {'\u05E0\u05E8\u05E9\u05DD'} {timeAgo(u.created_at)}
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
                          {'\u05D0\u05E9\u05E8'}
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          startIcon={<CloseIcon />}
                          onClick={() => handleReject(u.id)}
                          disabled={updatingId === u.id}
                        >
                          {'\u05D3\u05D7\u05D4'}
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </Box>
        )}

        {/* All Users Tab */}
        {tabIndex === 1 && (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{'\u05DE\u05E9\u05EA\u05DE\u05E9'}</TableCell>
                  <TableCell>{'\u05D0\u05D9\u05DE\u05D9\u05D9\u05DC'}</TableCell>
                  <TableCell>{'\u05EA\u05E4\u05E7\u05D9\u05D3'}</TableCell>
                  <TableCell>{'\u05E1\u05D8\u05D8\u05D5\u05E1'}</TableCell>
                  <TableCell>{'\u05E4\u05E2\u05D9\u05DC'}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 30, height: 30, fontSize: '0.75rem', bgcolor: '#0073ea' }}>
                          {getInitials(u.full_name)}
                        </Avatar>
                        {u.full_name}
                      </Box>
                    </TableCell>
                    <TableCell>{u.email}</TableCell>
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
                        label={u.is_approved ? '\u05DE\u05D0\u05D5\u05E9\u05E8' : '\u05DE\u05DE\u05EA\u05D9\u05DF'}
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

        {/* Email Config Tab */}
        {tabIndex === 2 && (
          <Box sx={{ p: 3, maxWidth: 500 }}>
            {emailMsg.text && (
              <Alert severity={emailMsg.type} sx={{ mb: 2 }}>
                {emailMsg.text}
              </Alert>
            )}

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
                label={'\u05D0\u05D9\u05DE\u05D9\u05D9\u05DC \u05E9\u05D5\u05DC\u05D7'}
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
                  {emailConfig.is_enabled ? '\u05DE\u05D5\u05E4\u05E2\u05DC' : '\u05DE\u05D5\u05E9\u05D1\u05EA'}
                </Typography>
              </Box>

              <Divider />

              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  onClick={handleSaveEmail}
                  disabled={emailLoading}
                >
                  {'\u05E9\u05DE\u05D5\u05E8'}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<SendIcon />}
                  onClick={handleTestEmail}
                  disabled={emailLoading}
                >
                  {'\u05E9\u05DC\u05D7 \u05D1\u05D3\u05D9\u05E7\u05D4'}
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  startIcon={<NotificationsIcon />}
                  onClick={handleSendAlerts}
                  disabled={emailLoading}
                >
                  {'\u05E9\u05DC\u05D7 \u05D4\u05EA\u05E8\u05D0\u05D5\u05EA'}
                </Button>
              </Box>
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
