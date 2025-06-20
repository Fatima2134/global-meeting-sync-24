
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import FunctionalSidebar from './FunctionalSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Video, Calendar, Mail } from 'lucide-react';

interface IntegrationsPageProps {
  userEmail: string;
}

const IntegrationsPage = ({ userEmail }: IntegrationsPageProps) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
  };

  const handleNavigateToMeetings = () => {
    navigate('/meetings');
  };

  const handleCalendarClick = () => {
    navigate('/');
  };

  const integrations = [
    {
      name: 'Zoom',
      icon: Video,
      description: 'Create and manage Zoom meetings directly from your calendar',
      url: 'https://zoom.us/signin',
      color: 'bg-blue-500'
    },
    {
      name: 'Google Calendar',
      icon: Calendar,
      description: 'Sync your meetings with Google Calendar',
      url: 'https://calendar.google.com',
      color: 'bg-green-500'
    },
    {
      name: 'Outlook Calendar',
      icon: Calendar,
      description: 'Connect with Microsoft Outlook Calendar',
      url: 'https://outlook.live.com/calendar',
      color: 'bg-blue-600'
    },
    {
      name: 'Gmail',
      icon: Mail,
      description: 'Send meeting invitations through Gmail',
      url: 'https://mail.google.com',
      color: 'bg-red-500'
    }
  ];

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
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Integrations</h1>
              <p className="text-gray-600">Connect with your favorite calendar and meeting tools</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {integrations.map((integration) => {
                const Icon = integration.icon;
                return (
                  <Card key={integration.name} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <div className={`${integration.color} p-2 rounded-lg mr-3`}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        {integration.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4">{integration.description}</p>
                      <Button
                        onClick={() => window.open(integration.url, '_blank')}
                        className="w-full"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Connect to {integration.name}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Quick Calendar Links</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  <Button
                    variant="outline"
                    onClick={() => window.open('https://zoom.us/profile/setting', '_blank')}
                  >
                    <Video className="h-4 w-4 mr-2" />
                    Zoom Settings
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => window.open('https://calendar.google.com/calendar/u/0/r/settings', '_blank')}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Google Calendar Settings
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => window.open('https://outlook.live.com/calendar/0/options/calendar/SharedCalendars', '_blank')}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Outlook Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default IntegrationsPage;
