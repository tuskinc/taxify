-- Setup script for Supabase Storage and Uploads Table
-- Run this in your Supabase SQL Editor

-- 1. Create the uploads table
CREATE TABLE IF NOT EXISTS public.uploads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  file_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable RLS on uploads table
ALTER TABLE public.uploads ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS policies for uploads table
CREATE POLICY "Users can view their own uploads" ON public.uploads
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own uploads" ON public.uploads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own uploads" ON public.uploads
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own uploads" ON public.uploads
  FOR DELETE USING (auth.uid() = user_id);

-- 4. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_uploads_user_id ON public.uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_uploads_created_at ON public.uploads(created_at);

-- 5. Grant necessary permissions
GRANT ALL ON public.uploads TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- 6. Add comments
COMMENT ON TABLE public.uploads IS 'Table to log file uploads with user association';
COMMENT ON COLUMN public.uploads.user_id IS 'Foreign key referencing auth.users';
COMMENT ON COLUMN public.uploads.file_url IS 'URL to the uploaded file in Supabase Storage';

-- 7. Create storage bucket (run this in Supabase Dashboard > Storage)
-- Go to Storage > Create Bucket
-- Name: documents
-- Public: false (for security)
-- File size limit: 50MB (or your preference)
-- Allowed MIME types: application/pdf,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv,image/png,image/jpeg,image/jpg

-- 8. Set up storage policies (run these in Supabase Dashboard > Storage > Policies)
-- Policy 1: Allow authenticated users to upload files
-- Name: Allow authenticated users to upload files
-- Target roles: authenticated
-- USING expression: auth.role() = 'authenticated'
-- WITH CHECK expression: auth.role() = 'authenticated'

-- Policy 2: Allow users to view their own files
-- Name: Allow users to view their own files
-- Target roles: authenticated
-- USING expression: auth.uid()::text = (storage.foldername(name))[1]

-- Policy 3: Allow users to delete their own files
-- Name: Allow users to delete their own files
-- Target roles: authenticated
-- USING expression: auth.uid()::text = (storage.foldername(name))[1]

-- 9. Verify the setup
SELECT 'Uploads table created successfully' as status;
SELECT COUNT(*) as uploads_count FROM public.uploads;
