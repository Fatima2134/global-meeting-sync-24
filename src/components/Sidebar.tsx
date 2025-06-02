
import React from 'react';
import { Calendar, Clock, Video, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  onNavigateToMeetings: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onNavigateToMeetings }) => {
  const handleZoomAccess = () => {
    window.open('https://zoom.us/', '_blank');
  };

  return (
    <aside className="fixed left-0 top-16 h-full w-64 bg-white border-r border-gray-200 p-4">
      <nav className="space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-700 hover:bg-blue-50 hover:text-blue-700"
        >
          <Calendar className="mr-3 h-4 w-4" />
          Calendar
        </Button>
        
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-700 hover:bg-blue-50 hover:text-blue-700"
        >
          <Clock className="mr-3 h-4 w-4" />
          World Clock
        </Button>
        
        <Button
          onClick={onNavigateToMeetings}
          variant="ghost"
          className="w-full justify-start text-gray-700 hover:bg-blue-50 hover:text-blue-700"
        >
          <Users className="mr-3 h-4 w-4" />
          Upcoming Meetings
        </Button>
        
        <div className="pt-4 border-t border-gray-200">
          <Button
            onClick={handleZoomAccess}
            variant="outline"
            className="w-full justify-start text-blue-600 border-blue-200 hover:bg-blue-50"
          >
            <Video className="mr-3 h-4 w-4" />
            Access Zoom
          </Button>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
