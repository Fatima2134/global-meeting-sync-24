
import React from 'react';
import { LogOut, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  userEmail: string;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ userEmail, onLogout }) => {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Globe className="h-8 w-8 text-blue-600 mr-3" />
          <h1 className="text-2xl font-bold text-gray-900">GlobalMeet</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">Welcome, {userEmail}</span>
          <Button
            onClick={onLogout}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2 text-gray-700 border-gray-300 hover:bg-gray-50"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
