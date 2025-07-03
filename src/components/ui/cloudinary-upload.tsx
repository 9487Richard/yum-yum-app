'use client'

import { useState, useRef } from 'react'
import { Button } from './button'
import { Input } from './input'
import { Label } from './label'
import { Upload, X, Image as ImageIcon, Loader } from 'lucide-react'

interface CloudinaryUploadProps {
  value?: string
  onChange: (url: string | null) => void
  disabled?: boolean
}

export function CloudinaryUpload({ value, onChange, disabled }: CloudinaryUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB')
      return
    }

    setUploading(true)

    try {
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)

      // Upload to Cloudinary via API
      const formData = new FormData()
      formData.append('file', file)

      const adminPassword = sessionStorage.getItem('adminPassword')
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'x-admin-password': adminPassword || ''
        },
        body: formData
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Upload failed')
      }

      const result = await response.json()
      setPreview(result.url)
      onChange(result.url)
      
    } catch (error) {
      console.error('Upload error:', error)
      alert(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setPreview(null)
      onChange(null)
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    onChange(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClick = () => {
    if (!uploading && !disabled) {
      fileInputRef.current?.click()
    }
  }

  return (
    <div className="space-y-4">
      <Label>Food Image</Label>
      
      {preview ? (
        <div className="relative">
          <div className="relative w-full h-48 bg-muted border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center p-2">
            <img
              src={preview}
              alt="Preview"
              className="max-w-full max-h-full object-contain"
            />
            {!uploading && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={handleRemove}
                disabled={disabled}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            {uploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="flex items-center gap-2 text-white">
                  <Loader className="h-4 w-4 animate-spin" />
                  <span>Uploading...</span>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div
          className={`
            w-full h-48 border-2 border-dashed border-gray-300 rounded-lg 
            flex flex-col items-center justify-center cursor-pointer
            hover:border-gray-400 transition-colors
            ${disabled || uploading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          onClick={handleClick}
        >
          {uploading ? (
            <div className="flex flex-col items-center">
              <Loader className="h-12 w-12 text-gray-400 mb-4 animate-spin" />
              <p className="text-sm text-gray-500">Uploading...</p>
            </div>
          ) : (
            <>
              <ImageIcon className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-sm text-gray-500 mb-2">Click to upload image</p>
              <p className="text-xs text-gray-400">PNG, JPG up to 5MB</p>
            </>
          )}
        </div>
      )}

      <Input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        disabled={disabled || uploading}
        className="hidden"
      />

      {!preview && !uploading && (
        <Button
          type="button"
          variant="outline"
          onClick={handleClick}
          disabled={disabled}
          className="w-full"
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload Image
        </Button>
      )}
    </div>
  )
} 