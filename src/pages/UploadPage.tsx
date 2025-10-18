import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

// TypeScript interfaces
interface User {
  id: string
  email?: string
  [key: string]: unknown // Allow for additional Supabase user properties
}

interface UploadedFile {
  id?: string
  name: string
  size: number
  type: string
  url?: string
  status: 'uploading' | 'success' | 'error'
  error?: string // Optional error message
}

interface UploadStatus {
  message: string
  type: 'info' | 'success' | 'error'
}

export default function UploadPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [uploading, setUploading] = useState<boolean>(false)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [uploadStatus, setUploadStatus] = useState<UploadStatus | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    let isMounted = true
    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!isMounted) return
        setUser(session?.user as unknown as User ?? null)
        if (!session?.user) {
          navigate('/login')
          return
        }
      } catch (error) {
        console.error('Failed to fetch session:', error)
        if (!isMounted) return
        setUser(null)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    void init().catch(console.error)
    return () => { isMounted = false }
  }, [navigate])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    setUploadStatus({ message: 'Uploading files...', type: 'info' })

    try {
      // Add all files to the uploaded files list with uploading status
      const newFiles: UploadedFile[] = Array.from(files).map(file => ({
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'uploading' as const
      }))
      setUploadedFiles(prev => [...prev, ...newFiles])

      // Process each file
      for (const file of Array.from(files)) {
        try {
          // Generate unique filename
          const fileExt = file.name.split('.').pop()
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt ?? 'txt'}`
          const filePath = `uploads/${user?.id ?? 'anonymous'}/${fileName}`

          // Upload to Supabase storage
          const { error: uploadError } = await supabase.storage
            .from('documents')
            .upload(filePath, file)

          if (uploadError) {
            throw new Error(uploadError.message)
          }

          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('documents')
            .getPublicUrl(filePath)

          // Log upload to database
          const { data: dbData, error: dbError } = await supabase
            .from('document_uploads')
            .insert({
              user_id: user?.id ?? '',
              file_name: file.name,
              file_path: filePath,
              file_size: file.size,
              file_type: file.type,
              upload_method: 'upload'
            })
            .select()
            .single()

          if (dbError) {
            console.error('Database error:', dbError)
            // Continue even if database logging fails
          }

          // Update the file status to success
          setUploadedFiles(prev => 
            prev.map(f => 
              f.name === file.name && f.status === 'uploading' 
                ? { ...f, id: dbData?.id, url: publicUrl, status: 'success' as const }
                : f
            )
          )

        } catch (error) {
          console.error('Upload failed for file:', file.name, error)
          
          // Update the file status to error
          setUploadedFiles(prev => 
            prev.map(f => 
              f.name === file.name && f.status === 'uploading' 
                ? { ...f, status: 'error' as const, error: error instanceof Error ? error.message : 'Upload failed' }
                : f
            )
          )
        }
      }

      setUploadStatus({ message: '✅ Upload completed', type: 'success' })

    } catch (error) {
      console.error('Upload process failed:', error)
      setUploadStatus({ message: '❌ Upload failed. Try again.', type: 'error' })
    } finally {
      setUploading(false)
      // Clear status after 3 seconds
      setTimeout(() => setUploadStatus(null), 3000)
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  if (!user) return null

  return (
    <div className="min-h-screen bg-[#fdf9f6]">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Documents</h1>
          <p className="text-gray-600">Upload your financial documents for AI-powered analysis</p>
        </div>

        {/* Upload Area */}
        <div className="bg-white rounded-lg shadow-sm border-2 border-dashed border-gray-300 p-8 mb-8">
          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Financial Documents</h3>
            <p className="text-gray-600 mb-4">
              Upload PDFs, Excel files, or images of receipts, invoices, and financial statements
            </p>
            <input
              type="file"
              multiple
              accept=".pdf,.xlsx,.xls,.csv,.png,.jpg,.jpeg"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
                uploading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
              }`}
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Choose Files'
              )}
            </label>
          </div>
        </div>

        {/* Upload Status */}
        {uploadStatus && (
          <div className={`mb-6 p-4 rounded-lg ${
            uploadStatus.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800'
              : uploadStatus.type === 'error'
              ? 'bg-red-50 border border-red-200 text-red-800'
              : 'bg-blue-50 border border-blue-200 text-blue-800'
          }`}>
            <div className="flex items-center">
              {uploadStatus.type === 'success' && <CheckCircle className="h-5 w-5 mr-2" />}
              {uploadStatus.type === 'error' && <AlertCircle className="h-5 w-5 mr-2" />}
              {uploadStatus.type === 'info' && <Loader2 className="h-5 w-5 mr-2 animate-spin" />}
              <span className="font-medium">{uploadStatus.message}</span>
            </div>
          </div>
        )}

        {/* Uploaded Files */}
        {uploadedFiles.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Uploaded Files</h3>
            <div className="space-y-3">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{file.name}</p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024).toFixed(1)} KB • {file.type}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {file.status === 'uploading' && (
                      <div className="flex items-center text-blue-600">
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        <span className="text-sm">Uploading...</span>
                      </div>
                    )}
                    {file.status === 'success' && (
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        <span className="text-sm">Uploaded</span>
                      </div>
                    )}
                    {file.status === 'error' && (
                      <div className="flex items-center text-red-600">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        <span className="text-sm">Failed</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Back to Dashboard */}
        <div className="mt-8 text-center">
          <button
            onClick={() => { void navigate('/dashboard') }}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}