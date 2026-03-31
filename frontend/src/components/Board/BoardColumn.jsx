import { Box, Paper, Typography, Chip } from '@mui/material';
import TicketCard from './TicketCard';

export default function BoardColumn({ status, tickets, onTicketClick }) {
  return (
    <Paper
      elevation={0}
      sx={{
        flex: 1,
        minWidth: 300,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        border: '1px solid #e6e9ef',
        overflow: 'hidden',
        backgroundColor: '#fafbfc',
      }}
    >
      <Box
        sx={{
          borderTop: `4px solid ${status.color}`,
          px: 2,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          backgroundColor: '#fff',
          borderBottom: '1px solid #e6e9ef',
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          {status.label}
        </Typography>
        <Chip
          label={tickets.length}
          size="small"
          sx={{
            height: 22,
            fontSize: '0.75rem',
            fontWeight: 600,
            backgroundColor: status.color,
            color: '#fff',
          }}
        />
      </Box>

      <Box
        sx={{
          flex: 1,
          p: 1.5,
          overflowY: 'auto',
          minHeight: 200,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}
      >
        {tickets.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
            <Typography variant="h5" sx={{ mb: 1 }}>
              {'\u{1F4CB}'}
            </Typography>
            <Typography variant="body2">
              {'\u05D0\u05D9\u05DF \u05E7\u05E8\u05D9\u05D0\u05D5\u05EA \u05DB\u05D0\u05DF'}
            </Typography>
          </Box>
        ) : (
          tickets.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              onClick={() => onTicketClick(ticket.id)}
            />
          ))
        )}
      </Box>
    </Paper>
  );
}
