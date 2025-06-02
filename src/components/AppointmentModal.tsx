
import React, { useState } from 'react';
import { X, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AppointmentModalProps {
  date: Date;
  primaryTimezone: string;
  selectedTimezones: string[];
  onClose: () => void;
  onCreateAppointment: (appointment: any) => void;
}

const AppointmentModal: React.FC<AppointmentModalProps> = ({
  date,
  primaryTimezone,
  selectedTimezones,
  onClose,
  onCreateAppointment
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [time, setTime] = useState('09:00');
  const [duration, setDuration] = useState('60');
  const [attendees, setAttendees] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const appointment = {
      title,
      description,
      date: date.toISOString().split('T')[0],
      time,
      duration: parseInt(duration),
      attendees: attendees.split(',').map(email => email.trim()),
      timezone: primaryTimezone,
      allTimezones: selectedTimezones
    };

    onCreateAppointment(appointment);
  };

  const getTimeInTimezone = (time: string, timezone: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const appointmentDate = new Date(date);
    appointmentDate.setHours(hours, minutes, 0, 0);
    
    return appointmentDate.toLocaleTimeString('en-US', {
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Schedule Meeting</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Meeting Title *
            </label>
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter meeting title"
              className="text-gray-900 bg-white border-gray-300"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Description
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Meeting description or agenda"
              className="text-gray-900 bg-white border-gray-300"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Date
              </label>
              <Input
                type="text"
                value={date.toLocaleDateString()}
                readOnly
                className="text-gray-900 bg-gray-50 border-gray-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Time (in {getCityName(primaryTimezone)})
              </label>
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="text-gray-900 bg-white border-gray-300"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Duration
            </label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger className="bg-white text-gray-900 border-gray-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="30" className="text-gray-900">30 minutes</SelectItem>
                <SelectItem value="60" className="text-gray-900">1 hour</SelectItem>
                <SelectItem value="90" className="text-gray-900">1.5 hours</SelectItem>
                <SelectItem value="120" className="text-gray-900">2 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Attendees (email addresses, comma-separated)
            </label>
            <Input
              type="text"
              value={attendees}
              onChange={(e) => setAttendees(e.target.value)}
              placeholder="email1@example.com, email2@example.com"
              className="text-gray-900 bg-white border-gray-300"
            />
          </div>

          {selectedTimezones.length > 1 && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                <Clock className="h-4 w-4 mr-2 text-blue-600" />
                Meeting Times Across Time Zones
              </h3>
              <div className="space-y-1">
                {selectedTimezones.map(timezone => (
                  <div key={timezone} className="flex justify-between text-sm">
                    <span className="text-gray-700">{getCityName(timezone)}</span>
                    <span className="font-mono text-gray-900">
                      {getTimeInTimezone(time, timezone)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="text-gray-700 border-gray-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Create Meeting
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppointmentModal;
