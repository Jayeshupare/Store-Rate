import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminDashboard from './pages/AdminDashboard';
import StoreOwnerDashboard from './pages/StoreOwnerDashboard';
import NormalUserDashboard from './pages/NormalUserDashboard';
import Navigation from './components/Navigation';

const ProtectedRoute = ({ user, children, allowedRoles }) => {
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" />;
  return children;
};

function App() {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const handleLogin = (userData, token) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  };



  return (
    <BrowserRouter>
      <div className="layout">
        {user && <Navigation user={user} onLogout={handleLogout} />}
        <main className="main-content">
          <Routes>
            <Route path="/login" element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} />
            <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/" />} />
            
            <Route path="/" element={
              <ProtectedRoute user={user}>
                {user?.role === 'System Administrator' && <AdminDashboard />}
                {user?.role === 'Store Owner' && <StoreOwnerDashboard />}
                {user?.role === 'Normal User' && <NormalUserDashboard />}
              </ProtectedRoute>
            } />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
