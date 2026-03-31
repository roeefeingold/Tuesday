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
        borderRadius: 1.5,
        transition: 'all 0.15s ease',
        backgroundColor: '#fff',
        '&:hover': {
          elevation: 2,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          borderColor: '#c4c4c4',
        },
      }}
    >
      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            #{ticket.id}
          </Typography>
          <Tooltip title={priority.label}>
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
            mb: 1,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: 1.4,
          }}
        >
          {ticket.title}
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {ticket.assignee_name ? (
              <Tooltip title={ticket.assignee_name}>
                <Avatar
                  sx={{
                    width: 22,
                    height: 22,
                    fontSize: '0.65rem',
                    bgcolor: '#0073ea',
                  }}
                >
                  {getInitials(ticket.assignee_name)}
                </Avatar>
              </Tooltip>
            ) : (
              <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.7rem' }}>
                {'\u05DC\u05D0 \u05E9\u05D5\u05D9\u05DA'}
              </Typography>
            )}
          </Box>

          <Tooltip title={`${'\u05E4\u05EA\u05D5\u05D7'} ${ageLabel}`}>
            <Typography variant="caption" sx={{ fontSize: '0.85rem', cursor: 'default' }}>
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
