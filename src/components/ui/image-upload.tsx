'use client'

import { useState, useRef } from 'react'
import { Button } from './button'
import { Input } from './input'
import { Label } from './label'
import { Upload, X, Image as ImageIcon } from 'lucide-react'

interface ImageUploadProps {
  value?: string
  onChange: (file: string | null) => void
  disabled?: boolean
}

export function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
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

    // Convert file to base64 for preview and upload
    const reader = new FileReader()
    reader.onload = (e) => {
      const base64 = e.target?.result as string
      setPreview(base64)
      onChange(base64)
      setUploading(false)
    }
    reader.onerror = () => {
      alert('Failed to read file')
      setUploading(false)
    }
    reader.readAsDataURL(file)
  }

  const handleRemove = () => {
    setPreview(null)
    onChange(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
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
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={handleRemove}
              disabled={disabled || uploading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div
          className={`
            w-full h-48 border-2 border-dashed border-gray-300 rounded-lg 
            flex flex-col items-center justify-center cursor-pointer
            hover:border-gray-400 transition-colors
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          onClick={handleClick}
        >
          <ImageIcon className="h-12 w-12 text-gray-400 mb-4" />
          <p className="text-sm text-gray-500 mb-2">Click to upload image</p>
          <p className="text-xs text-gray-400">PNG, JPG up to 5MB</p>
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

      {!preview && (
        <Button
          type="button"
          variant="outline"
          onClick={handleClick}
          disabled={disabled || uploading}
          className="w-full"
        >
          <Upload className="h-4 w-4 mr-2" />
          {uploading ? 'Processing...' : 'Upload Image'}
        </Button>
      )}
    </div>
  )
} 