import TicketCard from './TicketCard';
import './BoardColumn.css';

export default function BoardColumn({ status, tickets, onTicketClick }) {
  return (
    <div className="board-column">
      <div className="board-column-header">
        <div className="board-column-indicator" style={{ background: status.color }} />
        <h3 className="board-column-title">{status.label}</h3>
        <span className="board-column-count">{tickets.length}</span>
      </div>
      <div className="board-column-body">
        {tickets.length === 0 ? (
          <div className="board-column-empty">
            <span className="board-column-empty-icon">&#128203;</span>
            <p>No tickets here yet</p>
          </div>
        ) : (
          tickets.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              onClick={() => onTicketClick(ticket.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
