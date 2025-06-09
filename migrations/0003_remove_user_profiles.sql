-- Drop foreign key constraints that reference user_profiles
-- (These should already be pointing to auth.users, but we'll check and update if needed)

-- Drop the user_profiles table
DROP TABLE IF EXISTS public.user_profiles CASCADE;

-- Recreate RLS policies if needed (they were already on auth.users)
-- No need to recreate as we're using auth.users directly now

-- The foreign key constraints in other tables already point to auth.users.id
-- So no need to update them as they're already correct
