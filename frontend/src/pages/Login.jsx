import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      onLogin(data.user, data.token);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '4rem auto' }} className="card">
      <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Welcome Back</h2>
      {error && <div className="error-text">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Email</label>
          <input 
            type="email" 
            required 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            placeholder="john@example.com"
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Password</label>
          <input 
            type="password" 
            required 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            placeholder="••••••••"
          />
        </div>
        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <div style={{ marginTop: '1.5rem', textAlign: 'center', color: 'var(--text-light)' }}>
        Don't have an account? <Link to="/signup" style={{ color: 'var(--primary)' }}>Sign up</Link>
      </div>
    </div>
  );
};

export default Login;
