-- ============================================
-- COMPLETE DIAGNOSTIC AND FIX SCRIPT
-- Copy and paste this ENTIRE file into Supabase SQL Editor
-- ============================================

-- Step 1: Check if events table exists, create if it doesn't
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  client TEXT NOT NULL,
  event_date DATE,
  date DATE, -- Support both column names
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Approved', 'Pending', 'Rejected')),
  region TEXT NOT NULL CHECK (region IN ('UAE', 'SAUDI')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 2: Enable RLS (if not already enabled)
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Step 3: Drop ALL existing policies to start fresh
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'events') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON events';
    END LOOP;
END $$;

-- Step 4: Create new policies with simple names
CREATE POLICY "events_insert_policy"
ON events FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "events_select_policy"
ON events FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "events_update_policy"
ON events FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "events_delete_policy"
ON events FOR DELETE
TO authenticated
USING (true);

-- Step 5: Verify policies were created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'events';

-- ============================================
-- DONE! The output above should show 4 policies.
-- Now try creating an event in your app!
-- ============================================

