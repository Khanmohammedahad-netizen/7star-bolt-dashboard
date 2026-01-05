-- ============================================
-- SIMPLEST FIX: Copy and paste this into Supabase SQL Editor
-- ============================================

-- First, drop any existing policies that might conflict
DROP POLICY IF EXISTS "allow_insert_events" ON events;
DROP POLICY IF EXISTS "Allow authenticated users to create events" ON events;
DROP POLICY IF EXISTS "Users can create events" ON events;
DROP POLICY IF EXISTS "allow_select_events" ON events;
DROP POLICY IF EXISTS "allow_update_events" ON events;

-- Step 1: Allow all authenticated users to create events
CREATE POLICY "allow_insert_events"
ON events FOR INSERT
TO authenticated
WITH CHECK (true);

-- Step 2: Allow all authenticated users to view events  
CREATE POLICY "allow_select_events"
ON events FOR SELECT
TO authenticated
USING (true);

-- Step 3: Allow all authenticated users to update events
CREATE POLICY "allow_update_events"
ON events FOR UPDATE
TO authenticated
USING (true);

-- That's it! Now try creating an event.
