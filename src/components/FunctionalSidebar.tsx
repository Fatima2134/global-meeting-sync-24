
import React from 'react';
import { Calendar, Clock, Video, Mail, Download, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';

interface FunctionalSidebarProps {
  onNavigateToMeetings: () => void;
  onCalendarClick: () => void;
}

const FunctionalSidebar: React.FC<FunctionalSidebarProps> = ({
  onNavigateToMeetings,
  onCalendarClick
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      icon: Calendar,
      label: 'Calendar',
      path: '/',
      onClick: onCalendarClick
    },
    {
      icon: Video,
      label: 'Meetings',
      path: '/meetings',
      onClick: onNavigateToMeetings
    },
    {
      icon: Mail,
      label: 'Email Center',
      path: '/email',
      onClick: () => navigate('/email')
    },
    {
      icon: Download,
      label: 'Export Data',
      path: '/export',
      onClick: () => navigate('/export')
    },
    {
      icon: Settings,
      label: 'Integrations',
      path: '/integrations',
      onClick: () => navigate('/integrations')
    }
  ];

  return (
    <div className="fixed left-0 top-16 w-64 h-full bg-white border-r border-gray-200 shadow-sm">
      <div className="p-4">
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Button
                key={item.path}
                variant="ghost"
                className={`w-full justify-start ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={item.onClick}
              >
                <Icon className="mr-3 h-4 w-4" />
                {item.label}
              </Button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default FunctionalSidebar;
