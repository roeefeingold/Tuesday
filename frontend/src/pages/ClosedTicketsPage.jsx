import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { get, patch } from '../api/client';
import { getPriorityInfo, timeAgo, getInitials } from '../utils/helpers';
import { PRIORITIES } from '../utils/constants';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Avatar, Button, TextField, MenuItem,
  CircularProgress, Tooltip, InputAdornment,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SearchIcon from '@mui/icons-material/Search';
import RestoreIcon from '@mui/icons-material/Restore';

export default function ClosedTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterAssignee, setFilterAssignee] = useState('');
  const [users, setUsers] = useState([]);
  const [reopening, setReopening] = useState(null);
  const navigate = useNavigate();

  const fetchTickets = useCallback(async () => {
    try {
      const params = { status: 'closed' };
      if (search.trim()) params.search = search.trim();
      if (filterPriority) params.priority = filterPriority;
      if (filterAssignee) params.assignee_id = filterAssignee;
      const res = await get('/tickets', params);
      setTickets(res.data);
    } catch (err) {
      console.error('Failed to fetch closed tickets', err);
    } finally {
      setLoading(false);
    }
  }, [search, filterPriority, filterAssignee]);

  useEffect(() => {
    fetchTickets();
    get('/users/active').then((res) => setUsers(res.data)).catch(() => {});
  }, [fetchTickets]);

  const handleReopen = async (ticketId) => {
    setReopening(ticketId);
    try {
      await patch(`/tickets/${ticketId}/status`, { status: 'open' });
      await fetchTickets();
    } catch (err) {
      alert(err.response?.data?.detail || 'נכשל בפתיחה מחדש');
    } finally {
      setReopening(null);
    }
  };

  return (
    <Box dir="rtl">
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1.5 }}>
        <Button
          startIcon={<ArrowForwardIcon />}
          onClick={() => navigate('/board')}
          sx={{ color: 'text.secondary' }}
        >
          חזרה ללוח
        </Button>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          תקלות שנסגרו
        </Typography>
        <Chip
          label={tickets.length}
          size="small"
          sx={{ backgroundColor: '#00c875', color: '#fff', fontWeight: 600 }}
        />
      </Box>

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 1.5, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          size="small"
          placeholder="חיפוש לפי כותרת..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 220 }}
        />

        <TextField
          select
          size="small"
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          label="עדיפות"
          sx={{ minWidth: 140 }}
        >
          <MenuItem value="">כל העדיפויות</MenuItem>
          {PRIORITIES.map((p) => (
            <MenuItem key={p.value} value={p.value}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: p.color }} />
                {p.label}
              </Box>
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          size="small"
          value={filterAssignee}
          onChange={(e) => setFilterAssignee(e.target.value)}
          label="משויך"
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">כל המשתמשים</MenuItem>
          {users.map((u) => (
            <MenuItem key={u.id} value={u.id}>{u.full_name}</MenuItem>
          ))}
        </TextField>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : tickets.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            אין תקלות סגורות
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 2 }} dir="rtl">
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f9fafb' }}>
                <TableCell sx={{ fontWeight: 600 }}>#</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>כותרת</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>עדיפות</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>מדווח</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>משויך</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>נפתח</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>פעולות</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tickets.map((t) => {
                const priority = getPriorityInfo(t.priority);
                return (
                  <TableRow
                    key={t.id}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/ticket/${t.id}`)}
                  >
                    <TableCell>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {t.id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {t.title}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={priority.label}
                        size="small"
                        sx={{ backgroundColor: priority.color, color: '#fff', fontWeight: 500, fontSize: '0.75rem' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <Avatar sx={{ width: 24, height: 24, fontSize: '0.65rem', bgcolor: '#0073ea' }}>
                          {getInitials(t.reporter_name)}
                        </Avatar>
                        <Typography variant="body2">{t.reporter_name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {t.assignee_name ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                          <Avatar sx={{ width: 24, height: 24, fontSize: '0.65rem', bgcolor: '#0073ea' }}>
                            {getInitials(t.assignee_name)}
                          </Avatar>
                          <Typography variant="body2">{t.assignee_name}</Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" sx={{ color: 'text.disabled' }}>—</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {timeAgo(t.created_at)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Tooltip title="החזר ללוח">
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<RestoreIcon />}
                          disabled={reopening === t.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReopen(t.id);
                          }}
                        >
                          פתח מחדש
                        </Button>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
