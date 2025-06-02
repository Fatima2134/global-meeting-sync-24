
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from '../components/AuthPage';
import Dashboard from '../components/Dashboard';
import UpcomingMeetings from '../components/UpcomingMeetings';

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [registeredUsers, setRegisteredUsers] = useState<string[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);

  const handleLogin = (email: string, isSignUp: boolean = false) => {
    if (isSignUp) {
      setRegisteredUsers(prev => [...prev, email]);
      setIsAuthenticated(true);
      setUserEmail(email);
    } else {
      // Only allow login if user has signed up before
      if (registeredUsers.includes(email)) {
        setIsAuthenticated(true);
        setUserEmail(email);
      } else {
        alert('Please sign up first before logging in.');
        return false;
      }
    }
    return true;
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserEmail('');
  };

  const handleCreateAppointment = (appointment: any) => {
    setAppointments(prev => [...prev, { ...appointment, id: Date.now() }]);
  };

  if (!isAuthenticated) {
    return <AuthPage onLogin={handleLogin} />;
  }

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          <Dashboard 
            userEmail={userEmail} 
            onLogout={handleLogout} 
            appointments={appointments}
            onCreateAppointment={handleCreateAppointment}
          />
        } 
      />
      <Route 
        path="/meetings" 
        element={
          <UpcomingMeetings 
            userEmail={userEmail} 
            onLogout={handleLogout} 
            appointments={appointments}
          />
        } 
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default Index;
