import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';

function Login() {
  const [formData, setFormData] = useState({
    user_id: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const { login, error } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      console.log('Attempting login with user_id:', formData.user_id);
      await login(formData);
      console.log('Login successful, navigating...');
      navigate('/navigation/home');
    } catch (err) {
      console.error('Login failed:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fix demo credentials to match your ACTUAL database
  const fillStudentCredentials = () => {
    setFormData({
      user_id: '22CSE001',  
      password: 'password123'    
    });
  };

  return (
    <div className='login-page'>
      <div className='login-container'>
        <div className='brand-header'>
          <h1>Learnagram</h1>
          <p className="demo-hint">
            ✨ Try these credentials: ✨
          </p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form className='login-form' onSubmit={handleSubmit}>
          <label htmlFor="user_id">USER ID</label>
          <input
            type="text"
            id="user_id"
            name="user_id"
            value={formData.user_id}
            onChange={handleChange}
            placeholder='Enter User ID (e.g., 22CSE001)'
            autoComplete="username"
            required
          />

          <label htmlFor="password">PASSWORD</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder='Enter password'
            autoComplete="current-password"
            required
          />

          <button className="submit-btn" type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Log In'}
          </button>

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
            <button
              type="button"
              className="demo-fill-btn"
              onClick={fillStudentCredentials}
              style={{ width: '100%', maxWidth: '200px' }}
            >
              � Click to Fill Demo (Sobika)
            </button>
          </div>

          <div className="separator">
            <div className="line"></div>
            <div className="or-text">OR</div>
            <div className="line"></div>
          </div>

          <button type="button" className="google-btn" disabled>
            <span className="google-icon">G</span> Log in with Google
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;