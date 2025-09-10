# Document Upload Feature

This feature allows users to upload financial documents (PDF, DOCX, XLSX, CSV) for automatic data extraction and processing.

## Features

- Drag and drop file upload interface
- Support for multiple document formats
- Progress tracking during upload
- AI-powered data extraction using Claude
- Review and edit extracted data before saving
- Secure file storage with Supabase

## Setup

1. **Environment Variables**
   Copy `.env.local.template` to `.env.local` and fill in the required values:
   ```bash
   cp .env.local.template .env.local
   ```

2. **Required Environment Variables**
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
   CLAUDE_API_KEY=your-claude-api-key
   ```

3. **Supabase Setup**
   - Create a new bucket called `documents` in your Supabase Storage
   - Set the following bucket policies:
     ```sql
     -- Allow public read access to files
     create policy "Public Access"
       on storage.objects for select
       using ( bucket_id = 'documents' );
     
     -- Allow authenticated users to upload files
     create policy "Allow uploads"
       on storage.objects for insert
       to authenticated
       with check (bucket_id = 'documents');
     ```

## Usage

1. **Import the Component**
   ```tsx
   import DocumentUpload from './components/DocumentUpload';
   ```

2. **Use in Your Form**
   ```tsx
   function MyForm() {
     const handleUploadComplete = (data) => {
       // Handle the extracted data
       console.log('Extracted data:', data);
     };

     const handleError = (error) => {
       console.error('Upload error:', error);
     };

     return (
       <div>
         <h2>Upload Financial Documents</h2>
         <DocumentUpload 
           onUploadComplete={handleUploadComplete}
           onError={handleError}
         />
       </div>
     );
   }
   ```

## Implementation Details

### Components

1. **DocumentUpload**
   - Handles file upload UI and processing
   - Shows upload progress
   - Manages the upload flow

2. **FinancialDataReview**
   - Displays extracted data in an editable format
   - Allows users to review and modify values before saving

### API Endpoint

`/api/process-document`
- Handles file processing and data extraction
- Supports multiple file formats
- Returns structured financial data

### Data Flow

1. User uploads a document
2. File is uploaded to Supabase Storage
3. File content is extracted based on type
4. Extracted text is sent to Claude for data extraction
5. Structured data is returned to the client
6. User reviews and confirms the data
7. Data is saved to the application state

## Error Handling

- File type validation
- Upload progress tracking
- Error messages for failed uploads
- Graceful handling of processing failures

## Dependencies

- `react-dropzone`: File upload UI
- `@supabase/supabase-js`: File storage
- `pdf-parse`: PDF text extraction
- `docx-parser`: DOCX text extraction
- `xlsx`: Excel file parsing
- `csv-parse`: CSV file parsing
- `@anthropic-ai/sdk`: AI data extraction

## Testing

Test the component with various file types and sizes to ensure proper handling and error messages.
