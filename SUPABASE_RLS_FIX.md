# Fixing Supabase RLS (Row Level Security) Issues

## Problem: Infinite Recursion in Profiles Table

The error "infinite recursion detected in policy for relation 'profiles'" means your RLS policy on the `profiles` table is referencing itself, causing a loop.

## Quick Fix: Disable RLS on Profiles (Development Only)

If you're using demo Supabase or just want to get it working quickly:

1. Go to your Supabase Dashboard
2. Navigate to **Table Editor** → **profiles** table
3. Click on **RLS** tab
4. **Disable RLS** temporarily (or fix the policies)

## Proper Fix: Create Correct RLS Policies

### For Profiles Table

Run this SQL in your Supabase SQL Editor:

```sql
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Create simple policies that don't cause recursion
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- Allow authenticated users to read all profiles (if needed)
-- Or restrict to only their own:
CREATE POLICY "Authenticated users can view profiles"
ON profiles FOR SELECT
TO authenticated
USING (true);
```

### For Events Table

Make sure events can be created:

```sql
-- Allow authenticated users to create events
CREATE POLICY "Authenticated users can create events"
ON events FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow users to view events in their region (or all if admin)
CREATE POLICY "Users can view events"
ON events FOR SELECT
TO authenticated
USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  )
  OR
  region IN (
    SELECT region FROM profiles WHERE id = auth.uid()
  )
);
```

### Alternative: Disable RLS Temporarily

If you just want to test without RLS:

```sql
-- Disable RLS on profiles (NOT RECOMMENDED FOR PRODUCTION)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Disable RLS on events (NOT RECOMMENDED FOR PRODUCTION)
ALTER TABLE events DISABLE ROW LEVEL SECURITY;
```

## Create Profiles Table (If Missing)

If the profiles table doesn't exist:

```sql
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  role TEXT DEFAULT 'staff' CHECK (role IN ('admin', 'manager', 'staff')),
  region TEXT DEFAULT 'UAE' CHECK (region IN ('UAE', 'SAUDI')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);
```

## Create Events Table (If Missing)

```sql
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  client TEXT NOT NULL,
  event_date DATE NOT NULL,
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Approved', 'Pending', 'Rejected')),
  region TEXT NOT NULL CHECK (region IN ('UAE', 'SAUDI')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can create events"
ON events FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can view events"
ON events FOR SELECT
TO authenticated
USING (true); -- Or add region-based filtering
```

## Testing

After fixing the policies:
1. Refresh your app
2. Try logging in
3. Try creating an event
4. Check the browser console for any remaining errors

