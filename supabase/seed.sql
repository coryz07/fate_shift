-- Seed Data for Fate Shift Development
-- This file populates the database with sample data for testing

-- Note: This uses a test user UUID. In production, users are created via auth.users
-- For local development, you can create a user through Supabase Studio or the auth API

-- Sample profile (you'll need to replace with actual user ID after signup)
-- INSERT INTO public.profiles (id, email, full_name, timezone)
-- VALUES (
--   '00000000-0000-0000-0000-000000000000'::uuid,
--   'test@example.com',
--   'Test User',
--   'America/New_York'
-- );

-- Sample birth data
-- INSERT INTO public.birth_data (user_id, name, birth_date, birth_time, birth_timezone, birth_location_lat, birth_location_lng, birth_location_name, notes)
-- VALUES (
--   '00000000-0000-0000-0000-000000000000'::uuid,
--   'Sample Person',
--   '1990-05-15',
--   '14:30:00',
--   'America/New_York',
--   40.7128,
--   -74.0060,
--   'New York, NY, USA',
--   'Sample birth data for testing'
-- );

-- Note: Uncomment and update the UUIDs above after creating your first user
-- You can get your user ID from Supabase Studio > Authentication > Users

-- Sample reading types for reference
COMMENT ON TABLE public.readings IS 'Reading types: natal, compatibility, transit, life_path, numerology, vedic';
