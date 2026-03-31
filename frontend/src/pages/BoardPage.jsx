import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BoardColumn from '../components/Board/BoardColumn';
import NewTicketModal from '../components/Board/NewTicketModal';
import { STATUSES, PRIORITIES } from '../utils/constants';
import { get } from '../api/client';
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Button,
  CircularProgress,
  ToggleButton,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import PersonIcon from '@mui/icons-material/Person';

export default function BoardPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [filterPriority, setFilterPriority] = useState('');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const myTickets = searchParams.get('my') === '1';

  const fetchTickets = useCallback(async () => {
    try {
      const params = {};
      if (filterPriority) params.priority = filterPriority;
      if (search.trim()) params.search = search.trim();
      const res = await get('/tickets', params);
      setTickets(res.data);
    } catch (err) {
      console.error('Failed to fetch tickets', err);
    } finally {
      setLoading(false);
    }
  }, [filterPriority, search]);

  useEffect(() => {
    setLoading(true);
    fetchTickets();
  }, [fetchTickets]);

  const filteredTickets = myTickets
    ? tickets.filter((t) => t.assignee_id === user?.id)
    : tickets;

  const grouped = STATUSES.map((status) => ({
    ...status,
    tickets: filteredTickets.filter((t) => t.status === status.value),
  }));

  const handleTicketClick = (id) => {
    navigate(`/ticket/${id}`);
  };

  const handleToggleMyTickets = () => {
    if (myTickets) {
      navigate('/board');
    } else {
      navigate('/board?my=1');
    }
  };

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 3,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          לוח תקלות
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder="חיפוש תקלות..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 200 }}
          />

          <TextField
            select
            size="small"
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
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

          <ToggleButton
            value="my"
            selected={myTickets}
            onChange={handleToggleMyTickets}
            size="small"
            sx={{
              textTransform: 'none',
              px: 2,
              borderColor: myTickets ? 'primary.main' : undefined,
            }}
          >
            <PersonIcon fontSize="small" sx={{ ml: 0.5 }} />
            התקלות שלי
          </ToggleButton>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowNewTicket(true)}
            sx={{ px: 3 }}
          >
            תקלה חדשה
          </Button>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            gap: 2.5,
            alignItems: 'start',
          }}
        >
          {grouped.map((col) => (
            <BoardColumn
              key={col.value}
              status={col}
              tickets={col.tickets}
              onTicketClick={handleTicketClick}
            />
          ))}
        </Box>
      )}

      <NewTicketModal
        isOpen={showNewTicket}
        onClose={() => setShowNewTicket(false)}
        onCreated={fetchTickets}
      />
    </Box>
  );
}
