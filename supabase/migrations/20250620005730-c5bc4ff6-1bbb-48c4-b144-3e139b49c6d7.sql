
-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  timezone TEXT DEFAULT 'America/New_York',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create meetings table
CREATE TABLE public.meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  meeting_date DATE NOT NULL,
  meeting_time TIME NOT NULL,
  duration INTEGER NOT NULL DEFAULT 60, -- duration in minutes
  timezone TEXT NOT NULL DEFAULT 'America/New_York',
  meeting_url TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create meeting attendees table (many-to-many relationship)
CREATE TABLE public.meeting_attendees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES public.meetings(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  email TEXT, -- for non-registered attendees
  status TEXT DEFAULT 'invited' CHECK (status IN ('invited', 'accepted', 'declined', 'tentative')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(meeting_id, user_id),
  UNIQUE(meeting_id, email)
);

-- Create timezone preferences table
CREATE TABLE public.timezone_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  timezone TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, timezone)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timezone_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for meetings
CREATE POLICY "Users can view meetings they created or are invited to" ON public.meetings FOR SELECT 
USING (
  creator_id = auth.uid() OR 
  id IN (
    SELECT meeting_id FROM public.meeting_attendees 
    WHERE user_id = auth.uid()
  )
);
CREATE POLICY "Users can create meetings" ON public.meetings FOR INSERT WITH CHECK (creator_id = auth.uid());
CREATE POLICY "Users can update their own meetings" ON public.meetings FOR UPDATE USING (creator_id = auth.uid());
CREATE POLICY "Users can delete their own meetings" ON public.meetings FOR DELETE USING (creator_id = auth.uid());

-- RLS Policies for meeting attendees
CREATE POLICY "Users can view attendees of meetings they're involved in" ON public.meeting_attendees FOR SELECT 
USING (
  meeting_id IN (
    SELECT id FROM public.meetings WHERE creator_id = auth.uid()
  ) OR user_id = auth.uid()
);
CREATE POLICY "Meeting creators can manage attendees" ON public.meeting_attendees FOR ALL 
USING (
  meeting_id IN (
    SELECT id FROM public.meetings WHERE creator_id = auth.uid()
  )
);

-- RLS Policies for timezone preferences
CREATE POLICY "Users can manage their own timezone preferences" ON public.timezone_preferences FOR ALL USING (user_id = auth.uid());

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Functions to get meeting with attendees
CREATE OR REPLACE FUNCTION get_meetings_with_attendees(user_uuid UUID)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  meeting_date DATE,
  meeting_time TIME,
  duration INTEGER,
  timezone TEXT,
  meeting_url TEXT,
  status TEXT,
  creator_email TEXT,
  attendees JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.title,
    m.description,
    m.meeting_date,
    m.meeting_time,
    m.duration,
    m.timezone,
    m.meeting_url,
    m.status,
    p.email as creator_email,
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'email', COALESCE(pa.email, ap.email),
          'status', ma.status,
          'full_name', ap.full_name
        )
      ) FILTER (WHERE ma.id IS NOT NULL),
      '[]'::jsonb
    ) as attendees
  FROM public.meetings m
  LEFT JOIN public.profiles p ON m.creator_id = p.id
  LEFT JOIN public.meeting_attendees ma ON m.id = ma.meeting_id
  LEFT JOIN public.profiles ap ON ma.user_id = ap.id
  LEFT JOIN public.profiles pa ON ma.email = pa.email
  WHERE m.creator_id = user_uuid 
     OR m.id IN (
       SELECT meeting_id FROM public.meeting_attendees 
       WHERE user_id = user_uuid
     )
  GROUP BY m.id, m.title, m.description, m.meeting_date, m.meeting_time, 
           m.duration, m.timezone, m.meeting_url, m.status, p.email
  ORDER BY m.meeting_date, m.meeting_time;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
