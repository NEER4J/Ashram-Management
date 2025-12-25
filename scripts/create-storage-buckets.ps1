# ==========================================
# Storage Buckets Creation Script (PowerShell)
# ==========================================
# This script helps create Supabase Storage buckets
# for the Ashram Management application
#
# Prerequisites:
# 1. Supabase CLI installed: npm install -g supabase
# 2. Logged in to Supabase: supabase login
# 3. Linked to your project: supabase link --project-ref <your-project-ref>
# ==========================================

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Creating Supabase Storage Buckets" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Supabase CLI is installed
try {
    $null = Get-Command supabase -ErrorAction Stop
} catch {
    Write-Host "❌ Supabase CLI is not installed." -ForegroundColor Red
    Write-Host "   Install it with: npm install -g supabase" -ForegroundColor Yellow
    exit 1
}

# Create gurukul-files bucket
Write-Host "Creating 'gurukul-files' bucket..." -ForegroundColor Yellow
$result = supabase storage create gurukul-files --public

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Successfully created 'gurukul-files' bucket" -ForegroundColor Green
} else {
    Write-Host "⚠️  Failed to create 'gurukul-files' bucket" -ForegroundColor Yellow
    Write-Host "   It may already exist, or you may need to create it manually via the Supabase Dashboard" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Bucket Creation Complete" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Verify the bucket in Supabase Dashboard: Storage > Buckets"
Write-Host "2. Check that the bucket is set to 'Public'"
Write-Host "3. Review storage policies in the migration file:"
Write-Host "   supabase/migrations/20250129000000_create_storage_buckets.sql"
Write-Host ""
Write-Host "To apply storage policies, run:" -ForegroundColor Yellow
Write-Host "  supabase db push"
Write-Host ""

