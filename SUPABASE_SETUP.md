# 🚀 Supabase Setup Guide for Tax Analysis Platform

## Quick Start (5 Minutes)

### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **"New Project"**
3. Fill in project details:
   - **Name**: `Tax Analysis Platform`
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your location
4. Click **"Create new project"** (takes 2-3 minutes)

### Step 2: Get Your Credentials
1. In your new project, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (looks like: `https://abcdefgh.supabase.co`)
   - **Anon Key** (starts with `eyJ...`)

### Step 3: Update Environment Variables
1. Open `.env.local` in your project root
2. Replace the placeholder values with your actual credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-key-here
```

### Step 4: Run Database Setup
Choose one method:

#### Option A: Supabase Dashboard (Easiest)
1. Go to **SQL Editor** in your Supabase dashboard
2. Copy and paste each file in this order:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_row_level_security.sql`
   - `supabase/migrations/003_sample_data.sql`
   - `supabase/migrations/004_storage_documents.sql`
   - `supabase/migrations/005_align_users_table.sql`
3. Click **"Run"** for each file

#### Option B: Supabase CLI (Advanced)
```bash
# Install CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref your-project-ref

# Push migrations (includes new storage and users alignment)
supabase db push
```

### Step 5: Verify Setup
1. Go to **Table Editor** in Supabase
2. You should see these tables:
   - `users`
   - `tax_scenarios`
   - `personal_finances`
   - `businesses`
   - `business_finances`
   - `tax_data`
   - `analysis_results`
   - `tax_calendar`

### Step 6: Test Your App
1. Start your development server:
   ```bash
   npm run dev
   ```
2. Open `http://localhost:5173`
3. Try signing up with a test email
4. Complete the profile setup

## 🔧 What Gets Created

### Database Tables
- **User Management**: `users`
- **Financial Data**: `personal_finances`, `businesses`, `business_finances`
- **Tax Analysis**: `tax_scenarios`, `analysis_results`
- **Tax Data**: `tax_data`, `tax_calendar`

### Security Features
- **Row Level Security (RLS)**: Users can only see their own data
- **Authentication**: Secure user signup/login
- **Data Validation**: All data is validated before storage

### Sample Data
- Tax rates for US, Canada, UK
- Sample tax calendar with deadlines
- Test analysis results

## 🚨 Troubleshooting

### Common Issues

**"Invalid API key"**
- Check that you copied the full anon key
- Make sure there are no extra spaces

**"Failed to fetch"**
- Verify your Supabase URL is correct
- Check that your project is not paused

**"Table doesn't exist"**
- Make sure you ran all 3 migration files
- Check the order: schema → security → sample data

**"Permission denied"**
- Verify RLS policies are enabled
- Check that you're authenticated

### Getting Help
1. Check the Supabase logs in your dashboard
2. Look at the browser console for errors
3. Verify your `.env.local` file is correct

## 🎯 Next Steps

Once setup is complete:
1. **Test the full flow**: Sign up → Profile → Scenario → Data → Analysis
2. **Add real data**: Enter your actual financial information
3. **Generate reports**: Test the PDF download feature
4. **Customize**: Modify tax rates for your country

## 📊 Database Schema Overview

```
users (auth + profile fields)
├── tax_scenarios (analysis type)
├── personal_finances (income/deductions)
├── businesses (business entities)
│   └── business_finances (revenue/expenses)
└── analysis_results (AI analysis)

tax_data (country tax info)
tax_calendar (deadlines)
```

## 🔐 Security Notes

- All user data is isolated by RLS policies
- API keys are safe to use in frontend (anon key)
- Never commit service role keys to git
- All data is encrypted in transit and at rest

---

**Need help?** Check the [Supabase Documentation](https://supabase.com/docs) or create an issue in the project repository.
