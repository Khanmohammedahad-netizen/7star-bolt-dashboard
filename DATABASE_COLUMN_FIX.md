# Database Column Name Fix

## Issue
The error "Could not find the 'date' column of 'events' in the schema cache" means your database table uses a different column name than `date`.

## Solution Applied
I've updated the code to use `event_date` as the column name. If your database uses a different name, follow these steps:

### Step 1: Check Your Actual Column Name

1. Go to your Supabase dashboard
2. Navigate to **Table Editor** → **events** table
3. Look at the column names - find the one that stores the event date
4. Common names: `event_date`, `start_date`, `scheduled_date`, `date`

### Step 2: Update the Code

If your column is NOT named `event_date`, update these files:

#### Option A: Quick Fix (if column is `start_date` or `scheduled_date`)
1. Open `src/pages/Events.tsx`
2. Find line 37 and change `event_date` to your column name
3. Find line 42 and change `event.event_date` to `event.your_column_name`
4. Find line 60 and change `event_date` to your column name
5. Open `src/components/events/CreateEventWizard.tsx`
6. Find line 42 and change `event_date` to your column name
7. Open `src/pages/Events.tsx` (CreateEventModal section)
8. Find the insert statement and change `event_date` to your column name

#### Option B: Use the Mapping Utility (Recommended)
1. Open `src/utils/dbMapping.ts`
2. Change `EVENT_DATE: 'event_date'` to your actual column name
3. The rest of the code will automatically use the correct column

### Step 3: Test
After making changes, try creating an event again. The error should be resolved.

## Common Column Names
- `event_date` ✅ (currently configured)
- `start_date`
- `scheduled_date`
- `date` (if you want to rename your DB column to match)
- `eventDate` (unlikely in PostgreSQL)

## Alternative: Rename Your Database Column
If you prefer, you can rename your database column to `date`:

```sql
ALTER TABLE events RENAME COLUMN event_date TO date;
```

Then revert the code changes to use `date` instead of `event_date`.

