# Supabase Setup for Tax Analysis Platform

This directory contains the database schema, migrations, and configuration for the Tax Analysis Platform.

## Project Structure

```
supabase/
├── config.toml          # Supabase project configuration
├── migrations/          # Database migration files
│   ├── 001_initial_schema.sql
│   ├── 002_row_level_security.sql
│   └── 003_sample_data.sql
├── seed.sql            # Development seed data
└── README.md           # This file
```

## Database Schema

### Core Tables

- **users** - User accounts (extends Supabase auth.users)
- **user_profiles** - User tax profile information
- **tax_scenarios** - User's selected tax analysis scenarios
- **personal_finances** - Personal income and deduction data
- **businesses** - Business entity information
- **business_finances** - Business revenue and expense data
- **tax_data** - Country-specific tax rates, deductions, and credits
- **analysis_results** - AI-generated tax analysis results
- **tax_calendar** - Tax deadlines and important dates

### Key Features

- **Row Level Security (RLS)** - Users can only access their own data
- **Computed Columns** - Automatic calculation of totals and derived values
- **Comprehensive Tax Data** - Support for multiple countries and tax systems
- **Audit Trails** - Created/updated timestamps on all tables
- **Flexible JSON Storage** - For complex tax data and analysis results

## Setup Instructions

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: Tax Analysis Platform
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your users
5. Click "Create new project"

### 2. Get Project Credentials

1. Go to Project Settings → API
2. Copy the following values:
   - **Project URL** (e.g., `https://your-project.supabase.co`)
   - **Anon Key** (public key for client-side access)
   - **Service Role Key** (secret key for server-side access)

### 3. Update Environment Variables

Create or update `.env.local` in your project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### 4. Run Database Migrations

#### Option A: Using Supabase CLI (Recommended)

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Login to Supabase:
   ```bash
   supabase login
   ```

3. Link to your project:
   ```bash
   supabase link --project-ref your-project-ref
   ```

4. Run migrations:
   ```bash
   supabase db push
   ```

#### Option B: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of each migration file in order:
   - `001_initial_schema.sql`
   - `002_row_level_security.sql`
   - `003_sample_data.sql`

### 5. Verify Setup

1. Check that all tables are created in the Table Editor
2. Verify RLS policies are enabled
3. Test authentication in your application

## Database Features

### Row Level Security

All user data is protected by RLS policies ensuring users can only access their own information:

- Users can only view/edit their own profiles
- Personal finances are private to each user
- Business data is isolated per user
- Analysis results are user-specific

### Tax Data Structure

The `tax_data` table stores country-specific tax information in JSON format:

```json
{
  "federal": {
    "2024": [
      {"bracket": 0, "rate": 0.10, "max_income": 11000},
      {"bracket": 1, "rate": 0.12, "max_income": 44725}
    ]
  },
  "state": {
    "california": {"rate": 0.013, "max_income": 1000000}
  }
}
```

### Computed Columns

Several tables use computed columns for automatic calculations:

- `total_income` in `personal_finances`
- `total_deductions` in `personal_finances`
- `total_operating_expenses` in `business_finances`
- `net_income` in `business_finances`

## Development

### Adding New Migrations

1. Create a new file in `migrations/` with the next sequential number
2. Use descriptive names: `004_add_new_feature.sql`
3. Test locally before pushing to production

### Seed Data

The `seed.sql` file contains sample data for development. This is automatically run after migrations in development environments.

## Production Considerations

1. **Backup Strategy**: Enable automatic backups in Supabase
2. **Monitoring**: Set up database monitoring and alerts
3. **Performance**: Monitor query performance and add indexes as needed
4. **Security**: Regularly review RLS policies and access patterns
5. **Scaling**: Consider read replicas for high-traffic scenarios

## Support

For issues with the database setup:

1. Check the Supabase documentation
2. Review the migration files for syntax errors
3. Verify RLS policies are correctly configured
4. Check the Supabase logs for detailed error messages
