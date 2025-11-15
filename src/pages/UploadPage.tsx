import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DocumentUpload from '../components/DocumentUpload';
import { supabase } from '../lib/supabase';
import { Upload, FileText, CheckCircle, XCircle, Clock, ArrowLeft } from 'lucide-react';

interface UploadHistory {
  id: string;
  filename: string;
  status: 'uploaded' | 'failed' | 'processing';
  uploaded_at: string;
  file_size: number;
  file_type: string;
}

const UploadPage: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploadHistory, setUploadHistory] = useState<UploadHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/login');
          return;
        }
        setUser(user);
        loadUploadHistory(user.id);
      } catch (error) {
        console.error('Error getting user:', error);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, [navigate]);

  const loadUploadHistory = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('document_uploads')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      
      setUploadHistory((data || []).map(item => ({
        id: item.id,
        filename: item.filename || 'Unknown file',
        status: item.status || 'uploaded',
        uploaded_at: item.created_at || new Date().toISOString(),
        file_size: item.file_size || 0,
        file_type: item.file_type || 'unknown'
      })));
    } catch (error) {
      console.error('Error loading upload history:', error);
    }
  };

  const handleDataExtracted = (data: any) => {
    console.log('Document data extracted:', data);
    // Navigate to reports page to show the analysis
    navigate('/reports');
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-taxify flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E90FF] mx-auto"></div>
          <p className="mt-4 text-gray-700 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Document Upload</h1>
              <p className="mt-2 text-gray-600">Upload your financial documents for AI analysis</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="btn btn-secondary flex items-center"
              >
                <FileText className="h-4 w-4 mr-2" />
                {showHistory ? 'Hide History' : 'Show History'}
              </button>
              <button
                onClick={handleBack}
                className="btn btn-primary flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Section */}
          <div className="lg:col-span-2">
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Documents</h3>
              <DocumentUpload
                onUploadComplete={handleDataExtracted}
                onError={(error) => console.error('Upload error:', error)}
              />
            </div>
          </div>

          {/* Upload History */}
          <div className="lg:col-span-1">
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Uploads</h3>
              {uploadHistory.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No uploads yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {uploadHistory.map((upload) => (
                    <div key={upload.id} className="flex items-center p-3 bg-gray-50 rounded-3xl">
                      <div className="flex-shrink-0 mr-3">
                        {upload.status === 'uploaded' ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : upload.status === 'failed' ? (
                          <XCircle className="h-5 w-5 text-red-500" />
                        ) : (
                          <Clock className="h-5 w-5 text-yellow-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {upload.filename}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(upload.uploaded_at).toLocaleDateString()} • {upload.file_size} bytes
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          {/* Upload Tips */}
          <div className="card bg-gradient-to-r from-[#1E90FF] to-[#4AA3FF] p-6 mt-6 text-white">
              <h4 className="text-lg font-semibold mb-3">Upload Tips</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="mr-2">📄</span>
                  <span>Supported formats: PDF, DOCX, XLSX, CSV</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">📊</span>
                  <span>Include income statements, tax forms, receipts</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">🔒</span>
                  <span>Files are securely processed and encrypted</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">⚡</span>
                  <span>AI analysis typically takes 30-60 seconds</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
