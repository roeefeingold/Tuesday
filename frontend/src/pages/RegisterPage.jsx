import { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';
import { post } from '../api/client';
import './RegisterPage.css';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim() || !email.trim() || !password) {
      setError('Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await post('/auth/register', {
        full_name: fullName.trim(),
        email: email.trim(),
        password,
      });
      setSuccess(true);
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string') {
        setError(detail);
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="register-page">
        <div className="register-card">
          <div className="register-success">
            <span className="register-success-icon">&#10003;</span>
            <h2>Registration Submitted!</h2>
            <p>An admin will approve your account. You'll be able to sign in once approved.</p>
            <Link to="/login">
              <Button variant="primary" size="lg">Back to Sign In</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="register-page">
      <div className="register-card">
        <div className="register-header">
          <h1 className="register-logo">Tuesday</h1>
          <p className="register-tagline">Create your account</p>
        </div>

        <form className="register-form" onSubmit={handleSubmit}>
          {error && <div className="register-error">{error}</div>}

          <div className="register-field">
            <label className="register-label">Full Name</label>
            <input
              type="text"
              className="register-input"
              placeholder="Jane Smith"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              autoFocus
            />
          </div>

          <div className="register-field">
            <label className="register-label">Email</label>
            <input
              type="email"
              className="register-input"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="register-field">
            <label className="register-label">Password</label>
            <input
              type="password"
              className="register-input"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="register-field">
            <label className="register-label">Confirm Password</label>
            <input
              type="password"
              className="register-input"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <Button type="submit" variant="primary" size="lg" fullWidth disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>

        <div className="register-footer">
          <p>Already have an account? <Link to="/login">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
}
