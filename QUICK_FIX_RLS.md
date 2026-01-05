# Quick Fix for RLS Permission Denied Error

## The Problem
You're getting "Permission denied" when trying to create events. This is because Supabase Row Level Security (RLS) is blocking the insert.

## The Solution (2 Options)

### Option 1: Run SQL Script (Recommended - 2 minutes)

1. **Open Supabase Dashboard**
   - Go to your Supabase project
   - Click on **SQL Editor** in the left sidebar

2. **Run the Fix Script**
   - Open the file `fix_rls_policies.sql` in this project
   - Copy the entire contents
   - Paste into Supabase SQL Editor
   - Click **Run** (or press Ctrl+Enter)

3. **Test**
   - Go back to your app
   - Try creating an event
   - It should work now! ✅

### Option 2: Manual Fix via Dashboard (5 minutes)

1. **Fix Events Table**
   - Go to **Table Editor** → **events** table
   - Click on **Policies** tab
   - Click **New Policy**
   - Choose **For INSERT** → **Allow** → **Authenticated users only**
   - Save

2. **Fix Profiles Table (if needed)**
   - Go to **Table Editor** → **profiles** table  
   - Click on **Policies** tab
   - Delete any policies that mention "recursion" or cause errors
   - Create new policy: **For SELECT** → **Allow** → **Users can view own profile** (using `auth.uid() = id`)

### Option 3: Disable RLS Temporarily (Quick Test - 30 seconds)

**⚠️ WARNING: Only for development/testing!**

Run this in SQL Editor:

```sql
ALTER TABLE events DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
```

This will allow all operations but is **NOT secure for production**.

## What the SQL Script Does

1. ✅ Removes broken/conflicting policies
2. ✅ Creates simple policies that allow authenticated users to:
   - Create events
   - View events
   - Update events
3. ✅ Creates profiles table if it doesn't exist
4. ✅ Creates events table if it doesn't exist
5. ✅ Sets up proper RLS policies

## After Running the Script

- ✅ You should be able to create events
- ✅ You should be able to view events
- ✅ The app should work normally

## Still Having Issues?

1. Check browser console for specific error messages
2. Verify you're logged in (check if user object exists)
3. Check Supabase logs: **Logs** → **Postgres Logs**
4. Make sure your Supabase project is active (not paused)

## Need Help?

If you're still getting errors after running the script, share:
- The exact error message from the browser console
- What happens when you try to create an event
- Any errors in Supabase logs

