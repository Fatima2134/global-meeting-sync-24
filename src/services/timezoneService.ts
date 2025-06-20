
import { supabase } from '@/integrations/supabase/client'

export const timezoneService = {
  async getTimezonePreferences(userId: string) {
    const { data, error } = await supabase
      .from('timezone_preferences')
      .select('*')
      .eq('user_id', userId)
      .order('is_primary', { ascending: false })

    if (error) {
      console.error('Error fetching timezone preferences:', error)
      return []
    }

    return data || []
  },

  async updateTimezonePreferences(userId: string, timezones: string[], primaryTimezone: string) {
    // Delete existing preferences
    await supabase
      .from('timezone_preferences')
      .delete()
      .eq('user_id', userId)

    // Insert new preferences
    const preferences = timezones.map(timezone => ({
      user_id: userId,
      timezone,
      is_primary: timezone === primaryTimezone
    }))

    const { error } = await supabase
      .from('timezone_preferences')
      .insert(preferences)

    if (error) {
      console.error('Error updating timezone preferences:', error)
      throw error
    }
  }
}
