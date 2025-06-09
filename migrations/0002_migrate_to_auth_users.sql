-- Enable Row Level Security on all tables
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preparation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

-- Create user_profiles table for extended user data
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL UNIQUE,
  full_name TEXT,
  avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for user_profiles
CREATE POLICY "Users can view their own profile" 
  ON public.user_profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.user_profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Migrate data from public.users to auth.users and user_profiles
-- Note: This assumes auth.users already has the users from Supabase Auth
-- and public.users has the profile data to migrate
INSERT INTO public.user_profiles (id, username, full_name, avatar, created_at, updated_at)
SELECT 
  u.id,
  u.username,
  u.full_name,
  u.avatar,
  u.created_at,
  u.updated_at
FROM public.users u
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  full_name = EXCLUDED.full_name,
  avatar = EXCLUDED.avatar,
  updated_at = NOW();

-- Update foreign key references in other tables to point to auth.users.id
-- These are just examples - adjust based on your actual schema
-- ALTER TABLE public.topics 
--   ALTER COLUMN user_id SET DATA TYPE UUID USING user_id::TEXT::UUID,
--   ADD CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Drop the old users table (after confirming everything works)
-- DROP TABLE IF EXISTS public.users CASCADE;
