-- Create a storage bucket for document uploads and configure policies
-- Run this in Supabase SQL Editor or via CLI after linking your project

-- Create bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('documents', 'documents', true)
on conflict (id) do nothing;

-- Enable RLS on storage.objects (already enabled by default in Supabase)
-- Define policies for the 'documents' bucket

-- Allow anyone to read files in the public bucket
create policy "Public read access for documents"
on storage.objects for select
using (bucket_id = 'documents');

-- Allow authenticated users to upload into the bucket
create policy "Authenticated users can upload documents"
on storage.objects for insert
with check (
  bucket_id = 'documents' and auth.role() = 'authenticated'
);

-- Allow owners (uploader) to update their own files
create policy "Owners can update their documents"
on storage.objects for update
using (
  bucket_id = 'documents' and auth.uid() = owner
)
with check (
  bucket_id = 'documents' and auth.uid() = owner
);

-- Allow owners (uploader) to delete their own files
create policy "Owners can delete their documents"
on storage.objects for delete
using (
  bucket_id = 'documents' and auth.uid() = owner
);


