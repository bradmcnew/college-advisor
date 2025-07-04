'use client'

import { Upload, User, X } from 'lucide-react'
import Image from 'next/image'
import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { removeUserProfileImage, uploadUserProfileImage } from '../actions'

interface ProfileImageUploadProps {
  currentImageUrl?: string | null
  userName?: string | null
}

export const ProfileImageUpload = ({ currentImageUrl, userName }: ProfileImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl ?? null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      toast.error('File size must be less than 5MB')
      return
    }

    // Create preview URL
    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)

    // Upload the file
    void handleUpload(file)
  }

  const handleUpload = async (file: File) => {
    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('image', file)

      const result = await uploadUserProfileImage(formData)

      if (result.success) {
        toast.success('Profile image updated successfully!')
        setPreviewUrl(result.imageUrl)
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload image. Please try again.')
      // Reset preview on error
      setPreviewUrl(currentImageUrl ?? null)
    } finally {
      setIsUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveImage = async () => {
    if (!previewUrl) return

    setIsUploading(true)

    try {
      await removeUserProfileImage()
      setPreviewUrl(null)
      toast.success('Profile image removed successfully!')
    } catch (error) {
      console.error('Remove error:', error)
      toast.error('Failed to remove image. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const triggerFileSelect = () => {
    fileInputRef.current?.click()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Image</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center space-y-4">
          {/* Image Preview */}
          <div className="relative">
            <div className="border-border bg-muted aspect-square h-32 w-32 overflow-hidden rounded-full border-4">
              {previewUrl ? (
                <Image
                  src={previewUrl}
                  alt={userName ?? 'Profile'}
                  className="h-full w-full object-cover object-center"
                  width={128}
                  height={128}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <User className="text-muted-foreground h-16 w-16" />
                </div>
              )}
            </div>

            {/* Remove button */}
            {previewUrl && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute -right-2 -top-2 h-8 w-8 rounded-full p-0"
                onClick={handleRemoveImage}
                disabled={isUploading}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Upload Controls */}
          <div className="flex flex-col items-center space-y-2">
            <Button
              type="button"
              variant="outline"
              onClick={triggerFileSelect}
              disabled={isUploading}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              {isUploading ? 'Uploading...' : previewUrl ? 'Change Image' : 'Upload Image'}
            </Button>

            <p className="text-muted-foreground text-center text-xs">JPG, PNG or GIF. Max 5MB.</p>
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={isUploading}
            className="hidden"
          />
        </div>
      </CardContent>
    </Card>
  )
}
