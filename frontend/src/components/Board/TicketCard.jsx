import { Card, CardContent, Typography, Box, Avatar, Tooltip } from '@mui/material';
import { getPriorityInfo, getInitials, getTicketAge, getAgeLabel } from '../../utils/helpers';

function getAgeColor(days) {
  if (days < 5) return 'text.secondary';
  if (days < 10) return '#e67e00';
  return '#d32f2f';
}

export default function TicketCard({ ticket, onClick }) {
  const priority = getPriorityInfo(ticket.priority);
  const days = getTicketAge(ticket.created_at);
  const ageLabel = getAgeLabel(days);
  const ageColor = getAgeColor(days);
  const showAssignee = ticket.status !== 'open';

  return (
    <Card
      onClick={onClick}
      elevation={0}
     
      sx={{
        cursor: 'pointer',
        border: '1px solid #e6e9ef',
        borderRadius: 2,
        transition: 'all 0.2s ease',
        backgroundColor: '#fff',
        textAlign: 'right',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          borderColor: '#c4c4c4',
          transform: 'translateY(-1px)',
        },
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 }, textAlign: 'right' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500, fontSize: '0.75rem' }}>
            #{ticket.id}
          </Typography>
          <Tooltip title={priority.label} placement="top">
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: priority.color,
                flexShrink: 0,
              }}
            />
          </Tooltip>
        </Box>

        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            mb: 1.5,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: 1.5,
            fontSize: '0.875rem',
            textAlign: 'right',
          }}
        >
          {ticket.title}
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            {showAssignee && ticket.assignee_name ? (
              <Tooltip title={ticket.assignee_name} placement="top">
                <Avatar
                  sx={{
                    width: 24,
                    height: 24,
                    fontSize: '0.65rem',
                    bgcolor: '#0073ea',
                  }}
                >
                  {getInitials(ticket.assignee_name)}
                </Avatar>
              </Tooltip>
            ) : showAssignee ? (
              <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.7rem' }}>
                לא שויך
              </Typography>
            ) : null}
          </Box>

          <Typography
            variant="caption"
            sx={{
              color: ageColor,
              fontSize: '0.75rem',
              fontWeight: days >= 5 ? 600 : 400,
            }}
          >
            {ageLabel}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
