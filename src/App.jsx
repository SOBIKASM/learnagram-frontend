
import React from 'react';
import { Routes, Route, Navigate } from "react-router-dom"; // Add Navigate here
import Welcome from './pages/Welcome';
import Navigation from './pages/Navigation';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      
      <Route path="*" element={<Welcome />} />

      
      {/* Protected routes - note the * wildcard */}
      <Route path="/navigation/*" element={
        <ProtectedRoute>
          <Navigation />
        </ProtectedRoute>
      } />
      
      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;