-- ============================================
-- ONE-LINE EMERGENCY FIX
-- Copy this single line into Supabase SQL Editor and run it
-- ============================================

ALTER TABLE events DISABLE ROW LEVEL SECURITY;

-- That's it! Now try creating an event. It should work immediately.
-- (Remember to re-enable RLS later and add proper policies)

