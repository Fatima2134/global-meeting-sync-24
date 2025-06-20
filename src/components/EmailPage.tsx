
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import FunctionalSidebar from './FunctionalSidebar';
import EmailPageHeader from './EmailPageHeader';
import EmailForm from './EmailForm';
import EmailTemplates from './EmailTemplates';
import { useEmailForm } from '@/hooks/useEmailForm';

interface EmailPageProps {
  userEmail: string;
}

const EmailPage = ({ userEmail }: EmailPageProps) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const {
    recipients,
    setRecipients,
    subject,
    setSubject,
    message,
    setMessage,
    sending,
    handleSendEmail,
    setTemplate
  } = useEmailForm(userEmail);

  const handleLogout = async () => {
    await signOut();
  };

  const handleNavigateToMeetings = () => {
    navigate('/meetings');
  };

  const handleCalendarClick = () => {
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <FunctionalSidebar 
        onNavigateToMeetings={handleNavigateToMeetings}
        onCalendarClick={handleCalendarClick}
      />
      <div className="flex-1 flex flex-col overflow-hidden ml-48">
        <Header userEmail={userEmail} onLogout={handleLogout} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-4xl mx-auto">
            <EmailPageHeader />
            
            <EmailForm
              recipients={recipients}
              setRecipients={setRecipients}
              subject={subject}
              setSubject={setSubject}
              message={message}
              setMessage={setMessage}
              sending={sending}
              onSubmit={handleSendEmail}
            />

            <EmailTemplates onTemplateSelect={setTemplate} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default EmailPage;
