
import { supabase } from '@/integrations/supabase/client';

export const emailService = {
  async sendMeetingInvitation(meeting: any, attendees: string[], creatorEmail: string) {
    try {
      const { data, error } = await supabase.functions.invoke('send-meeting-email', {
        body: {
          meeting,
          attendees,
          creator_email: creatorEmail
        }
      });

      if (error) {
        console.error('Error sending meeting emails:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Email service error:', error);
      throw error;
    }
  }
};
