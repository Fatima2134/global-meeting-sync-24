
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import FunctionalSidebar from './FunctionalSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Send, Users } from 'lucide-react';
import { emailService } from '@/services/emailService';
import { useToast } from '@/hooks/use-toast';

interface EmailPageProps {
  userEmail: string;
}

const EmailPage = ({ userEmail }: EmailPageProps) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [recipients, setRecipients] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleLogout = async () => {
    await signOut();
  };

  const handleNavigateToMeetings = () => {
    navigate('/meetings');
  };

  const handleCalendarClick = () => {
    navigate('/');
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);

    try {
      const recipientList = recipients.split(',').map(email => email.trim()).filter(email => email);
      
      if (recipientList.length === 0) {
        toast({
          title: 'Error',
          description: 'Please enter at least one recipient email address.',
          variant: 'destructive',
        });
        return;
      }

      // Create a mock meeting object for the email service
      const mockMeeting = {
        id: 'manual-email-' + Date.now(),
        title: subject,
        description: message,
        meeting_date: new Date().toISOString().split('T')[0],
        meeting_time: new Date().toTimeString().split(' ')[0],
        duration: 60,
        timezone: 'America/New_York'
      };

      await emailService.sendMeetingInvitation(mockMeeting, recipientList, userEmail);

      toast({
        title: 'Success',
        description: `Email sent to ${recipientList.length} recipient(s)!`,
      });

      // Reset form
      setRecipients('');
      setSubject('');
      setMessage('');
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: 'Error',
        description: 'Failed to send email. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
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
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Mail className="h-6 w-6 mr-2" />
                Email Center
              </h1>
              <p className="text-gray-600">Send emails to meeting participants</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Send className="h-5 w-5 mr-2" />
                  Compose Email
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSendEmail} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Recipients (comma-separated email addresses)
                    </label>
                    <Input
                      type="text"
                      value={recipients}
                      onChange={(e) => setRecipients(e.target.value)}
                      placeholder="email1@example.com, email2@example.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject
                    </label>
                    <Input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Email subject"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message
                    </label>
                    <Textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Email message content"
                      rows={6}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={sending}
                    className="w-full"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {sending ? 'Sending...' : 'Send Email'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Email Templates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSubject('Meeting Reminder');
                      setMessage('This is a friendly reminder about our upcoming meeting. Please make sure to join on time. Looking forward to our discussion!');
                    }}
                  >
                    Meeting Reminder Template
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSubject('Meeting Follow-up');
                      setMessage('Thank you for attending our meeting. Please find attached the meeting notes and action items. Let me know if you have any questions.');
                    }}
                  >
                    Follow-up Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default EmailPage;
