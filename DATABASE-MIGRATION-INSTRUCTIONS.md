# Database Migration Instructions

## Issue: Goal Setting Not Working

If you're experiencing issues with goal setting or being stuck in a redirect loop, it's likely because the `onboarding_completed` column is missing from your profiles table.

## Solution: Apply Database Migrations

You need to run the following SQL migrations in your Supabase database in order:

### 1. Apply Onboarding Migration (REQUIRED)

**File:** `supabase-onboarding-migration.sql`

**What it does:**
- Adds `onboarding_completed` and `onboarding_step` columns to profiles table
- Marks existing users as already onboarded so they can access the app
- Creates necessary indexes for performance

**How to apply:**

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Navigate to your project
3. Click on "SQL Editor" in the left sidebar
4. Click "New query"
5. Copy and paste the contents of `supabase-onboarding-migration.sql`
6. Click "Run" or press Ctrl+Enter

### 2. Apply Habits Migration (Optional - if you want the habits feature)

**File:** `supabase-habits-migration.sql`

Follow the same steps as above with the habits migration file.

### 3. Apply Profile Update Migration (Optional - if you want user profiles)

**File:** `supabase-profile-update-migration.sql`

Follow the same steps as above with the profile update migration file.

## Verification

After applying the onboarding migration, verify it worked:

1. Go to SQL Editor in Supabase
2. Run this query:
   ```sql
   SELECT id, email, onboarding_completed, onboarding_step
   FROM profiles
   LIMIT 5;
   ```
3. You should see the new columns with values:
   - `onboarding_completed`: true
   - `onboarding_step`: 3

## For New Deployments

If you're setting up a completely fresh database, you can run the main schema file first:

**File:** `supabase-schema.sql`

This includes all tables and columns, so you won't need the individual migration files.

## Troubleshooting

### Still getting redirected to onboarding?

Run this SQL to manually mark your user as onboarded:

```sql
UPDATE profiles
SET onboarding_completed = TRUE,
    onboarding_step = 3
WHERE email = 'your-email@example.com';
```

Replace `'your-email@example.com'` with your actual email address.

### Want to reset and go through onboarding again?

```sql
UPDATE profiles
SET onboarding_completed = FALSE,
    onboarding_step = 0
WHERE email = 'your-email@example.com';
```

## Migration Order Summary

For existing databases:
1. ✅ **supabase-onboarding-migration.sql** (Required - fixes goal setting)
2. 🔄 supabase-habits-migration.sql (Optional - adds habits feature)
3. 🔄 supabase-profile-update-migration.sql (Optional - adds profile fields)

For brand new databases:
1. ✅ **supabase-schema.sql** (Complete schema - includes everything)

---

**After applying the migration, refresh your app and you should be able to access goals and all other features!**
