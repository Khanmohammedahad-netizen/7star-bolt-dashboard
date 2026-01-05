-- ============================================
-- QUICK FIX: Run this SQL in Supabase SQL Editor
-- ============================================
-- This will fix RLS policies for events and profiles tables
-- Copy and paste this entire file into Supabase SQL Editor and run it

-- ============================================
-- 1. FIX EVENTS TABLE POLICIES
-- ============================================

-- Drop existing problematic policies on events
DROP POLICY IF EXISTS "Users can create events" ON events;
DROP POLICY IF EXISTS "Authenticated users can create events" ON events;
DROP POLICY IF EXISTS "Users can view events" ON events;
DROP POLICY IF EXISTS "Users can view own events" ON events;

-- Allow ALL authenticated users to INSERT events
CREATE POLICY "Allow authenticated users to create events"
ON events FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow ALL authenticated users to SELECT events
CREATE POLICY "Allow authenticated users to view events"
ON events FOR SELECT
TO authenticated
USING (true);

-- Allow ALL authenticated users to UPDATE events
CREATE POLICY "Allow authenticated users to update events"
ON events FOR UPDATE
TO authenticated
USING (true);

-- ============================================
-- 2. FIX PROFILES TABLE POLICIES (Optional)
-- ============================================

-- Drop existing problematic policies on profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON profiles;

-- Simple policy: Users can view their own profile
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Simple policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- Allow authenticated users to view all profiles (if needed for admin features)
-- Uncomment the next 3 lines if you want admins to see all profiles:
-- CREATE POLICY "Admins can view all profiles"
-- ON profiles FOR SELECT
-- TO authenticated
-- USING (true);

-- ============================================
-- 3. ALTERNATIVE: DISABLE RLS (DEVELOPMENT ONLY)
-- ============================================
-- If you're just testing and want to disable RLS temporarily,
-- uncomment these lines:

-- ALTER TABLE events DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. VERIFY TABLES EXIST
-- ============================================

-- Check if events table exists, create if it doesn't
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

-- Enable RLS on events (if not already enabled)
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Check if profiles table exists, create if it doesn't
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  role TEXT DEFAULT 'staff' CHECK (role IN ('admin', 'manager', 'staff')),
  region TEXT DEFAULT 'UAE' CHECK (region IN ('UAE', 'SAUDI')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles (if not already enabled)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- DONE! Now try creating an event again.
-- ============================================

