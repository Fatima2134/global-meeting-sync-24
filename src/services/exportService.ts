
import { supabase } from '@/integrations/supabase/client';

export const exportService = {
  async exportTable(tableName: string) {
    try {
      const { data, error } = await supabase.functions.invoke('export-csv', {
        body: {
          table_name: tableName
        }
      });

      if (error) {
        console.error('Error exporting table:', error);
        throw error;
      }

      // Create and download CSV file
      const blob = new Blob([data.csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${tableName}_export.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      return data;
    } catch (error) {
      console.error('Export service error:', error);
      throw error;
    }
  }
};
