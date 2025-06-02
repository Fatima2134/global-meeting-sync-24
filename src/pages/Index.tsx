
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from '../components/AuthPage';
import Dashboard from '../components/Dashboard';
import UpcomingMeetings from '../components/UpcomingMeetings';

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  const handleLogin = (email: string) => {
    setIsAuthenticated(true);
    setUserEmail(email);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserEmail('');
  };

  if (!isAuthenticated) {
    return <AuthPage onLogin={handleLogin} />;
  }

  return (
    <Routes>
      <Route 
        path="/" 
        element={<Dashboard userEmail={userEmail} onLogout={handleLogout} />} 
      />
      <Route 
        path="/meetings" 
        element={<UpcomingMeetings userEmail={userEmail} onLogout={handleLogout} />} 
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default Index;
