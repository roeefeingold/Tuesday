import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import BoardColumn from '../components/Board/BoardColumn';
import NewTicketModal from '../components/Board/NewTicketModal';
import Button from '../components/common/Button';
import Select from '../components/common/Select';
import Spinner from '../components/common/Spinner';
import { STATUSES, PRIORITIES, CATEGORIES } from '../utils/constants';
import { get } from '../api/client';
import './BoardPage.css';

export default function BoardPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [filterPriority, setFilterPriority] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const fetchTickets = useCallback(async () => {
    try {
      const params = {};
      if (filterPriority) params.priority = filterPriority;
      if (filterCategory) params.category = filterCategory;
      if (search.trim()) params.search = search.trim();
      const res = await get('/tickets', params);
      setTickets(res.data);
    } catch (err) {
      console.error('Failed to fetch tickets', err);
    } finally {
      setLoading(false);
    }
  }, [filterPriority, filterCategory, search]);

  useEffect(() => {
    setLoading(true);
    fetchTickets();
  }, [fetchTickets]);

  const grouped = STATUSES.map((status) => ({
    ...status,
    tickets: tickets.filter((t) => t.status === status.value),
  }));

  const handleTicketClick = (id) => {
    navigate(`/ticket/${id}`);
  };

  return (
    <div className="board-page">
      <div className="board-toolbar">
        <div className="board-toolbar-left">
          <h1 className="board-title">Board</h1>
        </div>
        <div className="board-toolbar-right">
          <input
            type="text"
            className="board-search"
            placeholder="Search tickets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select
            value={filterPriority}
            onChange={setFilterPriority}
            options={PRIORITIES}
            placeholder="All Priorities"
          />
          <Select
            value={filterCategory}
            onChange={setFilterCategory}
            options={CATEGORIES}
            placeholder="All Categories"
          />
          <Button variant="primary" onClick={() => setShowNewTicket(true)}>
            + New Ticket
          </Button>
        </div>
      </div>

      {loading ? (
        <Spinner size={40} />
      ) : (
        <div className="board-columns">
          {grouped.map((col) => (
            <BoardColumn
              key={col.value}
              status={col}
              tickets={col.tickets}
              onTicketClick={handleTicketClick}
            />
          ))}
        </div>
      )}

      <NewTicketModal
        isOpen={showNewTicket}
        onClose={() => setShowNewTicket(false)}
        onCreated={fetchTickets}
      />
    </div>
  );
}
