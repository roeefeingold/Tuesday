import { useAuth } from '../../context/AuthContext';
import Avatar from '../common/Avatar';
import Button from '../common/Button';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <span className="navbar-logo">Tuesday</span>
      </div>
      <div className="navbar-right">
        {user && (
          <>
            <div className="navbar-user">
              <Avatar name={user.full_name} size="sm" />
              <span className="navbar-username">{user.full_name}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={logout}>
              Logout
            </Button>
          </>
        )}
      </div>
    </nav>
  );
}
