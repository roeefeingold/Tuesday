import { Box, Paper, Typography, Chip } from '@mui/material';
import TicketCard from './TicketCard';

export default function BoardColumn({ status, tickets, onTicketClick }) {
  return (
    <Paper
      elevation={0}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        border: '1px solid #e6e9ef',
        overflow: 'hidden',
        backgroundColor: '#fafbfc',
        minHeight: 350,
      }}
    >
      <Box
        sx={{
          borderTop: `4px solid ${status.color}`,
          px: 2.5,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
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
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}
      >
        {tickets.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 6,
              color: 'text.secondary',
              textAlign: 'center',
              flex: 1,
            }}
          >
            <Typography variant="h4" sx={{ mb: 1, opacity: 0.4 }}>
              📋
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.6 }}>
              אין תקלות כאן
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
