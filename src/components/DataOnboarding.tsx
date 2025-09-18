import { useState } from 'react';
import DocumentUpload from './DocumentUpload';
import PhotoCapture from './PhotoCapture';
import CRMConnect from './CRMConnect';

interface DataOnboardingProps {
  onComplete: (data: unknown) => void;
  onError: (error: string) => void;
}

export default function DataOnboarding({ onComplete, onError }: DataOnboardingProps) {
  const [mode, setMode] = useState<'choice' | 'upload' | 'photo' | 'crm'>('choice');

  if (mode === 'upload') {
    return (
      <DocumentUpload
        onUploadComplete={(data) => { onComplete(data); }}
        onError={onError}
      />
    );
  }

  if (mode === 'photo') {
    return (
      <PhotoCapture
        onComplete={(data) => { onComplete(data); }}
        onError={onError}
      />
    );
  }

  if (mode === 'crm') {
    return (
      <CRMConnect
        onComplete={(data) => { onComplete(data); }}
        onError={onError}
      />
    );
  }

  return (
    <section
      className="w-full max-w-3xl mx-auto p-24px bg-white rounded-lg shadow-md"
      aria-labelledby="data-onboarding-heading"
    >
      <h2 id="data-onboarding-heading" className="text-xl font-semibold mb-16px">Add your financial data</h2>
      <p className="text-sm text-gray-600 mb-16px">Choose one or more methods. You can add additional sources later.</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-16px">
        <button
          type="button"
          className="card p-16px text-left hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          onClick={() => { setMode('upload'); }}
          aria-labelledby="option-upload-title"
          aria-describedby="option-upload-desc option-upload-extra"
        >
          <h3 id="option-upload-title" className="font-medium">Upload documents</h3>
          <p id="option-upload-desc" className="text-sm text-gray-600 mt-4px">PDF, Excel, CSV, Word</p>
          <span id="option-upload-extra" className="sr-only">Opens document upload to add files.</span>
        </button>
        <button
          type="button"
          className="card p-16px text-left hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          onClick={() => { setMode('photo'); }}
          aria-labelledby="option-photo-title"
          aria-describedby="option-photo-desc option-photo-extra"
        >
          <h3 id="option-photo-title" className="font-medium">Take photos</h3>
          <p id="option-photo-desc" className="text-sm text-gray-600 mt-4px">Receipts, invoices, forms</p>
          <span id="option-photo-extra" className="sr-only">Opens camera flow to capture images of documents.</span>
        </button>
        <button
          type="button"
          className="card p-16px text-left hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          onClick={() => { setMode('crm'); }}
          aria-labelledby="option-crm-title"
          aria-describedby="option-crm-desc option-crm-extra"
        >
          <h3 id="option-crm-title" className="font-medium">Connect CRM/Accounting</h3>
          <p id="option-crm-desc" className="text-sm text-gray-600 mt-4px">QuickBooks, Xero, etc.</p>
          <span id="option-crm-extra" className="sr-only">Connect your accounting system to import data securely.</span>
        </button>
      </div>
    </section>
  );
}


