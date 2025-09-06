# Zin - Tax Analysis Platform - Supabase Setup Script
# This script helps you set up your Supabase project

Write-Host "🚀 Zin - Tax Analysis Platform - Supabase Setup" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""

# Check if .env.local exists
if (Test-Path ".env.local") {
    Write-Host "✅ .env.local file found" -ForegroundColor Green
} else {
    Write-Host "⚠️  .env.local file not found. Creating from template..." -ForegroundColor Yellow
    Copy-Item "env.local.template" ".env.local"
    Write-Host "📝 Please edit .env.local with your Supabase credentials" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Go to https://supabase.com and create a new project" -ForegroundColor White
Write-Host "2. Get your Project URL and Anon Key from Settings → API" -ForegroundColor White
Write-Host "3. Update .env.local with your credentials" -ForegroundColor White
Write-Host "4. Run the database migrations in Supabase SQL Editor" -ForegroundColor White
Write-Host "5. Start your app with: npm run dev" -ForegroundColor White
Write-Host ""

Write-Host "📁 Migration files to run in order:" -ForegroundColor Cyan
Write-Host "   - supabase/migrations/001_initial_schema.sql" -ForegroundColor White
Write-Host "   - supabase/migrations/002_row_level_security.sql" -ForegroundColor White
Write-Host "   - supabase/migrations/003_sample_data.sql" -ForegroundColor White
Write-Host ""

Write-Host "🔗 Quick Links:" -ForegroundColor Cyan
Write-Host "   Supabase Dashboard: https://supabase.com/dashboard" -ForegroundColor Blue
Write-Host "   Project Setup Guide: SUPABASE_SETUP.md" -ForegroundColor Blue
Write-Host ""

Write-Host "Press any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
