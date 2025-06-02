
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import WorldClock from './WorldClock';
import Calendar from './Calendar';
import AppointmentModal from './AppointmentModal';

interface DashboardProps {
  userEmail: string;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ userEmail, onLogout }) => {
  const [selectedTimezones, setSelectedTimezones] = useState<string[]>(['America/New_York']);
  const [primaryTimezone, setPrimaryTimezone] = useState('America/New_York');
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const navigate = useNavigate();

  const handleTimezoneChange = (timezones: string[], primary: string) => {
    setSelectedTimezones(timezones);
    setPrimaryTimezone(primary);
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setShowAppointmentModal(true);
  };

  const handleCreateAppointment = (appointment: any) => {
    setAppointments([...appointments, { ...appointment, id: Date.now() }]);
    setShowAppointmentModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header userEmail={userEmail} onLogout={onLogout} />
      
      <div className="flex">
        <Sidebar onNavigateToMeetings={() => navigate('/meetings')} />
        
        <main className="flex-1 p-6 ml-64">
          <div className="max-w-7xl mx-auto space-y-6">
            <WorldClock 
              selectedTimezones={selectedTimezones}
              onTimezoneChange={handleTimezoneChange}
              primaryTimezone={primaryTimezone}
            />
            
            <Calendar
              selectedTimezones={selectedTimezones}
              primaryTimezone={primaryTimezone}
              appointments={appointments}
              onDateClick={handleDateClick}
            />
          </div>
        </main>
      </div>

      {showAppointmentModal && selectedDate && (
        <AppointmentModal
          date={selectedDate}
          primaryTimezone={primaryTimezone}
          selectedTimezones={selectedTimezones}
          onClose={() => setShowAppointmentModal(false)}
          onCreateAppointment={handleCreateAppointment}
        />
      )}
    </div>
  );
};

export default Dashboard;
