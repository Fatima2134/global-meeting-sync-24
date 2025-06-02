
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Users, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Header from './Header';

interface UpcomingMeetingsProps {
  userEmail: string;
  onLogout: () => void;
  appointments: any[];
}

const UpcomingMeetings: React.FC<UpcomingMeetingsProps> = ({ 
  userEmail, 
  onLogout, 
  appointments 
}) => {
  const navigate = useNavigate();

  // Filter meetings to only show future meetings
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const upcomingMeetings = appointments.filter(meeting => {
    const meetingDate = new Date(meeting.date);
    meetingDate.setHours(0, 0, 0, 0);
    return meetingDate >= today;
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (time: string, timezone: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    
    return date.toLocaleTimeString('en-US', {
      timeZone: timezone,
      hour12: true,
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCityName = (timezone: string) => {
    const cities = {
      'America/New_York': 'New York',
      'America/Los_Angeles': 'Los Angeles',
      'Europe/London': 'London',
      'Europe/Paris': 'Paris',
      'Asia/Tokyo': 'Tokyo',
      'Australia/Sydney': 'Sydney',
      'Asia/Kolkata': 'Mumbai',
      'Asia/Dubai': 'Dubai',
      'Asia/Singapore': 'Singapore',
      'Asia/Hong_Kong': 'Hong Kong',
      'Europe/Berlin': 'Berlin',
      'Europe/Moscow': 'Moscow',
      'America/Sao_Paulo': 'São Paulo',
      'America/Toronto': 'Toronto',
      'America/Chicago': 'Chicago',
    };
    return cities[timezone as keyof typeof cities] || timezone;
  };

  const handleJoinMeeting = () => {
    window.open('https://zoom.us/', '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header userEmail={userEmail} onLogout={onLogout} />
      
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Button
              onClick={() => navigate('/')}
              variant="ghost"
              className="mr-4 text-gray-700 hover:bg-gray-100"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Upcoming Meetings</h1>
          </div>
        </div>

        <div className="space-y-4">
          {upcomingMeetings.map(meeting => (
            <Card key={meeting.id} className="bg-white border border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-gray-900">
                  <span>{meeting.title}</span>
                  <Button
                    onClick={handleJoinMeeting}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Video className="h-4 w-4 mr-2" />
                    Join Meeting
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-700">
                      <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                      <span>{formatDate(meeting.date)}</span>
                    </div>
                    
                    <div className="flex items-center text-gray-700">
                      <Clock className="h-4 w-4 mr-2 text-blue-600" />
                      <span>
                        {formatTime(meeting.time, meeting.timezone)} 
                        ({getCityName(meeting.timezone)}) - {meeting.duration} min
                      </span>
                    </div>
                    
                    <div className="flex items-center text-gray-700">
                      <Users className="h-4 w-4 mr-2 text-blue-600" />
                      <span>{meeting.attendees.length} attendees</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Description</h4>
                      <p className="text-sm text-gray-600">{meeting.description || 'No description provided'}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Attendees</h4>
                      <div className="flex flex-wrap gap-1">
                        {meeting.attendees.map((email: string, index: number) => (
                          <span
                            key={index}
                            className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                          >
                            {email}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {upcomingMeetings.length === 0 && (
            <Card className="bg-white border border-gray-200">
              <CardContent className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming meetings</h3>
                <p className="text-gray-600 mb-4">
                  You don't have any scheduled meetings at the moment.
                </p>
                <Button
                  onClick={() => navigate('/')}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Schedule a Meeting
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpcomingMeetings;
