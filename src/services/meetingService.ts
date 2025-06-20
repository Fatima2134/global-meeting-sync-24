
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

    console.log('Creating meeting:', meeting, 'with attendees:', attendeeEmails)

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

    console.log('Meeting created successfully:', newMeeting)

    // Add attendees if provided
    if (attendeeEmails.length > 0) {
      const attendeePromises = attendeeEmails.map(email => 
        this.addAttendee(newMeeting.id, email.trim())
      )
      
      try {
        await Promise.all(attendeePromises)
        console.log('All attendees added successfully')
      } catch (attendeeError) {
        console.error('Error adding some attendees:', attendeeError)
        // Continue even if some attendees fail to be added
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
        console.log('Meeting invitations sent successfully')
      } catch (emailError) {
        console.error('Error sending meeting invitations:', emailError)
        // Don't throw here - meeting was created successfully, email is secondary
      }
    }

    return newMeeting
  },

  async updateMeeting(id: string, updates: MeetingUpdate) {
    console.log('Updating meeting:', id, updates)
    
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

    console.log('Meeting updated successfully:', data)
    return data
  },

  async deleteMeeting(id: string) {
    console.log('Deleting meeting:', id)
    
    const { error } = await supabase
      .from('meetings')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting meeting:', error)
      throw error
    }

    console.log('Meeting deleted successfully')
  },

  async addAttendee(meetingId: string, email: string) {
    if (!email || !email.trim()) {
      console.warn('Empty email provided, skipping attendee')
      return
    }

    const trimmedEmail = email.trim()
    console.log('Adding attendee:', trimmedEmail, 'to meeting:', meetingId)

    // Check if user exists
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', trimmedEmail)
      .single()

    const { error } = await supabase
      .from('meeting_attendees')
      .insert({
        meeting_id: meetingId,
        user_id: profile?.id || null,
        email: !profile ? trimmedEmail : null
      })

    if (error) {
      console.error('Error adding attendee:', error)
      throw error
    }

    console.log('Attendee added successfully:', trimmedEmail)
  }
}
