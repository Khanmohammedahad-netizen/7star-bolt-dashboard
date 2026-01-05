-- ============================================
-- EMERGENCY FIX: Disable RLS (Development Only!)
-- ============================================
-- ⚠️ WARNING: This disables security. Only use for testing!
-- Copy and paste this into Supabase SQL Editor

ALTER TABLE events DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Now try creating an event - it should work immediately.
-- Remember to re-enable RLS later for production!

