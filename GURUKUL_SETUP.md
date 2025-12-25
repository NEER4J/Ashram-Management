# Gurukul Setup Instructions

## Database Migration

1. Run the database migration to create all required tables:
   ```bash
   # If using Supabase CLI
   supabase db push
   
   # Or apply the migration file manually:
   # supabase/migrations/20250125000000_gurukul_schema.sql
   ```

## Storage Bucket Setup

The Gurukul system requires a Supabase Storage bucket for file uploads. Follow these steps:

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **New bucket**
4. Enter bucket name: `gurukul-files`
5. Set bucket to **Public** (so files can be accessed via URLs)
6. Click **Create bucket**

### Option 2: Using Supabase CLI

```bash
# Create the bucket
supabase storage create gurukul-files --public
```

### Option 3: Using Helper Scripts

We've provided helper scripts to create the bucket:

**For Linux/Mac:**
```bash
chmod +x scripts/create-storage-buckets.sh
./scripts/create-storage-buckets.sh
```

**For Windows (PowerShell):**
```powershell
.\scripts\create-storage-buckets.ps1
```

### Storage Bucket Policies

After creating the bucket, apply the storage policies from the migration file:

```bash
# Apply the migration which includes storage policies
supabase db push
```

Or manually run the policies from:
`supabase/migrations/20250129000000_create_storage_buckets.sql`

The migration file includes:
- Public read access policy
- Authenticated user upload policy
- Authenticated user update/delete policies

**Note:** The migration file contains SQL policies that can be applied after the bucket is created. Buckets themselves cannot be created via SQL migrations and must be created using the Dashboard, CLI, or helper scripts.

## Verification

After setup, verify:

1. ✅ Database tables exist (check in Supabase SQL Editor):
   - `study_materials`
   - `course_modules`
   - `course_enrollments`
   - `module_progress`
   - `study_material_orders`
   - `order_items`
   - `master_material_categories`

2. ✅ Storage bucket exists:
   - Go to Storage in Supabase dashboard
   - Verify `gurukul-files` bucket is visible

3. ✅ Test file upload:
   - Go to Dashboard > Gurukul > Study Materials
   - Try creating a new material and uploading a file
   - Should work without "Bucket not found" error

## Troubleshooting

### "Bucket not found" Error
- Ensure the bucket name is exactly `gurukul-files` (case-sensitive)
- Check that the bucket is created in the correct Supabase project
- Verify bucket permissions are set correctly

### Database Errors
- Ensure migration has been run successfully
- Check that all tables exist in your database
- Verify RLS policies if you have them enabled

### File Upload Issues
- Check bucket is set to **Public** if you want public access
- Verify storage policies allow uploads
- Check file size limits (Supabase default is 50MB per file)

