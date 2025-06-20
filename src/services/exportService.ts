
import { supabase } from '@/integrations/supabase/client';

export const exportService = {
  async exportTableAsCSV(tableName: string) {
    try {
      const { data, error } = await supabase.functions.invoke('export-csv', {
        body: {},
        // Pass table name as query parameter
      });

      if (error) {
        console.error('Error exporting CSV:', error);
        throw error;
      }

      // Create download link
      const url = `${supabase.supabaseUrl}/functions/v1/export-csv?table=${tableName}`;
      const link = document.createElement('a');
      link.href = url;
      link.download = `${tableName}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      return data;
    } catch (error) {
      console.error('Export service error:', error);
      throw error;
    }
  }
};
