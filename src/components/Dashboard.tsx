
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from './Header';
import Sidebar from './Sidebar';
import WorldClock from './WorldClock';
import Calendar from './Calendar';
import AppointmentModal from './AppointmentModal';

interface DashboardProps {
  userEmail: string;
  onLogout: () => void;
  appointments: any[];
  onCreateAppointment: (appointment: any) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  userEmail, 
  onLogout, 
  appointments, 
  onCreateAppointment 
}) => {
  const [selectedTimezones, setSelectedTimezones] = useState<string[]>(['America/New_York']);
  const [primaryTimezone, setPrimaryTimezone] = useState('America/New_York');
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const navigate = useNavigate();

  const handleTimezoneChange = (timezones: string[], primary: string) => {
    setSelectedTimezones(timezones);
    setPrimaryTimezone(primary);
  };

  const handleDateClick = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    
    // Prevent scheduling on past dates
    if (date < today) {
      return;
    }
    
    setSelectedDate(date);
    setShowAppointmentModal(true);
  };

  const handleCreateAppointment = (appointment: any) => {
    onCreateAppointment(appointment);
    setShowAppointmentModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header userEmail={userEmail} onLogout={onLogout} />
      
      <div className="flex">
        <Sidebar onNavigateToMeetings={() => navigate('/meetings')} />
        
        <main className="flex-1 p-6 ml-64">
          <div className="max-w-7xl mx-auto">
            <Tabs defaultValue="worldclock" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 bg-white">
                <TabsTrigger 
                  value="worldclock" 
                  className="text-gray-700 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
                >
                  World Clock
                </TabsTrigger>
                <TabsTrigger 
                  value="calendar" 
                  className="text-gray-700 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
                >
                  Calendar
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="worldclock">
                <WorldClock 
                  selectedTimezones={selectedTimezones}
                  onTimezoneChange={handleTimezoneChange}
                  primaryTimezone={primaryTimezone}
                />
              </TabsContent>
              
              <TabsContent value="calendar">
                <Calendar
                  selectedTimezones={selectedTimezones}
                  primaryTimezone={primaryTimezone}
                  appointments={appointments}
                  onDateClick={handleDateClick}
                />
              </TabsContent>
            </Tabs>
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
