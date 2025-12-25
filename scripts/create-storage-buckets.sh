#!/bin/bash

# ==========================================
# Storage Buckets Creation Script
# ==========================================
# This script helps create Supabase Storage buckets
# for the Ashram Management application
#
# Prerequisites:
# 1. Supabase CLI installed: npm install -g supabase
# 2. Logged in to Supabase: supabase login
# 3. Linked to your project: supabase link --project-ref <your-project-ref>
# ==========================================

echo "=========================================="
echo "Creating Supabase Storage Buckets"
echo "=========================================="
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed."
    echo "   Install it with: npm install -g supabase"
    exit 1
fi

# Create gurukul-files bucket
echo "Creating 'gurukul-files' bucket..."
supabase storage create gurukul-files --public

if [ $? -eq 0 ]; then
    echo "✅ Successfully created 'gurukul-files' bucket"
else
    echo "⚠️  Failed to create 'gurukul-files' bucket"
    echo "   It may already exist, or you may need to create it manually via the Supabase Dashboard"
fi

echo ""
echo "=========================================="
echo "Bucket Creation Complete"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Verify the bucket in Supabase Dashboard: Storage > Buckets"
echo "2. Check that the bucket is set to 'Public'"
echo "3. Review storage policies in the migration file:"
echo "   supabase/migrations/20250129000000_create_storage_buckets.sql"
echo ""
echo "To apply storage policies, run:"
echo "  supabase db push"
echo ""

