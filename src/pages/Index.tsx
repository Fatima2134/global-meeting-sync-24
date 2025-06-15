
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from '../components/AuthPage';
import Dashboard from '../components/Dashboard';
import UpcomingMeetings from '../components/UpcomingMeetings';

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [registeredUsers, setRegisteredUsers] = useState<string[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [selectedTimezones, setSelectedTimezones] = useState<string[]>(['America/New_York']);
  const [primaryTimezone, setPrimaryTimezone] = useState('America/New_York');

  // Load data from localStorage on mount
  useEffect(() => {
    const savedUsers = localStorage.getItem('registeredUsers');
    const savedAppointments = localStorage.getItem('appointments');
    const savedTimezones = localStorage.getItem('selectedTimezones');
    const savedPrimaryTimezone = localStorage.getItem('primaryTimezone');
    const savedAuth = localStorage.getItem('isAuthenticated');
    const savedEmail = localStorage.getItem('userEmail');

    if (savedUsers) {
      setRegisteredUsers(JSON.parse(savedUsers));
    }
    if (savedAppointments) {
      setAppointments(JSON.parse(savedAppointments));
    }
    if (savedTimezones) {
      setSelectedTimezones(JSON.parse(savedTimezones));
    }
    if (savedPrimaryTimezone) {
      setPrimaryTimezone(savedPrimaryTimezone);
    }
    if (savedAuth === 'true' && savedEmail) {
      setIsAuthenticated(true);
      setUserEmail(savedEmail);
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
  }, [registeredUsers]);

  useEffect(() => {
    localStorage.setItem('appointments', JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem('selectedTimezones', JSON.stringify(selectedTimezones));
  }, [selectedTimezones]);

  useEffect(() => {
    localStorage.setItem('primaryTimezone', primaryTimezone);
  }, [primaryTimezone]);

  useEffect(() => {
    localStorage.setItem('isAuthenticated', isAuthenticated.toString());
    localStorage.setItem('userEmail', userEmail);
  }, [isAuthenticated, userEmail]);

  const handleLogin = (email: string, isSignUp: boolean = false) => {
    if (isSignUp) {
      setRegisteredUsers(prev => [...prev, email]);
      setIsAuthenticated(true);
      setUserEmail(email);
    } else {
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
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userEmail');
  };

  const handleCreateAppointment = (appointment: any) => {
    setAppointments(prev => [...prev, { ...appointment, id: Date.now() }]);
  };

  const handleUpdateAppointment = (id: number, updatedAppointment: any) => {
    setAppointments(prev => 
      prev.map(appointment => 
        appointment.id === id 
          ? { ...updatedAppointment, id }
          : appointment
      )
    );
  };

  const handleDeleteAppointment = (id: number) => {
    setAppointments(prev => prev.filter(appointment => appointment.id !== id));
  };

  const handleTimezoneChange = (timezones: string[], primary: string) => {
    setSelectedTimezones(timezones);
    setPrimaryTimezone(primary);
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
            selectedTimezones={selectedTimezones}
            primaryTimezone={primaryTimezone}
            onTimezoneChange={handleTimezoneChange}
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
            onUpdateAppointment={handleUpdateAppointment}
            onDeleteAppointment={handleDeleteAppointment}
          />
        } 
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default Index;
