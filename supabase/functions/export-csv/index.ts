
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

function arrayToCSV(data: any[]): string {
  if (data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Handle null/undefined values and escape commas/quotes
        if (value === null || value === undefined) return '';
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(',')
    )
  ].join('\n');
  
  return csvContent;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const table = url.searchParams.get('table');
    
    if (!table) {
      return new Response(JSON.stringify({ error: 'Table parameter required' }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    let data;
    let filename;

    switch (table) {
      case 'meetings':
        const { data: meetings } = await supabase.from('meetings').select('*');
        data = meetings;
        filename = 'meetings.csv';
        break;
      case 'meeting_attendees':
        const { data: attendees } = await supabase.from('meeting_attendees').select('*');
        data = attendees;
        filename = 'meeting_attendees.csv';
        break;
      case 'profiles':
        const { data: profiles } = await supabase.from('profiles').select('*');
        data = profiles;
        filename = 'profiles.csv';
        break;
      case 'timezone_preferences':
        const { data: timezones } = await supabase.from('timezone_preferences').select('*');
        data = timezones;
        filename = 'timezone_preferences.csv';
        break;
      default:
        return new Response(JSON.stringify({ error: 'Invalid table name' }), {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
    }

    if (!data) {
      return new Response(JSON.stringify({ error: 'No data found' }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const csv = arrayToCSV(data);
    
    return new Response(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${filename}"`,
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Error exporting CSV:", error);
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
