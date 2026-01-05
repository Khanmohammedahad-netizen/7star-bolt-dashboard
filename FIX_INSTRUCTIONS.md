# 🔧 Fix Permission Denied Error - Choose Your Method

## ⚡ Method 1: Emergency One-Line Fix (10 seconds)

**Use this if you just want to test quickly:**

1. Open **Supabase Dashboard** → **SQL Editor**
2. Copy this ONE line:

```sql
ALTER TABLE events DISABLE ROW LEVEL SECURITY;
```

3. Click **Run**
4. Try creating an event - it should work!

⚠️ **Note**: This disables security. Only for testing!

---

## 🎯 Method 2: Complete Fix (Recommended - 2 minutes)

**Use this for a proper fix:**

1. Open **Supabase Dashboard** → **SQL Editor**
2. Open the file `DIAGNOSE_AND_FIX.sql` in your project
3. Copy **ALL** the SQL code
4. Paste into Supabase SQL Editor
5. Click **Run** (or Ctrl+Enter)
6. You should see a table showing 4 policies were created
7. Try creating an event - it should work!

This script:
- ✅ Creates the events table if it doesn't exist
- ✅ Removes all old/broken policies
- ✅ Creates new working policies
- ✅ Shows you what was created

---

## 🔍 Method 3: Check What's Wrong First

**Use this to diagnose the issue:**

1. Open **Supabase Dashboard** → **SQL Editor**
2. Run this to see current policies:

```sql
SELECT * FROM pg_policies WHERE tablename = 'events';
```

3. Run this to check if RLS is enabled:

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'events';
```

4. Share the results if you need help

---

## ❓ Still Not Working?

### Check 1: Are you logged in?
- Open browser console (F12)
- Check if there's a user object
- Make sure you're actually authenticated

### Check 2: Does the table exist?
Run this:
```sql
SELECT * FROM events LIMIT 1;
```
If you get an error, the table doesn't exist. Run `DIAGNOSE_AND_FIX.sql`.

### Check 3: Try the emergency fix
Run:
```sql
ALTER TABLE events DISABLE ROW LEVEL SECURITY;
```
If this works, the problem is definitely with policies. Then run `DIAGNOSE_AND_FIX.sql`.

---

## 📋 What Each File Does

- **ONE_LINE_FIX.sql** - Disables RLS (quick test)
- **DIAGNOSE_AND_FIX.sql** - Complete fix with diagnostics (recommended)
- **SIMPLE_FIX.sql** - Simple policy creation
- **EMERGENCY_FIX.sql** - Disables RLS on both tables

---

## ✅ After Fixing

1. Refresh your app
2. Make sure you're logged in
3. Try creating an event
4. It should work!

If it still doesn't work, share:
- The exact error message
- What you see when running the diagnostic queries
- Whether the emergency fix worked

