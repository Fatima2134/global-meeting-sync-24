
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MeetingEmailRequest {
  meeting: {
    id: string;
    title: string;
    description: string;
    meeting_date: string;
    meeting_time: string;
    duration: number;
    timezone: string;
    meeting_url?: string;
  };
  attendees: string[];
  creator_email: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { meeting, attendees, creator_email }: MeetingEmailRequest = await req.json();

    const meetingDateTime = new Date(`${meeting.meeting_date}T${meeting.meeting_time}`);
    const formattedDate = meetingDateTime.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const formattedTime = meetingDateTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Meeting Invitation: ${meeting.title}</h2>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #495057;">Meeting Details</h3>
          <p><strong>Date:</strong> ${formattedDate}</p>
          <p><strong>Time:</strong> ${formattedTime} (${meeting.timezone})</p>
          <p><strong>Duration:</strong> ${meeting.duration} minutes</p>
          ${meeting.description ? `<p><strong>Description:</strong> ${meeting.description}</p>` : ''}
        </div>

        ${meeting.meeting_url ? `
          <div style="margin: 20px 0;">
            <a href="${meeting.meeting_url}" 
               style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Join Meeting
            </a>
          </div>
        ` : ''}

        <div style="margin: 30px 0;">
          <h4>Add to Calendar:</h4>
          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <a href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(meeting.title)}&dates=${meetingDateTime.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${new Date(meetingDateTime.getTime() + meeting.duration * 60000).toISOString().replace(/[-:]/g, '').split('.')[0]}Z&details=${encodeURIComponent(meeting.description || '')}" 
               style="background: #4285f4; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px; font-size: 14px;">
              Google Calendar
            </a>
            <a href="https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(meeting.title)}&startdt=${meetingDateTime.toISOString()}&enddt=${new Date(meetingDateTime.getTime() + meeting.duration * 60000).toISOString()}&body=${encodeURIComponent(meeting.description || '')}" 
               style="background: #0078d4; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px; font-size: 14px;">
              Outlook
            </a>
          </div>
        </div>

        <p style="color: #6c757d; font-size: 14px; margin-top: 30px;">
          This meeting was created by ${creator_email}. 
          <br>Meeting ID: ${meeting.id}
        </p>
      </div>
    `;

    // Send emails to all attendees
    const emailPromises = attendees.map(email => 
      resend.emails.send({
        from: "Meeting Scheduler <noreply@resend.dev>",
        to: [email],
        subject: `Meeting Invitation: ${meeting.title}`,
        html: emailHtml,
      })
    );

    const results = await Promise.allSettled(emailPromises);
    console.log("Email sending results:", results);

    return new Response(JSON.stringify({ 
      success: true, 
      sent: results.filter(r => r.status === 'fulfilled').length,
      failed: results.filter(r => r.status === 'rejected').length 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error sending meeting emails:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
