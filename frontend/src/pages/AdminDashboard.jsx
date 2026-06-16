import { useState, useEffect } from 'react';
import api from '../api';
import { Users, Store as StoreIcon, Star, Plus } from 'lucide-react';

const StatCard = ({ icon: Icon, title, count, color }) => (
  <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: `4px solid ${color}` }}>
    <div style={{ background: `${color}20`, padding: '1rem', borderRadius: '50%', color }}>
      <Icon size={24} />
    </div>
    <div>
      <div style={{ color: 'var(--text-light)', fontSize: '0.875rem', fontWeight: 500 }}>{title}</div>
      <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{count}</div>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState({ userCount: 0, storeCount: 0, ratingCount: 0 });
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [tab, setTab] = useState('users');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [order, setOrder] = useState('ASC');

  // Add forms
  const [addFormData, setAddFormData] = useState({});

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: dashData } = await api.get('/users/dashboard');
      setStats(dashData);

      if (tab === 'users') {
        const { data } = await api.get('/users', { params: { search, role: roleFilter, sortBy, order } });
        setUsers(data);
      } else {
        const { data } = await api.get('/stores', { params: { search, sortBy, order } });
        setStores(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line
    fetchData();
  }, [tab, search, roleFilter, sortBy, order]);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      if (tab === 'users') {
        await api.post('/users', addFormData);
      } else {
        await api.post('/stores', addFormData);
      }
      setShowAddModal(false);
      setAddFormData({});
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add');
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem' }}>System Administrator Dashboard</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <StatCard icon={Users} title="Total Users" count={stats.userCount} color="var(--primary)" />
        <StatCard icon={StoreIcon} title="Total Stores" count={stats.storeCount} color="var(--secondary)" />
        <StatCard icon={Star} title="Total Ratings" count={stats.ratingCount} color="#F59E0B" />
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className={`btn ${tab === 'users' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab('users')}>Users</button>
            <button className={`btn ${tab === 'stores' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab('stores')}>Stores</button>
          </div>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={18} /> Add {tab === 'users' ? 'User' : 'Store'}
          </button>
        </div>

        <div className="filter-bar">
          <input 
            type="text" 
            placeholder="Search by name, email, address..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            style={{ flex: 1 }}
          />
          {tab === 'users' && (
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} style={{ width: '200px' }}>
              <option value="">All Roles</option>
              <option value="Normal User">Normal User</option>
              <option value="Store Owner">Store Owner</option>
              <option value="System Administrator">System Administrator</option>
            </select>
          )}
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ width: '150px' }}>
            <option value="name">Sort by Name</option>
            <option value="email">Sort by Email</option>
          </select>
          <select value={order} onChange={(e) => setOrder(e.target.value)} style={{ width: '120px' }}>
            <option value="ASC">Ascending</option>
            <option value="DESC">Descending</option>
          </select>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            {tab === 'users' ? (
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Address</th>
                    <th>Avg Rating (Owner)</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td style={{ fontWeight: 500 }}>{u.name}</td>
                      <td>{u.email}</td>
                      <td>
                        <span style={{ 
                          background: 'var(--primary)', 
                          color: 'white', 
                          padding: '0.25rem 0.5rem', 
                          borderRadius: '999px', 
                          fontSize: '0.75rem',
                          opacity: 0.9
                        }}>{u.role}</span>
                      </td>
                      <td style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.address}</td>
                      <td>{u.role === 'Store Owner' && u.avgRating ? parseFloat(u.avgRating).toFixed(2) : '-'}</td>
                    </tr>
                  ))}
                  {users.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center' }}>No users found.</td></tr>}
                </tbody>
              </table>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Store Name</th>
                    <th>Email</th>
                    <th>Address</th>
                    <th>Overall Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {stores.map(s => (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 500 }}>{s.name}</td>
                      <td>{s.email}</td>
                      <td style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.address}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Star size={16} fill="#fbbf24" color="#fbbf24" />
                          {s.averageRating || 'Unrated'}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {stores.length === 0 && <tr><td colSpan="4" style={{ textAlign: 'center' }}>No stores found.</td></tr>}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Add New {tab === 'users' ? 'User' : 'Store'}</h3>
            <form onSubmit={handleAddSubmit}>
              {tab === 'users' ? (
                <>
                  <input type="text" placeholder="Name" required onChange={e => setAddFormData({...addFormData, name: e.target.value})} />
                  <input type="email" placeholder="Email" required onChange={e => setAddFormData({...addFormData, email: e.target.value})} />
                  <input type="password" placeholder="Password" required onChange={e => setAddFormData({...addFormData, password: e.target.value})} />
                  <input type="text" placeholder="Address" required onChange={e => setAddFormData({...addFormData, address: e.target.value})} />
                  <select required onChange={e => setAddFormData({...addFormData, role: e.target.value})}>
                    <option value="">Select Role</option>
                    <option value="Normal User">Normal User</option>
                    <option value="Store Owner">Store Owner</option>
                    <option value="System Administrator">System Administrator</option>
                  </select>
                </>
              ) : (
                <>
                  <input type="text" placeholder="Store Name" required onChange={e => setAddFormData({...addFormData, name: e.target.value})} />
                  <input type="email" placeholder="Store Email" required onChange={e => setAddFormData({...addFormData, email: e.target.value})} />
                  <input type="text" placeholder="Address" required onChange={e => setAddFormData({...addFormData, address: e.target.value})} />
                  <select onChange={e => setAddFormData({...addFormData, ownerId: e.target.value})}>
                    <option value="">Select Owner (Optional)</option>
                    {users.filter(u => u.role === 'Store Owner').map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </>
              )}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
