
import React from 'react';
import { Calendar, Clock, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FunctionalSidebarProps {
  onNavigateToMeetings: () => void;
  onCalendarClick: () => void;
}

const FunctionalSidebar: React.FC<FunctionalSidebarProps> = ({
  onNavigateToMeetings,
  onCalendarClick
}) => {
  return (
    <div className="fixed left-0 top-16 w-64 h-full bg-white border-r border-gray-200 shadow-sm">
      <div className="p-4">
        <nav className="space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-700 hover:bg-gray-100"
            onClick={onCalendarClick}
          >
            <Calendar className="mr-3 h-4 w-4" />
            Calendar
          </Button>
          
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-700 hover:bg-gray-100"
            onClick={onNavigateToMeetings}
          >
            <Video className="mr-3 h-4 w-4" />
            Upcoming Meetings
          </Button>
          
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-700 hover:bg-gray-100"
            onClick={() => {}}
          >
            <Clock className="mr-3 h-4 w-4" />
            World Clock
          </Button>
        </nav>
      </div>
    </div>
  );
};

export default FunctionalSidebar;
