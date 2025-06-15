
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

  // Auto-delete past meetings function
  const cleanupPastMeetings = (meetingsList: any[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return meetingsList.filter(meeting => {
      const meetingDate = new Date(meeting.date);
      meetingDate.setHours(0, 0, 0, 0);
      return meetingDate >= today;
    });
  };

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
      const parsedAppointments = JSON.parse(savedAppointments);
      // Clean up past meetings on load
      const cleanedAppointments = cleanupPastMeetings(parsedAppointments);
      setAppointments(cleanedAppointments);
      
      // Update localStorage if appointments were cleaned
      if (cleanedAppointments.length !== parsedAppointments.length) {
        localStorage.setItem('appointments', JSON.stringify(cleanedAppointments));
      }
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

  // Clean up past meetings daily
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      setAppointments(prev => {
        const cleaned = cleanupPastMeetings(prev);
        if (cleaned.length !== prev.length) {
          localStorage.setItem('appointments', JSON.stringify(cleaned));
        }
        return cleaned;
      });
    }, 24 * 60 * 60 * 1000); // Check every 24 hours

    return () => clearInterval(cleanupInterval);
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
  }, [registeredUsers]);

  useEffect(() => {
    const cleanedAppointments = cleanupPastMeetings(appointments);
    localStorage.setItem('appointments', JSON.stringify(cleanedAppointments));
    
    // Update state if appointments were cleaned
    if (cleanedAppointments.length !== appointments.length) {
      setAppointments(cleanedAppointments);
    }
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
    const newAppointment = { ...appointment, id: Date.now() };
    setAppointments(prev => {
      const updated = [...prev, newAppointment];
      // Save immediately to localStorage
      localStorage.setItem('appointments', JSON.stringify(updated));
      return updated;
    });
  };

  const handleUpdateAppointment = (id: number, updatedAppointment: any) => {
    setAppointments(prev => {
      const updated = prev.map(appointment => 
        appointment.id === id 
          ? { ...updatedAppointment, id }
          : appointment
      );
      // Save immediately to localStorage
      localStorage.setItem('appointments', JSON.stringify(updated));
      return updated;
    });
  };

  const handleDeleteAppointment = (id: number) => {
    setAppointments(prev => {
      const updated = prev.filter(appointment => appointment.id !== id);
      // Save immediately to localStorage
      localStorage.setItem('appointments', JSON.stringify(updated));
      return updated;
    });
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
