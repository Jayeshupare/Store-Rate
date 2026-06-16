import { LogOut, User, Key } from 'lucide-react';

import { useState } from 'react';
import api from '../api';

const Navigation = ({ user, onLogout }) => {
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [msg, setMsg] = useState({ text: '', type: '' });

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMsg({ text: '', type: '' });
    try {
      await api.put('/users/password', { newPassword });
      setMsg({ text: 'Password updated successfully!', type: 'success' });
      setNewPassword('');
      setTimeout(() => setShowPwdModal(false), 2000);
    } catch (err) {
      setMsg({ text: err.response?.data?.error || 'Failed to update', type: 'error' });
    }
  };

  return (
    <>
      <header className="header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>StoreRate</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-light)' }}>
            <User size={20} />
            <span>{user.name}</span>
          </div>
          <button className="btn btn-outline" style={{ padding: '0.5rem 1rem' }} onClick={() => setShowPwdModal(true)}>
            <Key size={18} /> Password
          </button>
          <button className="btn btn-outline" style={{ padding: '0.5rem 1rem' }} onClick={onLogout}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </header>

      {showPwdModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Update Password</h3>
            {msg.text && (
              <div style={{ marginBottom: '1rem', color: msg.type === 'error' ? 'var(--error)' : 'var(--secondary)' }}>
                {msg.text}
              </div>
            )}
            <form onSubmit={handlePasswordChange}>
              <input 
                type="password" 
                placeholder="New Password (8-16 chars, 1 uppercase, 1 special)" 
                required 
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)} 
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowPwdModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Update</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Navigation;
