
# Supabase Integration Documentation for GlobalMeet

## Overview

GlobalMeet is integrated with Supabase to provide backend services including authentication, database management, and real-time features for the meeting scheduling application.

## Project Configuration

- **Project ID**: `mdjhaeygzdpywzrwnacx`
- **Project URL**: `https://mdjhaeygzdpywzrwnacx.supabase.co`
- **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kamhhZXlnemRweXd6cnduYWN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwMTkxMjEsImV4cCI6MjA2NTU5NTEyMX0.3NvVLKAwlJ73PwyGOfBsEAjKknK4yv0yX9vuExIX4LM`

## Client Setup

The Supabase client is configured in `src/integrations/supabase/client.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://mdjhaeygzdpywzrwnacx.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
```

### Usage in Components

```typescript
import { supabase } from "@/integrations/supabase/client";

// Example usage
const { data, error } = await supabase
  .from('your_table')
  .select('*');
```

## Database Schema

Currently, the database schema is empty and ready for table creation. The schema will be defined based on the application's data requirements.

### Recommended Tables for GlobalMeet

Based on the application's functionality, consider implementing these tables:

1. **meetings** - Store meeting information
   - id (UUID, primary key)
   - title (TEXT)
   - description (TEXT)
   - date (DATE)
   - time (TIME)
   - duration (INTEGER)
   - timezone (TEXT)
   - created_by (UUID, references auth.users)
   - created_at (TIMESTAMP)
   - updated_at (TIMESTAMP)

2. **meeting_attendees** - Store attendee information
   - id (UUID, primary key)
   - meeting_id (UUID, references meetings)
   - email (TEXT)
   - timezone (TEXT)
   - created_at (TIMESTAMP)

3. **meeting_timezones** - Store multiple timezones for meetings
   - id (UUID, primary key)
   - meeting_id (UUID, references meetings)
   - timezone (TEXT)
   - created_at (TIMESTAMP)

4. **user_profiles** - Extended user information
   - id (UUID, primary key, references auth.users)
   - email (TEXT)
   - preferred_timezone (TEXT)
   - created_at (TIMESTAMP)
   - updated_at (TIMESTAMP)

## Authentication

Supabase provides built-in authentication that can be easily integrated:

### Setup Authentication

1. **Enable Authentication Providers**
   - Email/Password (default)
   - OAuth providers (Google, GitHub, etc.)

2. **Configure URL Settings**
   - Site URL: Your application's URL
   - Redirect URLs: Include your development and production URLs

### Implementation Example

```typescript
// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123'
});

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
});

// Sign out
const { error } = await supabase.auth.signOut();
```

## Row Level Security (RLS)

When implementing tables, ensure proper RLS policies are set up:

```sql
-- Example: Enable RLS on meetings table
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see meetings they created or are invited to
CREATE POLICY "Users can view their meetings" 
  ON public.meetings 
  FOR SELECT 
  USING (
    auth.uid() = created_by OR 
    EXISTS (
      SELECT 1 FROM meeting_attendees 
      WHERE meeting_id = meetings.id 
      AND email = auth.email()
    )
  );
```

## Real-time Features

Enable real-time updates for collaborative features:

```typescript
// Subscribe to meeting changes
const channel = supabase
  .channel('meeting-changes')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'meetings'
    },
    (payload) => {
      console.log('Meeting updated:', payload);
    }
  )
  .subscribe();
```

## Edge Functions

Create serverless functions for complex operations:

```typescript
// Example: Email notifications
const { data, error } = await supabase.functions.invoke('send-meeting-invite', {
  body: {
    meetingId: 'uuid',
    attendeeEmails: ['user1@example.com', 'user2@example.com']
  }
});
```

## Storage

Use Supabase Storage for file uploads:

```sql
-- Create storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('meeting-attachments', 'meeting-attachments', true);
```

```typescript
// Upload file
const { data, error } = await supabase.storage
  .from('meeting-attachments')
  .upload('meeting-1/document.pdf', file);
```

## Environment Configuration

The project uses the following configuration in `supabase/config.toml`:

```toml
project_id = "mdjhaeygzdpywzrwnacx"
```

## Security Best Practices

1. **Use RLS Policies**: Always enable RLS on public tables
2. **Validate Input**: Use database constraints and frontend validation
3. **Limit API Access**: Use appropriate RLS policies to restrict data access
4. **Secure Edge Functions**: Validate authentication in edge functions
5. **Environment Variables**: Keep sensitive data in Supabase secrets

## Development Workflow

1. **Local Development**: Use the Supabase client directly
2. **Database Changes**: Create SQL migrations for schema changes
3. **Testing**: Test RLS policies with different user roles
4. **Deployment**: Changes are automatically deployed with Lovable

## Useful Links

- [Supabase Dashboard](https://supabase.com/dashboard/project/mdjhaeygzdpywzrwnacx)
- [SQL Editor](https://supabase.com/dashboard/project/mdjhaeygzdpywzrwnacx/sql/new)
- [Authentication Settings](https://supabase.com/dashboard/project/mdjhaeygzdpywzrwnacx/auth/providers)
- [Database Tables](https://supabase.com/dashboard/project/mdjhaeygzdpywzrwnacx/editor)

## Next Steps

1. Define and create the required database tables
2. Set up authentication flow in the application
3. Implement RLS policies for data security
4. Create edge functions for business logic
5. Set up real-time subscriptions for collaborative features

## Support

For issues or questions:
- Check the [Supabase Documentation](https://supabase.com/docs)
- Review the [Lovable Supabase Integration Guide](https://docs.lovable.dev/integrations/supabase)
- Contact support through the respective platforms
