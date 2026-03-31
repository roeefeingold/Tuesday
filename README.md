# Tuesday - Ticket Management System

A simple, beautiful ticket management system for risk management teams. Built like Monday.com, but simpler - focused on tracking bugs and tasks assigned to developers.

## Features

- **Board View** - Kanban-style board with three columns: Open, In Process, Solved
- **Ticket Management** - Create, assign, and track bugs and tasks with priority levels
- **Workflow** - Simple status flow: Open -> In Process (developer assigned) -> Solved
- **User Management** - Registration with admin approval, role-based access (Admin, Developer, Reporter)
- **Comments** - Add comments to tickets for communication and tracking
- **Beautiful UI** - Clean, professional Monday.com-inspired design

## Tech Stack

- **Frontend**: React 18 + Vite
- **Backend**: Python FastAPI (async)
- **Database**: PostgreSQL 16
- **Reverse Proxy**: Nginx
- **Containerization**: Docker Compose

## Quick Start

```bash
# Clone and start
docker-compose up --build

# Access the app
open http://localhost
```

## Default Admin Account

- **Email**: admin@tuesday.com
- **Password**: admin123

## Architecture

```
                  ┌─────────┐
                  │  Nginx   │ :80
                  └────┬─────┘
                ┌──────┴──────┐
          /api  │             │  /*
        ┌───────▼──┐    ┌────▼────┐
        │ Backend  │    │Frontend │
        │ FastAPI  │    │  React  │
        │  :8000   │    │  :3000  │
        └────┬─────┘    └─────────┘
             │
        ┌────▼─────┐
        │PostgreSQL│
        │  :5432   │
        └──────────┘
```

## User Roles

| Role | Permissions |
|------|------------|
| **Admin** | Approve users, manage roles, assign tickets, reopen solved tickets |
| **Developer** | Take tickets, update status, add comments |
| **Reporter** | Create tickets, add comments, view board |

## Workflow

1. **Reporter** creates a ticket (Bug or Task) with priority level
2. **Admin** assigns a developer (or developer self-assigns)
3. **Developer** moves ticket to "In Process" and works on it
4. **Developer** marks ticket as "Solved" when done
5. **Admin** can reopen solved tickets if needed
