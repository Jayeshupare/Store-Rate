import { useState, useEffect } from 'react';
import api from '../api';
import { Star, Search } from 'lucide-react';

const StarRating = ({ storeId, existingScore, existingRatingId, onRate }) => {
  const [hover, setHover] = useState(0);
  return (
    <div className="star-rating" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map(star => (
        <Star 
          key={star} 
          size={24} 
          fill={(hover || existingScore) >= star ? '#fbbf24' : 'none'}
          color={(hover || existingScore) >= star ? '#fbbf24' : 'var(--border)'}
          onMouseEnter={() => setHover(star)}
          onClick={() => onRate(storeId, star, existingRatingId)}
          style={{ transition: 'all 0.2s' }}
        />
      ))}
    </div>
  );
};

const NormalUserDashboard = () => {
  const [stores, setStores] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchStores = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/stores', { params: { search } });
      setStores(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line
    fetchStores();
  }, [search]);

  const handleRate = async (storeId, score, existingRatingId) => {
    try {
      if (existingRatingId) {
        await api.put(`/ratings/${existingRatingId}`, { score });
      } else {
        await api.post('/ratings', { storeId, score });
      }
      fetchStores(); // Refresh
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit rating');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Available Stores</h2>
        <div style={{ position: 'relative', width: '300px' }}>
          <Search size={20} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
          <input 
            type="text" 
            placeholder="Search stores by name or address..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '2.5rem', marginBottom: 0 }}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>Loading stores...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
          {stores.map(store => (
            <div key={store.id} className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ marginBottom: 'auto' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{store.name}</h3>
                <p style={{ color: 'var(--text-light)', fontSize: '0.875rem', marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {store.address}
                </p>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                  <span style={{ fontWeight: 600 }}>Overall Rating:</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: '#FEF3C7', color: '#B45309', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.875rem', fontWeight: 600 }}>
                    <Star size={14} fill="currentColor" />
                    {store.averageRating || 'No ratings'}
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-light)', fontWeight: 500 }}>
                    {store.userRating ? 'Modify your rating' : 'Submit a rating'}
                  </span>
                  <StarRating 
                    storeId={store.id} 
                    existingScore={store.userRating} 
                    existingRatingId={store.userRatingId} 
                    onRate={handleRate}
                  />
                </div>
              </div>
            </div>
          ))}
          {stores.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', background: 'var(--surface)', borderRadius: 'var(--radius)', color: 'var(--text-light)' }}>
              No stores match your search.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NormalUserDashboard;
