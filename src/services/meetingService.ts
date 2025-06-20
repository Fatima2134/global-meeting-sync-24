
import { supabase } from '@/integrations/supabase/client'
import { Database } from '@/integrations/supabase/types'
import { emailService } from './emailService'

type Meeting = Database['public']['Tables']['meetings']['Row']
type MeetingInsert = Database['public']['Tables']['meetings']['Insert']
type MeetingUpdate = Database['public']['Tables']['meetings']['Update']

export const meetingService = {
  async getMeetings(userId: string) {
    const { data, error } = await supabase.rpc('get_meetings_with_attendees', {
      user_uuid: userId
    })
    
    if (error) {
      console.error('Error fetching meetings:', error)
      return []
    }
    
    return data || []
  },

  async createMeeting(meeting: Omit<MeetingInsert, 'creator_id'>, attendeeEmails: string[] = []) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // Create the meeting
    const { data: newMeeting, error: meetingError } = await supabase
      .from('meetings')
      .insert({
        ...meeting,
        creator_id: user.id
      })
      .select()
      .single()

    if (meetingError) {
      console.error('Error creating meeting:', meetingError)
      throw meetingError
    }

    // Add attendees if provided
    if (attendeeEmails.length > 0) {
      for (const email of attendeeEmails) {
        await this.addAttendee(newMeeting.id, email)
      }

      // Send email notifications
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', user.id)
          .single()

        const creatorEmail = profile?.email || user.email || ''
        
        await emailService.sendMeetingInvitation(newMeeting, attendeeEmails, creatorEmail)
      } catch (emailError) {
        console.error('Error sending meeting invitations:', emailError)
        // Don't throw here - meeting was created successfully, email is secondary
      }
    }

    return newMeeting
  },

  async updateMeeting(id: string, updates: MeetingUpdate) {
    const { data, error } = await supabase
      .from('meetings')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating meeting:', error)
      throw error
    }

    return data
  },

  async deleteMeeting(id: string) {
    const { error } = await supabase
      .from('meetings')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting meeting:', error)
      throw error
    }
  },

  async addAttendee(meetingId: string, email: string) {
    // Check if user exists
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single()

    const { error } = await supabase
      .from('meeting_attendees')
      .insert({
        meeting_id: meetingId,
        user_id: profile?.id || null,
        email: !profile ? email : null
      })

    if (error) {
      console.error('Error adding attendee:', error)
      throw error
    }
  }
}
