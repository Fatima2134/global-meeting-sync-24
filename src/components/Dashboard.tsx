import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import FunctionalSidebar from './FunctionalSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, Video, Users, Mail, Download } from 'lucide-react';

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
}: DashboardProps) => {
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

  const quickActions = [
    {
      title: 'Calendar',
      description: 'View and schedule meetings',
      icon: Calendar,
      onClick: () => navigate('/calendar'),
      color: 'bg-blue-500'
    },
    {
      title: 'World Clock',
      description: 'Check time across timezones',
      icon: Clock,
      onClick: () => navigate('/worldclock'),
      color: 'bg-green-500'
    },
    {
      title: 'Meetings',
      description: 'Manage upcoming meetings',
      icon: Video,
      onClick: () => navigate('/meetings'),
      color: 'bg-purple-500'
    },
    {
      title: 'Email Center',
      description: 'Send meeting invitations',
      icon: Mail,
      onClick: () => navigate('/email'),
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <FunctionalSidebar 
        onNavigateToMeetings={handleNavigateToMeetings}
        onCalendarClick={handleCalendarClick}
      />
      <div className="flex-1 flex flex-col overflow-hidden ml-48">
        <Header userEmail={userEmail} onLogout={handleLogout} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome to Global Meeting Sync
              </h1>
              <p className="text-gray-600">
                Manage your meetings across different timezones with ease
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Card 
                    key={action.title}
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={action.onClick}
                  >
                    <CardHeader className="pb-3">
                      <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mb-3`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle className="text-lg">{action.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-sm">{action.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {appointments.length > 0 ? (
                    <div className="space-y-3">
                      {appointments.slice(0, 3).map((appointment) => (
                        <div key={appointment.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                          <div>
                            <p className="font-medium text-gray-900">{appointment.title}</p>
                            <p className="text-sm text-gray-600">
                              {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                            </p>
                          </div>
                          <div className="text-xs text-gray-500">
                            {appointment.timezone}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No meetings scheduled</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Download className="h-5 w-5 mr-2" />
                    Quick Stats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Meetings</span>
                      <span className="font-semibold text-gray-900">{appointments.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">This Week</span>
                      <span className="font-semibold text-gray-900">
                        {appointments.filter(apt => {
                          const aptDate = new Date(apt.date);
                          const now = new Date();
                          const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                          return aptDate >= now && aptDate <= weekFromNow;
                        }).length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">This Month</span>
                      <span className="font-semibold text-gray-900">
                        {appointments.filter(apt => {
                          const aptDate = new Date(apt.date);
                          const now = new Date();
                          return aptDate.getMonth() === now.getMonth() && aptDate.getFullYear() === now.getFullYear();
                        }).length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
