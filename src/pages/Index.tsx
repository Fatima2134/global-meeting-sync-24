
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { meetingService } from '@/services/meetingService';
import { timezoneService } from '@/services/timezoneService';
import SupabaseAuthPage from '../components/SupabaseAuthPage';
import Dashboard from '../components/Dashboard';
import UpcomingMeetings from '../components/UpcomingMeetings';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [selectedTimezones, setSelectedTimezones] = useState<string[]>(['America/New_York']);
  const [primaryTimezone, setPrimaryTimezone] = useState('America/New_York');
  const [loadingData, setLoadingData] = useState(false);

  // Load user data when authenticated
  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;
    
    setLoadingData(true);
    try {
      // Load meetings
      const meetings = await meetingService.getMeetings(user.id);
      setAppointments(meetings.map(meeting => ({
        id: meeting.id,
        title: meeting.title,
        description: meeting.description,
        date: meeting.meeting_date,
        time: meeting.meeting_time,
        duration: meeting.duration,
        timezone: meeting.timezone,
        meetingUrl: meeting.meeting_url,
        status: meeting.status,
        attendees: meeting.attendees
      })));

      // Load timezone preferences
      const timezonePrefs = await timezoneService.getTimezonePreferences(user.id);
      if (timezonePrefs.length > 0) {
        const timezones = timezonePrefs.map(pref => pref.timezone);
        const primary = timezonePrefs.find(pref => pref.is_primary)?.timezone || timezones[0];
        setSelectedTimezones(timezones);
        setPrimaryTimezone(primary);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoadingData(false);
    }
  };

  const handleCreateAppointment = async (appointment: any) => {
    if (!user) return;

    try {
      const newMeeting = await meetingService.createMeeting({
        title: appointment.title,
        description: appointment.description,
        meeting_date: appointment.date,
        meeting_time: appointment.time,
        duration: appointment.duration,
        timezone: appointment.timezone,
        meeting_url: appointment.meetingUrl
      });

      // Add attendees if provided
      if (appointment.attendees && appointment.attendees.length > 0) {
        for (const attendee of appointment.attendees) {
          if (attendee.email) {
            await meetingService.addAttendee(newMeeting.id, attendee.email);
          }
        }
      }

      // Reload meetings
      await loadUserData();
      
      toast({
        title: 'Success',
        description: 'Meeting created successfully!',
      });
    } catch (error) {
      console.error('Error creating meeting:', error);
      toast({
        title: 'Error',
        description: 'Failed to create meeting. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateAppointment = async (id: string, updatedAppointment: any) => {
    try {
      await meetingService.updateMeeting(id, {
        title: updatedAppointment.title,
        description: updatedAppointment.description,
        meeting_date: updatedAppointment.date,
        meeting_time: updatedAppointment.time,
        duration: updatedAppointment.duration,
        timezone: updatedAppointment.timezone,
        meeting_url: updatedAppointment.meetingUrl
      });

      // Reload meetings
      await loadUserData();
      
      toast({
        title: 'Success',
        description: 'Meeting updated successfully!',
      });
    } catch (error) {
      console.error('Error updating meeting:', error);
      toast({
        title: 'Error',
        description: 'Failed to update meeting. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    try {
      await meetingService.deleteMeeting(id);
      
      // Reload meetings
      await loadUserData();
      
      toast({
        title: 'Success',
        description: 'Meeting deleted successfully!',
      });
    } catch (error) {
      console.error('Error deleting meeting:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete meeting. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleTimezoneChange = async (timezones: string[], primary: string) => {
    if (!user) return;

    try {
      await timezoneService.updateTimezonePreferences(user.id, timezones, primary);
      setSelectedTimezones(timezones);
      setPrimaryTimezone(primary);
      
      toast({
        title: 'Success',
        description: 'Timezone preferences updated!',
      });
    } catch (error) {
      console.error('Error updating timezone preferences:', error);
      toast({
        title: 'Error',
        description: 'Failed to update timezone preferences. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (loading || loadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <SupabaseAuthPage />;
  }

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          <Dashboard 
            userEmail={user.email || ''} 
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
            userEmail={user.email || ''} 
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
