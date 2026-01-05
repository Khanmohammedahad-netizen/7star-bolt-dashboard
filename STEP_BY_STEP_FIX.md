# Step-by-Step Fix for Permission Denied Error

## ⚡ FASTEST FIX (30 seconds)

### Option 1: Disable RLS Temporarily (Quick Test)

1. Open **Supabase Dashboard** → **SQL Editor**
2. Copy and paste this ONE line:

```sql
ALTER TABLE events DISABLE ROW LEVEL SECURITY;
```

3. Click **Run**
4. Try creating an event - it should work immediately!

⚠️ **Note**: This disables security. Only use for testing. Re-enable later.

---

## 🔧 PROPER FIX (2 minutes)

### Step 1: Open Supabase SQL Editor

1. Go to your Supabase project dashboard
2. Click **SQL Editor** in the left sidebar
3. Click **New Query** button

### Step 2: Run This SQL

Copy and paste this entire block:

```sql
-- Remove any existing policies that might conflict
DROP POLICY IF EXISTS "Allow authenticated users to create events" ON events;
DROP POLICY IF EXISTS "allow_insert_events" ON events;
DROP POLICY IF EXISTS "Users can create events" ON events;

-- Create a simple policy that allows all authenticated users to insert
CREATE POLICY "allow_insert_events"
ON events FOR INSERT
TO authenticated
WITH CHECK (true);
```

### Step 3: Click Run (or Ctrl+Enter)

### Step 4: Test

Go back to your app and try creating an event. It should work!

---

## 🐛 If It Still Doesn't Work

### Check 1: Is RLS Enabled?

Run this to check:

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'events';
```

If `rowsecurity` is `true`, RLS is enabled. If it's `false`, RLS is disabled (which is fine for testing).

### Check 2: Do Policies Exist?

Run this to see all policies:

```sql
SELECT * FROM pg_policies WHERE tablename = 'events';
```

You should see at least one INSERT policy.

### Check 3: Are You Logged In?

Make sure you're actually logged in to your app. Check the browser console to see if there's a user object.

### Check 4: Try Disabling RLS Completely

If nothing works, disable RLS:

```sql
ALTER TABLE events DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
```

Then try creating an event. If this works, the issue is definitely with RLS policies.

---

## 📋 Complete Working Policy Setup

If you want a complete setup, run this:

```sql
-- Events table policies
DROP POLICY IF EXISTS "allow_insert_events" ON events;
DROP POLICY IF EXISTS "allow_select_events" ON events;
DROP POLICY IF EXISTS "allow_update_events" ON events;

CREATE POLICY "allow_insert_events"
ON events FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "allow_select_events"
ON events FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "allow_update_events"
ON events FOR UPDATE
TO authenticated
USING (true);
```

---

## ❓ Still Having Issues?

Share:
1. The exact error message from browser console
2. What you see when you run: `SELECT * FROM pg_policies WHERE tablename = 'events';`
3. Whether disabling RLS works (if yes, it's a policy issue)

