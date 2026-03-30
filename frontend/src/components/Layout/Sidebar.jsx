import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

export default function Sidebar() {
  const { isAdmin } = useAuth();

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        <NavLink
          to="/board"
          className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link--active' : ''}`}
        >
          <span className="sidebar-icon">&#9776;</span>
          <span>Board</span>
        </NavLink>
        {isAdmin && (
          <NavLink
            to="/admin"
            className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link--active' : ''}`}
          >
            <span className="sidebar-icon">&#9881;</span>
            <span>Admin Panel</span>
          </NavLink>
        )}
      </nav>
    </aside>
  );
}
