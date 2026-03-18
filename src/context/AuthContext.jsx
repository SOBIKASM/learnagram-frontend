import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);


const login = async (credentials) => {
  setLoading(true);
  setError(null);
  try {
    const response = await axios.post('http://localhost:7001/api/auth/login', credentials);
    
    const { user, token } = response.data;

    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);

    setUser(user);
    return response.data;
  } catch (err) {
    const message = err.response?.data?.message || err.message || 'Login failed';
    setError(message);
    throw new Error(message);
  } finally {
    setLoading(false);
  }
};

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};