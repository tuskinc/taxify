#!/usr/bin/env node

/**
 * Taxify Project Setup Script
 * This script helps set up the Taxify tax planning application
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up Taxify Tax Planning Application...\n');

// Check if we're in the right directory
const packageJsonPath = path.join(process.cwd(), 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.error('❌ Error: package.json not found. Please run this script from the project root.');
  process.exit(1);
}

// Check Node.js version
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
if (majorVersion < 16) {
  console.error('❌ Error: Node.js version 16 or higher is required. Current version:', nodeVersion);
  process.exit(1);
}

console.log('✅ Node.js version check passed:', nodeVersion);

// Check if .env.local exists
const envLocalPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envLocalPath)) {
  console.log('📝 Creating .env.local file...');
  
  const envTemplate = `# Supabase Configuration
# Get these values from your Supabase project settings
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# AI Services (Optional - for advanced features)
# VITE_CLAUDE_API_KEY=your-claude-api-key-here
# VITE_BING_SEARCH_KEY=your-bing-search-key-here

# OCR Providers (Optional)
# VITE_OCR_PROVIDER=tesseract|textract|vision
# VITE_GOOGLE_VISION_KEY=your-google-vision-key
# VITE_AWS_TEXTRACT_ACCESS_KEY_ID=your-aws-access-key
# VITE_AWS_TEXTRACT_SECRET_ACCESS_KEY=your-aws-secret
# VITE_AWS_TEXTRACT_REGION=us-east-1

# CRM Providers (Optional)
# VITE_QBO_CLIENT_ID=
# VITE_QBO_CLIENT_SECRET=
# VITE_QBO_REDIRECT_URI=
# VITE_XERO_CLIENT_ID=
# VITE_XERO_CLIENT_SECRET=
# VITE_XERO_REDIRECT_URI=

# Note: Replace the placeholder values above with your actual Supabase credentials
# 1. Go to your Supabase project dashboard
# 2. Navigate to Settings → API
# 3. Copy the Project URL and anon key
# 4. Replace the values above
`;

  fs.writeFileSync(envLocalPath, envTemplate);
  console.log('✅ Created .env.local file');
} else {
  console.log('✅ .env.local file already exists');
}

// Install dependencies
console.log('\n📦 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed successfully');
} catch (error) {
  console.error('❌ Error installing dependencies:', error.message);
  process.exit(1);
}

// Check if Supabase CLI is installed
console.log('\n🔍 Checking Supabase CLI...');
try {
  execSync('supabase --version', { stdio: 'pipe' });
  console.log('✅ Supabase CLI is installed');
} catch (error) {
  console.log('⚠️  Supabase CLI not found. Installing...');
  try {
    execSync('npm install -g supabase', { stdio: 'inherit' });
    console.log('✅ Supabase CLI installed');
  } catch (installError) {
    console.log('⚠️  Could not install Supabase CLI globally. Please install it manually:');
    console.log('   npm install -g supabase');
  }
}

// Check if Vite is available
console.log('\n🔍 Checking build tools...');
try {
  execSync('npx vite --version', { stdio: 'pipe' });
  console.log('✅ Vite is available');
} catch (error) {
  console.error('❌ Vite not found. Please run npm install again.');
  process.exit(1);
}

// Create necessary directories
console.log('\n📁 Creating necessary directories...');
const directories = [
  'public/uploads',
  'src/hooks',
  'src/utils',
  'src/types'
];

directories.forEach(dir => {
  const dirPath = path.join(process.cwd(), dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✅ Created directory: ${dir}`);
  }
});

// Check database migrations
console.log('\n🗄️  Checking database setup...');
const migrationsPath = path.join(process.cwd(), 'supabase', 'migrations');
if (fs.existsSync(migrationsPath)) {
  const migrations = fs.readdirSync(migrationsPath);
  console.log(`✅ Found ${migrations.length} database migrations`);
} else {
  console.log('⚠️  No migrations directory found. Please set up Supabase first.');
}

// Final setup instructions
console.log('\n🎉 Setup completed! Next steps:');
console.log('\n1. 📝 Configure your environment:');
console.log('   - Edit .env.local with your Supabase credentials');
console.log('   - Get your credentials from: https://supabase.com/dashboard');

console.log('\n2. 🗄️  Set up your database:');
console.log('   - Run: supabase start (for local development)');
console.log('   - Or connect to your remote Supabase project');

console.log('\n3. 🚀 Start the development server:');
console.log('   - Run: npm run dev');
console.log('   - Open: http://localhost:5173');

console.log('\n4. 📚 Additional setup (optional):');
console.log('   - Configure AI services in .env.local for advanced features');
console.log('   - Set up OCR providers for document processing');
console.log('   - Configure CRM integrations for data import');

console.log('\n📖 Documentation:');
console.log('   - README.md - General project information');
console.log('   - SUPABASE_SETUP.md - Database setup guide');
console.log('   - SUPABASE_CONFIG.md - Configuration details');

console.log('\n🆘 Need help?');
console.log('   - Check the documentation files');
console.log('   - Review the error logs in the browser console');
console.log('   - Ensure all environment variables are set correctly');

console.log('\n✨ Happy coding with Taxify!');
