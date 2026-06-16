import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    address: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.name.length < 10 || formData.name.length > 60) {
      return setError('Name must be between 10 and 60 characters.');
    }
    if (formData.address.length > 400) {
      return setError('Address must be max 400 characters.');
    }
    const re = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,16}$/;
    if (!re.test(formData.password)) {
      return setError('Password must be 8-16 chars, include one uppercase letter and one special character.');
    }

    setLoading(true);
    try {
      await api.post('/auth/signup', { ...formData, role: 'Normal User' });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '2rem auto' }} className="card">
      <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Create an Account</h2>
      {error && <div className="error-text">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Full Name (10-60 chars)</label>
          <input 
            type="text" 
            name="name"
            required 
            value={formData.name} 
            onChange={handleChange} 
            placeholder="John Doe the first of his name..."
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Email</label>
          <input 
            type="email" 
            name="email"
            required 
            value={formData.email} 
            onChange={handleChange} 
            placeholder="john@example.com"
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Password</label>
          <input 
            type="password" 
            name="password"
            required 
            value={formData.password} 
            onChange={handleChange} 
            placeholder="Secret@123"
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Address (Max 400 chars)</label>
          <textarea 
            name="address"
            required 
            value={formData.address} 
            onChange={handleChange} 
            placeholder="123 Main St, City, Country"
            rows={3}
          />
        </div>
        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
          {loading ? 'Signing up...' : 'Sign Up'}
        </button>
      </form>
      <div style={{ marginTop: '1.5rem', textAlign: 'center', color: 'var(--text-light)' }}>
        Already have an account? <Link to="/login" style={{ color: 'var(--primary)' }}>Login</Link>
      </div>
    </div>
  );
};

export default Signup;
