
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import FunctionalSidebar from './FunctionalSidebar';
import EditAppointmentModal from './EditAppointmentModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Users, ExternalLink, Edit, Trash2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface UpcomingMeetingsProps {
  userEmail: string;
  appointments: any[];
  onUpdateAppointment: (id: string, appointment: any) => void;
  onDeleteAppointment: (id: string) => void;
}

const UpcomingMeetings = ({
  userEmail,
  appointments,
  onUpdateAppointment,
  onDeleteAppointment,
}: UpcomingMeetingsProps) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [editingAppointment, setEditingAppointment] = useState<any>(null);

  const handleLogout = async () => {
    await signOut();
  };

  const handleNavigateToMeetings = () => {
    // Already on meetings page
  };

  const handleCalendarClick = () => {
    navigate('/');
  };

  const upcomingAppointments = appointments
    .filter(apt => new Date(`${apt.date} ${apt.time}`) >= new Date())
    .sort((a, b) => new Date(`${a.date} ${a.time}`).getTime() - new Date(`${b.date} ${b.time}`).getTime());

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Upcoming Meetings</h1>
              <p className="text-gray-600">Manage your scheduled meetings</p>
            </div>

            <div className="space-y-4">
              {upcomingAppointments.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming meetings</h3>
                    <p className="text-gray-600">You don't have any meetings scheduled.</p>
                  </CardContent>
                </Card>
              ) : (
                upcomingAppointments.map((appointment) => (
                  <Card key={appointment.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{appointment.title}</CardTitle>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(appointment.status || 'scheduled')}>
                            {appointment.status || 'scheduled'}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingAppointment(appointment)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onDeleteAppointment(appointment.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {appointment.description && (
                          <p className="text-gray-600">{appointment.description}</p>
                        )}
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{format(parseISO(appointment.date), 'MMMM d, yyyy')}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{appointment.time} ({appointment.duration} min)</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span>{appointment.timezone}</span>
                          </div>
                        </div>

                        {appointment.attendees && appointment.attendees.length > 0 && (
                          <div className="flex items-center space-x-1 text-sm text-gray-600">
                            <Users className="h-4 w-4" />
                            <span>{appointment.attendees.length} attendees</span>
                          </div>
                        )}

                        {appointment.meetingUrl && (
                          <div className="pt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(appointment.meetingUrl, '_blank')}
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Join Meeting
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </main>
      </div>

      {editingAppointment && (
        <EditAppointmentModal
          appointment={editingAppointment}
          onClose={() => setEditingAppointment(null)}
          onUpdateAppointment={(updatedAppointment) => {
            onUpdateAppointment(editingAppointment.id, updatedAppointment);
            setEditingAppointment(null);
          }}
        />
      )}
    </div>
  );
};

export default UpcomingMeetings;
