
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface CalendarProps {
  selectedTimezones: string[];
  primaryTimezone: string;
  appointments: any[];
  onDateClick: (date: Date) => void;
}

const HOLIDAYS = {
  'America/New_York': ['2024-01-01', '2024-07-04', '2024-12-25', '2025-01-01', '2025-07-04', '2025-12-25'],
  'America/Los_Angeles': ['2024-01-01', '2024-07-04', '2024-12-25', '2025-01-01', '2025-07-04', '2025-12-25'],
  'America/Chicago': ['2024-01-01', '2024-07-04', '2024-12-25', '2025-01-01', '2025-07-04', '2025-12-25'],
  'Europe/London': ['2024-01-01', '2024-12-25', '2024-12-26', '2025-01-01', '2025-12-25', '2025-12-26'],
  'Europe/Paris': ['2024-01-01', '2024-05-01', '2024-12-25', '2025-01-01', '2025-05-01', '2025-12-25'],
  'Asia/Tokyo': ['2024-01-01', '2024-01-08', '2024-12-31', '2025-01-01', '2025-01-13', '2025-12-31'],
  'Asia/Kolkata': ['2024-01-26', '2024-08-15', '2024-10-02', '2025-01-26', '2025-08-15', '2025-10-02'],
  'Asia/Shanghai': ['2024-01-01', '2024-10-01', '2025-01-01', '2025-10-01'],
} as const;

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
    return selectedTimezones.some(timezone => {
      const holidays = HOLIDAYS[timezone as keyof typeof HOLIDAYS];
      return holidays?.includes(dateStr);
    });
  };

  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    return date < today;
  };

  const getWorkingHoursOverlap = (date: Date) => {
    if (selectedTimezones.length === 1) return true;
    
    // Check if there's overlap between 9 AM - 5 PM across all selected timezones
    const workingStart = 9; // 9 AM
    const workingEnd = 17; // 5 PM
    
    let overlapStart = -1;
    let overlapEnd = 24;
    
    for (const timezone of selectedTimezones) {
      // Get the time difference from UTC for each timezone
      const testDate = new Date(date);
      testDate.setHours(12, 0, 0, 0); // noon
      
      const utcTime = testDate.getTime();
      const timezoneTime = new Date(testDate.toLocaleString('en-US', { timeZone: timezone }));
      const offset = (utcTime - timezoneTime.getTime()) / (1000 * 60 * 60);
      
      const localWorkingStart = workingStart + offset;
      const localWorkingEnd = workingEnd + offset;
      
      if (overlapStart === -1) {
        overlapStart = localWorkingStart;
        overlapEnd = localWorkingEnd;
      } else {
        overlapStart = Math.max(overlapStart, localWorkingStart);
        overlapEnd = Math.min(overlapEnd, localWorkingEnd);
      }
    }
    
    return overlapStart < overlapEnd;
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
    const isPast = isPastDate(date);
    const hasOverlap = getWorkingHoursOverlap(date);
    const hasApt = hasAppointment(date);
    const isDisabled = hasHoliday || isPast;

    return (
      <button
        key={day}
        onClick={() => !isDisabled && onDateClick(date)}
        disabled={isDisabled}
        className={`
          h-12 w-full rounded-lg border text-sm font-medium transition-colors
          ${isToday ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200'}
          ${isDisabled ? 'bg-red-100 text-red-400 cursor-not-allowed' : 'hover:bg-gray-50'}
          ${isWeekend && !isDisabled ? 'bg-gray-100 text-gray-600' : ''}
          ${hasApt ? 'bg-green-100 text-green-700 border-green-300' : ''}
          ${!isDisabled ? 'text-gray-900' : ''}
          ${!hasOverlap && !isDisabled ? 'opacity-50' : ''}
        `}
      >
        <div className="flex flex-col items-center">
          <span>{day}</span>
          {hasApt && <div className="w-1 h-1 bg-green-500 rounded-full mt-1"></div>}
          {hasHoliday && <div className="w-1 h-1 bg-red-500 rounded-full mt-1"></div>}
          {!hasOverlap && !isDisabled && <div className="w-1 h-1 bg-orange-500 rounded-full mt-1"></div>}
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
              <span>Holiday/Past</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-orange-100 border border-orange-300 rounded mr-2"></div>
              <span>Limited Working Hours</span>
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
