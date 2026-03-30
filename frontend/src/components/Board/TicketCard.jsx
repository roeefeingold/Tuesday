import Badge from '../common/Badge';
import Avatar from '../common/Avatar';
import { getPriorityInfo } from '../../utils/helpers';
import { timeAgo } from '../../utils/helpers';
import './TicketCard.css';

export default function TicketCard({ ticket, onClick }) {
  const priority = getPriorityInfo(ticket.priority);
  const categoryColor = ticket.category === 'bug' ? 'var(--color-critical)' : 'var(--color-primary)';

  return (
    <div className="ticket-card" onClick={onClick}>
      <div className="ticket-card-top">
        <span className="ticket-card-id">#{ticket.id}</span>
        <Badge label={ticket.category === 'bug' ? 'Bug' : 'Task'} color={categoryColor} size="sm" />
      </div>
      <h4 className="ticket-card-title">{ticket.title}</h4>
      <div className="ticket-card-bottom">
        <div className="ticket-card-meta">
          <Badge label={priority.label} color={priority.color} size="sm" />
          {ticket.assignee_name ? (
            <Avatar name={ticket.assignee_name} size="sm" />
          ) : (
            <span className="ticket-card-unassigned">Unassigned</span>
          )}
        </div>
        <span className="ticket-card-time">{timeAgo(ticket.created_at)}</span>
      </div>
    </div>
  );
}
