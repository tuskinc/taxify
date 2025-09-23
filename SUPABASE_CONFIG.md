# Supabase Configuration for Taxify App

## Project Details
- **Project ID**: `fiophmtlfuqswzinckxv`
- **Project Name**: `taxify`
- **Region**: `us-east-2`
- **Status**: `ACTIVE_HEALTHY`

## Environment Variables
Add these to your `.env` file:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://fiophmtlfuqswzinckxv.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpb3BobXRsZnVxc3d6aW5ja3h2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4MTcyNDUsImV4cCI6MjA3MjM5MzI0NX0.4prqP1PkVt-6mB_dsoCfH06e0_sfXuFhE7hUmBWX5zs

# Encryption Key (set this in Supabase dashboard under Settings > API)
# app.encryption_key=your_32_character_encryption_key_here
```

## Database Schema Applied

### ✅ Migrations Applied:
1. `create_initial_schema` - Core database tables
2. `setup_row_level_security` - Security policies
3. `insert_sample_tax_data` - Sample tax data
4. `fix_function_security` - Function security
5. `004_storage_documents` - File storage configuration
6. `add_missing_tables` - New app tables
7. `add_indexes_and_rls` - Performance indexes and RLS
8. `add_functions_and_triggers` - Database functions
9. `add_tax_calculation_functions` - Tax calculation logic
10. `create_dashboard_view` - Dashboard data view
11. `add_crm_tokens_functionality` - CRM integration with encryption

### ✅ Tables Created:
- `users` - User profiles with tax information
- `personal_finances` - Personal income and deductions
- `business_finances` - Business revenue and expenses
- `document_uploads` - File upload tracking
- `tax_reports` - Generated tax analysis reports
- `user_sessions` - User session management
- `notifications` - User notifications
- `app_settings` - User preferences
- `audit_log` - Change tracking
- `crm_connections` - CRM OAuth tokens (encrypted)
- `data_sources` - Data import tracking
- `tax_data` - Country-specific tax information
- `tax_calendar` - Tax deadlines

### ✅ Features Enabled:
- Row Level Security (RLS) on all tables
- Automatic token encryption for CRM connections
- Tax calculation functions
- Dashboard data aggregation view
- File storage with proper policies
- Audit logging for data changes
- User session management
- Notification system

## Next Steps:
1. Copy the environment variables to your `.env` file
2. Set the encryption key in Supabase dashboard (Settings > API)
3. The app is now ready to connect to the database!

## Database URL:
https://fiophmtlfuqswzinckxv.supabase.co
