
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import FunctionalSidebar from './FunctionalSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Database, FileText, Users, Calendar, Clock } from 'lucide-react';
import { exportService } from '@/services/exportService';
import { useToast } from '@/hooks/use-toast';

interface ExportPageProps {
  userEmail: string;
}

const ExportPage = ({ userEmail }: ExportPageProps) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    await signOut();
  };

  const handleNavigateToMeetings = () => {
    navigate('/meetings');
  };

  const handleCalendarClick = () => {
    navigate('/');
  };

  const handleExport = async (tableName: string) => {
    try {
      await exportService.exportTable(tableName);
      toast({
        title: 'Success',
        description: `${tableName} data exported successfully!`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Error',
        description: `Failed to export ${tableName} data. Please try again.`,
        variant: 'destructive',
      });
    }
  };

  const tables = [
    {
      name: 'meetings',
      icon: Calendar,
      title: 'Meetings',
      description: 'Export all meeting data including titles, dates, times, and descriptions'
    },
    {
      name: 'meeting_attendees',
      icon: Users,
      title: 'Meeting Attendees',
      description: 'Export attendee information and their meeting associations'
    },
    {
      name: 'profiles',
      icon: FileText,
      title: 'User Profiles',
      description: 'Export user profile information and preferences'
    },
    {
      name: 'timezone_preferences',
      icon: Clock,
      title: 'Timezone Preferences',
      description: 'Export user timezone settings and preferences'
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
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Database className="h-6 w-6 mr-2" />
                Data Export Center
              </h1>
              <p className="text-gray-600">Export your data as CSV files for backup or analysis</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tables.map((table) => {
                const Icon = table.icon;
                return (
                  <Card key={table.name} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Icon className="h-5 w-5 mr-2" />
                        {table.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4">{table.description}</p>
                      <Button
                        onClick={() => handleExport(table.name)}
                        className="w-full"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export {table.title}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Export Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-gray-600">
                  <p>• CSV files are compatible with Excel, Google Sheets, and other spreadsheet applications</p>
                  <p>• Exported data includes all records you have access to</p>
                  <p>• Files are generated in real-time with the most current data</p>
                  <p>• All sensitive information is included, so please handle exported files securely</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ExportPage;
