
import React from 'react';
import { Mail } from 'lucide-react';

const EmailPageHeader = () => {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center">
        <Mail className="h-6 w-6 mr-2" />
        Email Center
      </h1>
      <p className="text-gray-600">Send emails to meeting participants</p>
    </div>
  );
};

export default EmailPageHeader;
