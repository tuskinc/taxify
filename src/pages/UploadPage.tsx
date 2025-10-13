import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react'

// TypeScript interfaces
interface User {
  id: string
  email?: string
  [key: string]: any // Allow for additional Supabase user properties
}

interface UploadedFile {
  name: string
  size: number
  type: string
  processed: boolean
  data?: any // Optional processed data from AI
  error?: string // Optional error message
}

export default function UploadPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [uploading, setUploading] = useState<boolean>(false)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    let isMounted = true
    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!isMounted) return
        setUser(session?.user ?? null)
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
    void init()
    return () => { isMounted = false }
  }, [navigate])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    try {
      for (const file of Array.from(files)) {
        // Upload to Supabase Storage
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = `documents/${user.id}/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, file)

        if (uploadError) {
          console.error('Upload error:', uploadError)
          setUploadedFiles(prev => [...prev, {
            name: file.name,
            size: file.size,
            type: file.type,
            processed: false,
            error: 'Failed to upload file to storage'
          }])
          continue
        }
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('documents')
          .getPublicUrl(filePath)

        // Process document with AI
        // Process document with AI
        try {
          const response = await fetch('/api/process-document', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fileUrl: publicUrl,
              fileName: file.name,
              fileType: file.type
            })
          })

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }

          const result = await response.json()
          
          if (result.success) {
            setUploadedFiles(prev => [...prev, {
              name: file.name,
              size: file.size,
              type: file.type,
              processed: true,
              data: result.data
            }])
          } else {
            setUploadedFiles(prev => [...prev, {
              name: file.name,
              size: file.size,
              type: file.type,
              processed: false,
              error: result.error || 'Processing failed'
            }])
          }
        } catch (error) {
          console.error('API call failed:', error)
          setUploadedFiles(prev => [...prev, {
            name: file.name,
            size: file.size,
            type: file.type,
            processed: false,
            error: 'Failed to process document'
          }])
        }      }
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setUploading(false)
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
              {uploading ? 'Uploading...' : 'Choose Files'}
            </label>
          </div>
        </div>

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
                    {file.processed ? (
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        <span className="text-sm">Processed</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-red-600">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        <span className="text-sm">Error</span>
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
            onClick={() => navigate('/dashboard')}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}
