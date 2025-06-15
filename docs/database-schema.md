
# Database Schema Documentation

## Overview

This document outlines the recommended database schema for the GlobalMeet application, designed to support multi-timezone meeting scheduling and management.

## Core Tables

### 1. meetings

Primary table for storing meeting information.

```sql
CREATE TABLE public.meetings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  time TIME NOT NULL,
  duration INTEGER NOT NULL DEFAULT 60, -- in minutes
  timezone TEXT NOT NULL, -- Primary timezone (e.g., 'America/New_York')
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
```

**Columns:**
- `id`: Unique identifier for the meeting
- `title`: Meeting title/subject
- `description`: Optional meeting description
- `date`: Meeting date
- `time`: Meeting time in the primary timezone
- `duration`: Meeting duration in minutes
- `timezone`: Primary timezone for the meeting
- `created_by`: User who created the meeting
- `created_at`: Record creation timestamp
- `updated_at`: Record last update timestamp

### 2. meeting_attendees

Stores attendee information for each meeting.

```sql
CREATE TABLE public.meeting_attendees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_id UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  timezone TEXT, -- Attendee's preferred timezone
  status TEXT DEFAULT 'pending', -- pending, accepted, declined
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
```

**Columns:**
- `id`: Unique identifier for the attendee record
- `meeting_id`: Reference to the meeting
- `email`: Attendee's email address
- `timezone`: Attendee's preferred timezone
- `status`: Invitation status
- `created_at`: Record creation timestamp

### 3. meeting_timezones

Stores all timezones to display for a meeting.

```sql
CREATE TABLE public.meeting_timezones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_id UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
  timezone TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(meeting_id, timezone)
);
```

**Columns:**
- `id`: Unique identifier
- `meeting_id`: Reference to the meeting
- `timezone`: Timezone identifier
- `created_at`: Record creation timestamp

### 4. user_profiles

Extended user information beyond Supabase auth.

```sql
CREATE TABLE public.user_profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  preferred_timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
```

**Columns:**
- `id`: References the auth.users table
- `email`: User's email address
- `first_name`: User's first name
- `last_name`: User's last name
- `preferred_timezone`: User's default timezone
- `created_at`: Record creation timestamp
- `updated_at`: Record last update timestamp

## Indexes

Recommended indexes for optimal performance:

```sql
-- Meetings indexes
CREATE INDEX idx_meetings_created_by ON public.meetings(created_by);
CREATE INDEX idx_meetings_date ON public.meetings(date);
CREATE INDEX idx_meetings_created_at ON public.meetings(created_at);

-- Meeting attendees indexes
CREATE INDEX idx_meeting_attendees_meeting_id ON public.meeting_attendees(meeting_id);
CREATE INDEX idx_meeting_attendees_email ON public.meeting_attendees(email);

-- Meeting timezones indexes
CREATE INDEX idx_meeting_timezones_meeting_id ON public.meeting_timezones(meeting_id);

-- User profiles indexes
CREATE INDEX idx_user_profiles_email ON public.user_profiles(email);
```

## Row Level Security (RLS) Policies

### meetings table

```sql
-- Enable RLS
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;

-- Users can view meetings they created or are invited to
CREATE POLICY "Users can view their meetings" ON public.meetings
  FOR SELECT USING (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM public.meeting_attendees 
      WHERE meeting_id = meetings.id 
      AND email = auth.email()
    )
  );

-- Users can create meetings
CREATE POLICY "Users can create meetings" ON public.meetings
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Users can update their own meetings
CREATE POLICY "Users can update their meetings" ON public.meetings
  FOR UPDATE USING (auth.uid() = created_by);

-- Users can delete their own meetings
CREATE POLICY "Users can delete their meetings" ON public.meetings
  FOR DELETE USING (auth.uid() = created_by);
```

### meeting_attendees table

```sql
-- Enable RLS
ALTER TABLE public.meeting_attendees ENABLE ROW LEVEL SECURITY;

-- Users can view attendees for meetings they have access to
CREATE POLICY "Users can view meeting attendees" ON public.meeting_attendees
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.meetings 
      WHERE id = meeting_id 
      AND (created_by = auth.uid() OR 
           EXISTS (
             SELECT 1 FROM public.meeting_attendees ma 
             WHERE ma.meeting_id = meetings.id 
             AND ma.email = auth.email()
           ))
    )
  );

-- Meeting creators can manage attendees
CREATE POLICY "Meeting creators can manage attendees" ON public.meeting_attendees
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.meetings 
      WHERE id = meeting_id 
      AND created_by = auth.uid()
    )
  );
```

### meeting_timezones table

```sql
-- Enable RLS
ALTER TABLE public.meeting_timezones ENABLE ROW LEVEL SECURITY;

-- Users can view timezones for accessible meetings
CREATE POLICY "Users can view meeting timezones" ON public.meeting_timezones
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.meetings 
      WHERE id = meeting_id 
      AND (created_by = auth.uid() OR 
           EXISTS (
             SELECT 1 FROM public.meeting_attendees 
             WHERE meeting_id = meetings.id 
             AND email = auth.email()
           ))
    )
  );

-- Meeting creators can manage timezones
CREATE POLICY "Meeting creators can manage timezones" ON public.meeting_timezones
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.meetings 
      WHERE id = meeting_id 
      AND created_by = auth.uid()
    )
  );
```

### user_profiles table

```sql
-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can view and update their own profile
CREATE POLICY "Users can manage their own profile" ON public.user_profiles
  FOR ALL USING (auth.uid() = id);

-- Users can view other profiles (for meeting attendees)
CREATE POLICY "Users can view profiles" ON public.user_profiles
  FOR SELECT USING (true);
```

## Triggers

### Auto-update timestamps

```sql
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to meetings table
CREATE TRIGGER update_meetings_updated_at BEFORE UPDATE ON public.meetings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to user_profiles table
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Auto-create user profile

```sql
-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## Data Types and Constraints

### Timezone Validation

Consider adding a constraint to ensure valid timezone identifiers:

```sql
-- Add constraint for valid timezones (optional)
ALTER TABLE public.meetings ADD CONSTRAINT valid_timezone 
  CHECK (timezone ~ '^[A-Za-z]+/[A-Za-z_]+$');
```

### Email Validation

```sql
-- Add email format constraint
ALTER TABLE public.meeting_attendees ADD CONSTRAINT valid_email 
  CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
```

## Sample Data

Example data for testing:

```sql
-- Sample meeting
INSERT INTO public.meetings (title, description, date, time, duration, timezone, created_by)
VALUES (
  'Team Standup',
  'Daily team synchronization meeting',
  '2024-01-15',
  '09:00:00',
  30,
  'America/New_York',
  'user-uuid-here'
);

-- Sample attendees
INSERT INTO public.meeting_attendees (meeting_id, email, timezone)
VALUES 
  ('meeting-uuid-here', 'alice@example.com', 'America/New_York'),
  ('meeting-uuid-here', 'bob@example.com', 'Europe/London'),
  ('meeting-uuid-here', 'charlie@example.com', 'Asia/Tokyo');

-- Sample timezones
INSERT INTO public.meeting_timezones (meeting_id, timezone)
VALUES 
  ('meeting-uuid-here', 'America/New_York'),
  ('meeting-uuid-here', 'Europe/London'),
  ('meeting-uuid-here', 'Asia/Tokyo');
```

## Migration Strategy

1. Create tables in dependency order
2. Add indexes after table creation
3. Enable RLS and create policies
4. Add triggers and functions
5. Insert seed data if needed

This schema supports the core functionality of GlobalMeet while maintaining security and performance through proper indexing and RLS policies.
