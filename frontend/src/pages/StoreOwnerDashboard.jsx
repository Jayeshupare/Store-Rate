import { useState, useEffect } from 'react';
import api from '../api';
import { Star, Users } from 'lucide-react';

const StoreOwnerDashboard = () => {
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ average: 0, total: 0 });

  const fetchRatings = async () => {
    try {
      const { data } = await api.get('/stores/my-ratings');
      setRatings(data);
      
      if (data.length > 0) {
        const avg = data.reduce((acc, curr) => acc + curr.score, 0) / data.length;
        setStats({ average: avg.toFixed(2), total: data.length });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    fetchRatings();
  }, []);

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem' }}>Store Owner Dashboard</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid #F59E0B' }}>
          <div style={{ background: '#F59E0B20', padding: '1rem', borderRadius: '50%', color: '#F59E0B' }}>
            <Star size={24} />
          </div>
          <div>
            <div style={{ color: 'var(--text-light)', fontSize: '0.875rem', fontWeight: 500 }}>Average Rating</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats.average || '0.00'}</div>
          </div>
        </div>
        
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid var(--primary)' }}>
          <div style={{ background: 'var(--primary)20', padding: '1rem', borderRadius: '50%', color: 'var(--primary)' }}>
            <Users size={24} />
          </div>
          <div>
            <div style={{ color: 'var(--text-light)', fontSize: '0.875rem', fontWeight: 500 }}>Total Reviews</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats.total}</div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '1.5rem' }}>Recent Ratings</h3>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>User Name</th>
                  <th>User Email</th>
                  <th>Rating Given</th>
                  <th>Date Submitted</th>
                </tr>
              </thead>
              <tbody>
                {ratings.map(r => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 500 }}>{r.User.name}</td>
                    <td>{r.User.email}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#B45309', fontWeight: 600 }}>
                        <Star size={16} fill="#fbbf24" color="#fbbf24" />
                        {r.score}
                      </div>
                    </td>
                    <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
                {ratings.length === 0 && <tr><td colSpan="4" style={{ textAlign: 'center' }}>No ratings received yet.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreOwnerDashboard;
