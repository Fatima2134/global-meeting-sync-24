
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import FunctionalSidebar from './FunctionalSidebar';
import Calendar from './Calendar';
import WorldClock from './WorldClock';
import AppointmentModal from './AppointmentModal';
import { useState } from 'react';

interface DashboardProps {
  userEmail: string;
  appointments: any[];
  onCreateAppointment: (appointment: any) => void;
  selectedTimezones: string[];
  primaryTimezone: string;
  onTimezoneChange: (timezones: string[], primary: string) => void;
}

const Dashboard = ({
  userEmail,
  appointments,
  onCreateAppointment,
  selectedTimezones,
  primaryTimezone,
  onTimezoneChange,
}: DashboardProps) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const handleLogout = async () => {
    await signOut();
  };

  const handleNavigateToMeetings = () => {
    navigate('/meetings');
  };

  const handleCalendarClick = () => {
    // Already on calendar view, could scroll to calendar or do nothing
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setIsAppointmentModalOpen(true);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <FunctionalSidebar 
        onNavigateToMeetings={handleNavigateToMeetings}
        onCalendarClick={handleCalendarClick}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header userEmail={userEmail} onLogout={handleLogout} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Calendar 
                selectedTimezones={selectedTimezones}
                primaryTimezone={primaryTimezone}
                appointments={appointments}
                onDateClick={handleDateClick}
              />
            </div>
            <div className="space-y-6">
              <WorldClock 
                selectedTimezones={selectedTimezones}
                primaryTimezone={primaryTimezone}
                onTimezoneChange={onTimezoneChange}
              />
            </div>
          </div>
        </main>
      </div>
      
      {isAppointmentModalOpen && (
        <AppointmentModal
          date={selectedDate}
          primaryTimezone={primaryTimezone}
          selectedTimezones={selectedTimezones}
          onClose={() => setIsAppointmentModalOpen(false)}
          onCreateAppointment={onCreateAppointment}
        />
      )}
    </div>
  );
};

export default Dashboard;
