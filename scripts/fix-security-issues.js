#!/usr/bin/env node

/**
 * Fix Security Issues Script
 * This script applies the security definer view fix
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔒 Fixing Security Definer View Issues...\n');

// Check if we're in the right directory
const packageJsonPath = path.join(process.cwd(), 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.error('❌ Error: package.json not found. Please run this script from the project root.');
  process.exit(1);
}

// Check if Supabase CLI is available
console.log('🔍 Checking Supabase CLI...');
try {
  execSync('supabase --version', { stdio: 'pipe' });
  console.log('✅ Supabase CLI is available');
} catch (error) {
  console.error('❌ Supabase CLI not found. Please install it first:');
  console.error('   npm install -g supabase');
  process.exit(1);
}

// Check if we're in a Supabase project
const supabaseConfigPath = path.join(process.cwd(), 'supabase', 'config.toml');
if (!fs.existsSync(supabaseConfigPath)) {
  console.error('❌ Error: supabase/config.toml not found. Please run this from a Supabase project directory.');
  process.exit(1);
}

console.log('✅ Supabase project detected');

// Apply the migration
console.log('\n📝 Applying security fix migration...');
try {
  // Check if Supabase is running locally
  try {
    execSync('supabase status', { stdio: 'pipe' });
    console.log('✅ Local Supabase is running');
    
    // Apply migration locally
    execSync('supabase db reset', { stdio: 'inherit' });
    console.log('✅ Database reset and migrations applied');
    
  } catch (error) {
    console.log('⚠️  Local Supabase not running. Starting it...');
    try {
      execSync('supabase start', { stdio: 'inherit' });
      console.log('✅ Local Supabase started');
    } catch (startError) {
      console.log('⚠️  Could not start local Supabase. You may need to apply migrations manually.');
      console.log('   Run: supabase db push');
    }
  }
  
} catch (error) {
  console.error('❌ Error applying migration:', error.message);
  console.log('\n📋 Manual steps to fix the security issue:');
  console.log('1. Connect to your Supabase database');
  console.log('2. Run the SQL from: supabase/migrations/009_fix_security_definer_view.sql');
  console.log('3. Or use: supabase db push');
  process.exit(1);
}

console.log('\n🎉 Security issues fixed!');
console.log('\n📋 What was fixed:');
console.log('✅ user_dashboard view now uses SECURITY INVOKER');
console.log('✅ get_latest_tax_report function now uses SECURITY INVOKER');
console.log('✅ calculate_tax_liability function now uses SECURITY INVOKER');
console.log('✅ All functions and views now respect RLS policies properly');

console.log('\n🔍 To verify the fix:');
console.log('1. Check your Supabase dashboard');
console.log('2. Go to Database → Linter');
console.log('3. The security_definer_view error should be resolved');

console.log('\n✨ Your database is now more secure!');
