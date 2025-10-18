# Document Upload Feature Setup Guide

## Overview
This guide will help you set up the complete document upload feature with Supabase Storage integration, real-time UI feedback, and database logging.

## Prerequisites
- Supabase project with admin access
- Environment variables configured
- Supabase client properly initialized

## Setup Steps

### 1. Create Storage Bucket
1. Go to your Supabase Dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **Create Bucket**
4. Configure the bucket:
   - **Name**: `documents`
   - **Public**: `false` (for security)
   - **File size limit**: `50MB` (or your preference)
   - **Allowed MIME types**: 
     ```
     application/pdf,
     application/vnd.ms-excel,
     application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,
     text/csv,
     image/png,
     image/jpeg,
     image/jpg
     ```

### 2. Set Up Storage Policies
1. Go to **Storage** > **Policies** in your Supabase Dashboard
2. Create the following policies for the `documents` bucket:

#### Policy 1: Allow authenticated users to upload files
- **Name**: `Allow authenticated users to upload files`
- **Target roles**: `authenticated`
- **USING expression**: `auth.role() = 'authenticated'`
- **WITH CHECK expression**: `auth.role() = 'authenticated'`

#### Policy 2: Allow users to view their own files
- **Name**: `Allow users to view their own files`
- **Target roles**: `authenticated`
- **USING expression**: `auth.uid()::text = (storage.foldername(name))[1]`

#### Policy 3: Allow users to delete their own files
- **Name**: `Allow users to delete their own files`
- **Target roles**: `authenticated`
- **USING expression**: `auth.uid()::text = (storage.foldername(name))[1]`

### 3. Create Uploads Table
1. Go to **SQL Editor** in your Supabase Dashboard
2. Run the SQL script from `scripts/setup-storage-and-uploads.sql`
3. This will create:
   - `uploads` table with proper RLS policies
   - Indexes for performance
   - Proper permissions

### 4. Verify Setup
Run this query in the SQL Editor to verify everything is working:
```sql
-- Check if uploads table exists
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'uploads';

-- Check storage bucket
SELECT name FROM storage.buckets WHERE name = 'documents';

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'uploads';
```

## Features Implemented

### ✅ Real-time UI Feedback
- **Uploading state**: Shows spinner and "Uploading..." message
- **Success state**: Shows green checkmark and "✅ Upload successful"
- **Error state**: Shows red X and "❌ Upload failed. Try again."
- **File status**: Individual file status indicators

### ✅ Supabase Storage Integration
- Files uploaded to `documents` bucket
- Organized by user ID in folders: `uploads/{user_id}/filename`
- Proper file naming with timestamps
- Support for multiple file types

### ✅ Database Logging
- All uploads logged to `uploads` table
- Tracks file metadata (name, size, type, URL)
- User association for security
- Timestamps for audit trail

### ✅ Security Features
- Row Level Security (RLS) enabled
- Users can only access their own files
- Proper authentication checks
- Secure file storage

## Usage

### For Users
1. Navigate to the Upload page
2. Click "Choose Files" to select documents
3. Watch real-time feedback as files upload
4. See individual file status (uploading/success/error)
5. Files are automatically organized and secured

### For Developers
The upload flow works as follows:
1. User selects files
2. Files are uploaded to Supabase Storage
3. Upload metadata is logged to database
4. UI provides real-time feedback
5. Success/error states are clearly indicated

## File Structure
```
uploads/
├── {user_id}/
│   ├── 1703123456789-abc123.pdf
│   ├── 1703123456790-def456.xlsx
│   └── 1703123456791-ghi789.jpg
```

## Troubleshooting

### Common Issues
1. **Storage bucket not found**: Ensure bucket is created and named `documents`
2. **Permission denied**: Check storage policies are set correctly
3. **Database errors**: Verify uploads table exists and RLS policies are active
4. **File upload fails**: Check file size limits and MIME type restrictions

### Debug Steps
1. Check browser console for errors
2. Verify Supabase connection in network tab
3. Test with small files first
4. Check Supabase logs for server-side errors

## Environment Variables Required
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Next Steps
- Add file preview functionality
- Implement file deletion
- Add progress bars for large files
- Integrate with AI processing pipeline
- Add file categorization features
