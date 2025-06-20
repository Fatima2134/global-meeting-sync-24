
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import FunctionalSidebar from '../components/FunctionalSidebar';
import WorldClock from '../components/WorldClock';

interface WorldClockPageProps {
  userEmail: string;
  selectedTimezones: string[];
  primaryTimezone: string;
  onTimezoneChange: (timezones: string[], primary: string) => void;
}

const WorldClockPage = ({
  userEmail,
  selectedTimezones,
  primaryTimezone,
  onTimezoneChange,
}: WorldClockPageProps) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
  };

  const handleNavigateToMeetings = () => {
    navigate('/meetings');
  };

  const handleCalendarClick = () => {
    navigate('/calendar');
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
            <WorldClock 
              selectedTimezones={selectedTimezones}
              primaryTimezone={primaryTimezone}
              onTimezoneChange={onTimezoneChange}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default WorldClockPage;
