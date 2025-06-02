
import React from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface CalendarProps {
  selectedTimezones: string[];
  primaryTimezone: string;
  appointments: any[];
  onDateClick: (date: Date) => void;
}

const HOLIDAYS = {
  'America/New_York': ['2024-01-01', '2024-07-04', '2024-12-25'],
  'Europe/London': ['2024-01-01', '2024-12-25', '2024-12-26'],
  'Asia/Tokyo': ['2024-01-01', '2024-01-08', '2024-12-31'],
  'Asia/Kolkata': ['2024-01-26', '2024-08-15', '2024-10-02'],
};

const Calendar: React.FC<CalendarProps> = ({ 
  selectedTimezones, 
  primaryTimezone, 
  appointments,
  onDateClick 
}) => {
  const [currentDate, setCurrentDate] = React.useState(new Date());

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isHoliday = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return selectedTimezones.some(timezone => 
      HOLIDAYS[timezone as keyof typeof HOLIDAYS]?.includes(dateStr)
    );
  };

  const getWorkingHoursOverlap = (date: Date) => {
    // Simplified: returns true if there's overlap between 9 AM - 5 PM across timezones
    return selectedTimezones.length > 0;
  };

  const hasAppointment = (date: Date) => {
    return appointments.some(apt => 
      new Date(apt.date).toDateString() === date.toDateString()
    );
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const renderCalendarDay = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const isToday = date.toDateString() === new Date().toDateString();
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const hasHoliday = isHoliday(date);
    const hasOverlap = getWorkingHoursOverlap(date);
    const hasApt = hasAppointment(date);

    return (
      <button
        key={day}
        onClick={() => onDateClick(date)}
        disabled={hasHoliday}
        className={`
          h-12 w-full rounded-lg border text-sm font-medium transition-colors
          ${isToday ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200'}
          ${hasHoliday ? 'bg-red-100 text-red-400 cursor-not-allowed' : 'hover:bg-gray-50'}
          ${isWeekend && !hasHoliday ? 'bg-gray-100 text-gray-600' : ''}
          ${hasApt ? 'bg-green-100 text-green-700 border-green-300' : ''}
          ${!hasHoliday ? 'text-gray-900' : ''}
        `}
      >
        <div className="flex flex-col items-center">
          <span>{day}</span>
          {hasApt && <div className="w-1 h-1 bg-green-500 rounded-full mt-1"></div>}
          {hasHoliday && <div className="w-1 h-1 bg-red-500 rounded-full mt-1"></div>}
        </div>
      </button>
    );
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDayOfMonth = getFirstDayOfMonth(currentDate);
  const calendarDays = [];

  // Empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(<div key={`empty-${i}`} />);
  }

  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(renderCalendarDay(day));
  }

  return (
    <Card className="bg-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-gray-900">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => navigateMonth('prev')}
              variant="outline"
              size="sm"
              className="text-gray-700 border-gray-300"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => navigateMonth('next')}
              variant="outline"
              size="sm"
              className="text-gray-700 border-gray-300"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="text-sm text-gray-600">
          Primary timezone: {primaryTimezone.replace('_', ' ')}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="h-8 flex items-center justify-center text-sm font-medium text-gray-600">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {calendarDays}
        </div>
        <div className="mt-4 flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-100 border border-green-300 rounded mr-2"></div>
              <span>Has Meeting</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-100 border border-red-300 rounded mr-2"></div>
              <span>Holiday</span>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            Click any available date to schedule a meeting
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Calendar;
