import { Box, Paper, Typography, Chip } from '@mui/material';
import { Droppable, Draggable } from '@hello-pangea/dnd';
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

      <Droppable droppableId={status.value}>
        {(provided, snapshot) => (
          <Box
            ref={provided.innerRef}
            {...provided.droppableProps}
            sx={{
              flex: 1,
              p: 1.5,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              minHeight: 100,
              transition: 'background-color 0.2s ease',
              backgroundColor: snapshot.isDraggingOver ? 'rgba(0,115,234,0.04)' : 'transparent',
              borderRadius: '0 0 8px 8px',
            }}
          >
            {tickets.length === 0 && !snapshot.isDraggingOver ? (
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
                <Typography variant="body2" sx={{ opacity: 0.5 }}>
                  אין תקלות כאן
                </Typography>
              </Box>
            ) : (
              tickets.map((ticket, index) => (
                <Draggable
                  key={ticket.id}
                  draggableId={String(ticket.id)}
                  index={index}
                >
                  {(dragProvided, dragSnapshot) => (
                    <Box
                      ref={dragProvided.innerRef}
                      {...dragProvided.draggableProps}
                      {...dragProvided.dragHandleProps}
                      sx={{
                        opacity: dragSnapshot.isDragging ? 0.85 : 1,
                        transform: dragSnapshot.isDragging ? 'rotate(-1deg)' : 'none',
                      }}
                    >
                      <TicketCard
                        ticket={ticket}
                        onClick={() => !dragSnapshot.isDragging && onTicketClick(ticket.id)}
                      />
                    </Box>
                  )}
                </Draggable>
              ))
            )}
            {provided.placeholder}
          </Box>
        )}
      </Droppable>
    </Paper>
  );
}
