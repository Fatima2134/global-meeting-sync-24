
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import FunctionalSidebar from '../components/FunctionalSidebar';
import Calendar from '../components/Calendar';
import AppointmentModal from '../components/AppointmentModal';

interface CalendarPageProps {
  userEmail: string;
  appointments: any[];
  onCreateAppointment: (appointment: any) => void;
  selectedTimezones: string[];
  primaryTimezone: string;
}

const CalendarPage = ({
  userEmail,
  appointments,
  onCreateAppointment,
  selectedTimezones,
  primaryTimezone,
}: CalendarPageProps) => {
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
    navigate('/calendar');
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
          <div className="max-w-4xl mx-auto">
            <Calendar 
              selectedTimezones={selectedTimezones}
              primaryTimezone={primaryTimezone}
              appointments={appointments}
              onDateClick={handleDateClick}
            />
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

export default CalendarPage;
