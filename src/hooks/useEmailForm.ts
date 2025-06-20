
import { useState } from 'react';
import { emailService } from '@/services/emailService';
import { useToast } from '@/hooks/use-toast';

export const useEmailForm = (userEmail: string) => {
  const { toast } = useToast();
  const [recipients, setRecipients] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

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

  const setTemplate = (templateSubject: string, templateMessage: string) => {
    setSubject(templateSubject);
    setMessage(templateMessage);
  };

  return {
    recipients,
    setRecipients,
    subject,
    setSubject,
    message,
    setMessage,
    sending,
    handleSendEmail,
    setTemplate
  };
};
