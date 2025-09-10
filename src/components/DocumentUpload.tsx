import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { supabase } from '../lib/supabase';
import FinancialDataReview from './FinancialDataReview';
import styles from './DocumentUpload.module.css';

const ALLOWED_FILE_TYPES = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'text/csv': ['.csv'],
};

export interface ExtractedData {
  personalFinances: {
    salary_income: number;
    freelance_income: number;
    investment_income: number;
    rental_income: number;
    capital_gains: number;
    retirement_contributions: number;
    mortgage_interest: number;
    property_taxes: number;
    charitable_donations: number;
    medical_expenses: number;
    childcare_costs: number;
    education_expenses: number;
    other_deductions: number;
  };
  businessFinances: {
    revenue: number;
    employee_costs: number;
    equipment: number;
    rent: number;
    utilities: number;
    marketing: number;
    travel_expenses: number;
    office_supplies: number;
    professional_services: number;
    insurance: number;
    other_expenses: number;
  };
}

interface DocumentUploadProps {
  onUploadComplete: (data: ExtractedData) => void;
  onError: (error: string) => void;
}

export default function DocumentUpload({ onUploadComplete, onError }: DocumentUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsUploading(true);
    setProgress(0);
    setFileName(file.name);

    try {
      // 1. Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const randomFileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = `uploads/${randomFileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      setProgress(30);

      // 2. Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      setProgress(60);

      // 3. Send to API for processing
      const response = await fetch('/api/process-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileUrl: publicUrl,
          fileName: file.name,
          fileType: file.type,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process document');
      }

      const result = await response.json();
      setProgress(100);
      setExtractedData(result.data);
    } catch (error) {
      console.error('Upload error:', error);
      onError(error instanceof Error ? error.message : 'Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  }, [onUploadComplete, onError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ALLOWED_FILE_TYPES,
    disabled: isUploading,
    maxFiles: 1,
  });

  if (extractedData) {
    return (
      <FinancialDataReview
        data={extractedData}
        onSave={(data) => {
          onUploadComplete(data);
          setExtractedData(null);
          setFileName(null);
        }}
        onBack={() => setExtractedData(null)}
      />
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
        } ${isUploading ? 'opacity-70 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        <div className="space-y-4">
          <div className="mx-auto w-12 h-12 text-blue-500">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          {isUploading ? (
            <div className="space-y-2">
              <p className="font-medium">Processing {fileName}...</p>
              <div className={styles.progressBar}>
                <div 
                  className={styles.progressFill}
                  style={{ '--progress-width': `${progress}%` } as React.CSSProperties}
                ></div>
              </div>
              <p className="text-sm text-gray-500">{progress}% complete</p>
            </div>
          ) : (
            <>
              <h3 className="text-lg font-medium text-gray-900">
                {isDragActive ? 'Drop the file here' : 'Upload financial documents'}
              </h3>
              <p className="text-sm text-gray-500">
                Drag & drop your PDF, DOCX, XLSX, or CSV file here, or click to select
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Supported formats: .pdf, .docx, .xlsx, .csv (Max 10MB)
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
