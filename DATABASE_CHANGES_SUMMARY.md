# Taxify App Database Changes Summary

## Overview
This document summarizes all database changes required for the Taxify tax planning application, including new tables, modifications to existing tables, and additional functionality.

## Migration Files

### 1. `001_initial_schema.sql` - Core Schema
- **Users table**: Basic user information extending Supabase auth
- **User profiles**: Tax filing status, dependents, country
- **Personal finances**: Income, deductions, credits
- **Business finances**: Revenue, expenses, net income
- **Tax scenarios**: Personal, business, or combined planning
- **Analysis results**: AI-generated tax analysis data
- **Tax data**: Country-specific tax rates and rules
- **Tax calendar**: Important tax deadlines

### 2. `002_row_level_security.sql` - Security Policies
- Row Level Security (RLS) enabled on all tables
- User-specific data access policies
- Secure data isolation between users

### 3. `004_storage_documents.sql` - File Storage
- Document storage bucket configuration
- File upload/download policies
- Secure document access controls

### 4. `006_crm_tokens.sql` - CRM Integration
- **CRM connections table**: OAuth tokens for QuickBooks, Xero, etc.
- **Token encryption**: Automatic encryption of sensitive tokens
- **Data sources table**: Track data import provenance
- **Encryption functions**: Secure token storage and retrieval

### 5. `007_taxify_app_complete.sql` - Complete App Schema (NEW)

## New Tables Added in Migration 007

### Document Uploads
```sql
CREATE TABLE public.document_uploads (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  upload_method TEXT CHECK (upload_method IN ('camera', 'upload', 'crm')),
  processing_status TEXT DEFAULT 'pending',
  extracted_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Tax Reports
```sql
CREATE TABLE public.tax_reports (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  report_id TEXT UNIQUE NOT NULL,
  report_type TEXT CHECK (report_type IN ('personal', 'business', 'combined')),
  total_taxable_income DECIMAL(15,2) NOT NULL,
  estimated_tax_liability DECIMAL(15,2) NOT NULL,
  tax_savings DECIMAL(15,2) NOT NULL,
  money_saved DECIMAL(15,2) NOT NULL,
  report_data JSONB NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### User Sessions
```sql
CREATE TABLE public.user_sessions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  session_data JSONB,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Notifications
```sql
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  type TEXT CHECK (type IN ('info', 'warning', 'success', 'error')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### App Settings
```sql
CREATE TABLE public.app_settings (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  setting_key TEXT NOT NULL,
  setting_value JSONB NOT NULL,
  UNIQUE(user_id, setting_key)
);
```

### Audit Log
```sql
CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Table Modifications

### User Profiles Updates
- Added `country` field (defaults to 'US')
- Added `filing_status` field (defaults to 'single')
- Added `dependents` field (defaults to 0)
- Added `tax_scenarios` array field

### Personal Finances Updates
- Added `annual_income` field
- Added `deductions` field
- Added `credits` field
- Added `other_income` field

### Business Finances Updates
- Added `annual_revenue` field
- Added `business_expenses` field

## New Functions

### Report Generation
- `generate_report_id()`: Creates unique report identifiers
- `get_latest_tax_report(user_id)`: Retrieves user's most recent report
- `calculate_tax_liability(income, filing_status, dependents)`: Calculates estimated taxes

### Utility Functions
- `cleanup_old_sessions()`: Removes expired user sessions
- `create_default_user_settings()`: Sets up default preferences for new users

## Views

### User Dashboard View
```sql
CREATE VIEW public.user_dashboard AS
SELECT 
  u.id as user_id,
  u.email,
  up.filing_status,
  up.dependents,
  COALESCE(pf.annual_income + pf.other_income - pf.deductions, 0) as personal_taxable_income,
  COALESCE(bf.annual_revenue - bf.business_expenses, 0) as business_net_income,
  (SELECT COUNT(*) FROM document_uploads WHERE user_id = u.id) as documents_uploaded,
  (SELECT COUNT(*) FROM tax_reports WHERE user_id = u.id) as reports_generated,
  (SELECT COUNT(*) FROM notifications WHERE user_id = u.id AND is_read = FALSE) as unread_notifications
FROM users u
LEFT JOIN user_profiles up ON u.id = up.user_id
LEFT JOIN personal_finances pf ON u.id = pf.user_id
LEFT JOIN business_finances bf ON u.id = bf.user_id;
```

## Security Features

### Row Level Security (RLS)
- All tables have RLS enabled
- Users can only access their own data
- Secure data isolation between users

### Token Encryption
- CRM OAuth tokens are automatically encrypted
- Uses AES-256 encryption with compression
- Tokens are base64-encoded for storage

### Audit Trail
- All data changes are logged
- Tracks user actions and system modifications
- Includes IP address and user agent information

## Sample Data

### Tax Rates (US 2024)
- Federal tax brackets for different filing statuses
- Standard deduction amounts
- Tax credit information

### Tax Calendar
- Filing deadlines
- Payment due dates
- Quarterly estimated tax dates
- Extension deadlines

## Performance Optimizations

### Indexes
- User ID indexes on all user-related tables
- Status indexes for filtering
- Composite indexes for common queries
- Partial indexes for unread notifications

### Triggers
- Automatic `updated_at` timestamp updates
- Default settings creation for new users
- Session cleanup automation

## Data Relationships

```
users (1) ←→ (1) user_profiles
users (1) ←→ (1) personal_finances
users (1) ←→ (1) business_finances
users (1) ←→ (*) document_uploads
users (1) ←→ (*) tax_reports
users (1) ←→ (*) crm_connections
users (1) ←→ (*) notifications
users (1) ←→ (*) app_settings
users (1) ←→ (*) user_sessions
```

## API Endpoints Supported

The database schema supports all the following app features:

1. **User Authentication & Profiles**
   - User registration/login
   - Profile setup and management
   - Filing status and dependent information

2. **Document Management**
   - File uploads (camera, file picker, CRM)
   - Document processing status tracking
   - Extracted data storage

3. **Financial Data**
   - Personal income and deductions
   - Business revenue and expenses
   - Tax scenario planning

4. **Report Generation**
   - Tax liability calculations
   - Savings analysis
   - Report history and retrieval

5. **CRM Integration**
   - OAuth token management
   - Secure token storage
   - Data source tracking

6. **User Experience**
   - Session management
   - Notifications system
   - App preferences
   - Dashboard data aggregation

## Migration Order

1. Run `001_initial_schema.sql` first
2. Run `002_row_level_security.sql` for security
3. Run `004_storage_documents.sql` for file storage
4. Run `005_align_users_table.sql` for user alignment
5. Run `006_crm_tokens.sql` for CRM integration
6. Run `007_taxify_app_complete.sql` for complete app functionality

## Environment Variables Required

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Encryption Key (set in Supabase)
app.encryption_key=your_32_character_encryption_key
```

This comprehensive database schema provides all the necessary tables, functions, and security features to support the complete Taxify tax planning application.
