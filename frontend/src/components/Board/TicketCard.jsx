import { Card, CardContent, Typography, Box, Avatar, Tooltip } from '@mui/material';
import { getPriorityInfo, getInitials, timeAgo, getTicketAge, getAgeEmoji, getAgeLabel } from '../../utils/helpers';

export default function TicketCard({ ticket, onClick }) {
  const priority = getPriorityInfo(ticket.priority);
  const days = getTicketAge(ticket.created_at);
  const ageEmoji = getAgeEmoji(days);
  const ageLabel = getAgeLabel(days);

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
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          borderColor: '#c4c4c4',
          transform: 'translateY(-1px)',
        },
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
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
          }}
        >
          {ticket.title}
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            {ticket.assignee_name ? (
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
            ) : (
              <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.7rem' }}>
                לא שויך
              </Typography>
            )}
          </Box>

          <Tooltip title={`פתוח ${ageLabel}`} placement="top">
            <Typography variant="caption" sx={{ fontSize: '0.95rem', cursor: 'default', lineHeight: 1 }}>
              {ageEmoji}
            </Typography>
          </Tooltip>

          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
            {timeAgo(ticket.created_at)}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
