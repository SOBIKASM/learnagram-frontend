import React from 'react';
import './More.css';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function More() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="more-container">
      <h2>More Options</h2>
      
      <div className="more-menu">
        <div className="menu-item">
          <h3>Account</h3>
          <p>Username: {user?.username}</p>
          <p>Role: {user?.role}</p>
          <p>Email: {user?.email}</p>
        </div>

        <div className="menu-item">
          <h3>Settings</h3>
          <button>Account Settings</button>
          <button>Privacy Settings</button>
          <button>Notification Preferences</button>
        </div>

        <div className="menu-item">
          <h3>Help & Support</h3>
          <button>Help Center</button>
          <button>Report a Problem</button>
          <button>Terms of Service</button>
        </div>

        <div className="menu-item">
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default More;