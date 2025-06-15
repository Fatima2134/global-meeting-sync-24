
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from './Header';
import FunctionalSidebar from './FunctionalSidebar';
import WorldClock from './WorldClock';
import Calendar from './Calendar';
import AppointmentModal from './AppointmentModal';

interface DashboardProps {
  userEmail: string;
  onLogout: () => void;
  appointments: any[];
  onCreateAppointment: (appointment: any) => void;
  selectedTimezones: string[];
  primaryTimezone: string;
  onTimezoneChange: (timezones: string[], primary: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  userEmail, 
  onLogout, 
  appointments, 
  onCreateAppointment,
  selectedTimezones,
  primaryTimezone,
  onTimezoneChange
}) => {
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState('worldclock');
  const navigate = useNavigate();

  const handleDateClick = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    
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

  const handleSidebarCalendarClick = () => {
    setActiveTab('calendar');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header userEmail={userEmail} onLogout={onLogout} />
      
      <div className="flex">
        <FunctionalSidebar 
          onNavigateToMeetings={() => navigate('/meetings')} 
          onCalendarClick={handleSidebarCalendarClick}
        />
        
        <main className="flex-1 p-6 ml-64">
          <div className="max-w-7xl mx-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
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
                  onTimezoneChange={onTimezoneChange}
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
