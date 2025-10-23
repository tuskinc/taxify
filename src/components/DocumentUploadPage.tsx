import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Camera, FileText, Building2, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react'

interface DocumentUploadPageProps {
  onUploadComplete: (data: any) => void
  onBackToDashboard: () => void
}

export default function DocumentUploadPage({ onUploadComplete, onBackToDashboard }: DocumentUploadPageProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setUploadedFiles(prev => [...prev, ...acceptedFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    multiple: true
  })

  const handleFileUpload = async () => {
    if (uploadedFiles.length === 0) {
      setError('Please select files to upload')
      return
    }

    setUploading(true)
    setUploadStatus('uploading')
    setError('')
    setUploadProgress(0)

    try {
      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i)
        await new Promise(resolve => setTimeout(resolve, 200))
      }

      // Simulate successful upload
      setUploadStatus('success')
      setUploadProgress(100)

      // Call the completion handler after a short delay
      setTimeout(() => {
        onUploadComplete({
          files: uploadedFiles,
          uploadDate: new Date().toISOString(),
          status: 'completed'
        })
      }, 1000)

    } catch (error) {
      setUploadStatus('error')
      setError('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleTakePicture = () => {
    // Open camera/file input for photo capture
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.capture = 'environment'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        setUploadedFiles(prev => [...prev, file])
      }
    }
    input.click()
  }

  const handleConnectCRM = () => {
    // Navigate to CRM integration
    console.log('Navigate to CRM connection')
  }

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const uploadOptions = [
    {
      title: 'Take Picture',
      description: 'Capture documents with your camera',
      icon: Camera,
      action: handleTakePicture,
      color: 'bg-blue-500 hover:bg-blue-600',
      disabled: uploading
    },
    {
      title: 'Upload Documents',
      description: 'Select files from your device',
      icon: Upload,
      action: () => document.getElementById('file-upload')?.click(),
      color: 'bg-green-500 hover:bg-green-600',
      disabled: uploading
    },
    {
      title: 'Connect to CRM',
      description: 'Import data from your CRM system',
      icon: Building2,
      action: handleConnectCRM,
      color: 'bg-purple-500 hover:bg-purple-600',
      disabled: uploading
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="page-container">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center">
              <button
                onClick={onBackToDashboard}
                className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <div className="ml-3">
                <h1 className="text-2xl font-bold text-gray-900">Document Upload</h1>
                <p className="text-sm text-gray-600">Upload your financial documents for analysis</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="page-container py-8">
        {/* Upload Options */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Choose Upload Method</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {uploadOptions.map((option, index) => {
              const Icon = option.icon
              return (
                <button
                  key={index}
                  onClick={option.action}
                  disabled={option.disabled}
                  className={`${option.color} ${option.disabled ? 'opacity-50 cursor-not-allowed' : ''} text-white p-6 rounded-lg text-left transition-colors`}
                >
                  <div className="flex items-center mb-4">
                    <Icon className="h-8 w-8 mr-3" />
                    <div>
                      <h3 className="font-medium text-lg">{option.title}</h3>
                      <p className="text-sm opacity-90">{option.description}</p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* File Drop Zone */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Or Drag & Drop Files</h2>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
              isDragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            } ${uploading ? 'pointer-events-none opacity-50' : ''}`}
          >
            <input {...getInputProps()} id="file-upload" />
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            {isDragActive ? (
              <p className="text-lg text-blue-600">Drop the files here...</p>
            ) : (
              <div>
                <p className="text-lg text-gray-600 mb-2">
                  Drag & drop files here, or click to select
                </p>
                <p className="text-sm text-gray-500">
                  Supports PDF, DOC, DOCX, JPG, PNG, CSV, XLS, XLSX
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Uploaded Files */}
        {uploadedFiles.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Selected Files</h2>
            <div className="space-y-3">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{file.name}</p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    disabled={uploading}
                    className="text-red-600 hover:text-red-800 disabled:opacity-50"
                  >
                    <AlertCircle className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Progress */}
        {uploading && (
          <div className="mb-8">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Uploading Files</h3>
                <span className="text-sm text-gray-500">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* Upload Status */}
        {uploadStatus === 'success' && (
          <div className="mb-8">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center">
                <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
                <div>
                  <h3 className="text-lg font-medium text-green-800">Upload Successful!</h3>
                  <p className="text-sm text-green-700">
                    Your documents have been uploaded and are being processed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex items-center">
                <AlertCircle className="h-6 w-6 text-red-600 mr-3" />
                <div>
                  <h3 className="text-lg font-medium text-red-800">Upload Error</h3>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            onClick={onBackToDashboard}
            disabled={uploading}
            className="btn btn-ghost disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleFileUpload}
            disabled={uploading || uploadedFiles.length === 0}
            className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Uploading...
              </>
            ) : (
              'Upload & Process'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
