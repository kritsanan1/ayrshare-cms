'use client'

import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { Input } from '@/components/ui/Input'
import { Calendar, Image, Video, FileText, Send, Clock, Save } from 'lucide-react'

export interface PostComposerProps {
  onPostCreated?: () => void
}

interface SocialAccount {
  id: string
  platform: string
  accountName: string
  isActive: boolean
}

const platformLabels: Record<string, string> = {
  FACEBOOK: 'Facebook',
  INSTAGRAM: 'Instagram', 
  TWITTER: 'Twitter',
  LINKEDIN: 'LinkedIn',
  TIKTOK: 'TikTok',
  YOUTUBE: 'YouTube',
  LINE: 'LINE',
  PINTEREST: 'Pinterest'
}

const platformColors: Record<string, string> = {
  FACEBOOK: 'bg-blue-500',
  INSTAGRAM: 'bg-pink-500',
  TWITTER: 'bg-sky-500',
  LINKEDIN: 'bg-blue-700',
  TIKTOK: 'bg-black',
  YOUTUBE: 'bg-red-500',
  LINE: 'bg-green-500',
  PINTEREST: 'bg-red-600'
}

export default function PostComposer({ onPostCreated }: PostComposerProps) {
  const [content, setContent] = useState('')
  const [mediaUrls, setMediaUrls] = useState<string[]>([])
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [scheduledTime, setScheduledTime] = useState<string>('')
  const [isScheduled, setIsScheduled] = useState(false)
  const [connectedAccounts, setConnectedAccounts] = useState<SocialAccount[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  useEffect(() => {
    fetchConnectedAccounts()
  }, [])

  const fetchConnectedAccounts = async () => {
    try {
      const response = await fetch('/api/social-accounts')
      if (response.ok) {
        const data = await response.json()
        setConnectedAccounts(data.socialAccounts)
      }
    } catch (error) {
      console.error('Error fetching connected accounts:', error)
    }
  }

  const handlePlatformToggle = (platform: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platform) 
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    )
  }

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return

    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        const url = URL.createObjectURL(file)
        setMediaUrls(prev => [...prev, url])
      }
    })
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    handleFileUpload(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const removeMedia = (index: number) => {
    setMediaUrls(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (isDraft: boolean = false) => {
    if (!content.trim()) return
    if (!isDraft && selectedPlatforms.length === 0) return

    setIsLoading(true)
    try {
      const postData = {
        content,
        mediaUrls,
        scheduledTime: isScheduled && scheduledTime ? scheduledTime : undefined,
        platforms: selectedPlatforms
      }

      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData)
      })

      if (response.ok) {
        // Reset form
        setContent('')
        setMediaUrls([])
        setSelectedPlatforms([])
        setScheduledTime('')
        setIsScheduled(false)
        
        if (onPostCreated) {
          onPostCreated()
        }
      } else {
        const error = await response.json()
        alert(error.error || 'เกิดข้อผิดพลาดในการสร้างโพสต์')
      }
    } catch (error) {
      console.error('Error creating post:', error)
      alert('เกิดข้อผิดพลาดในการสร้างโพสต์')
    } finally {
      setIsLoading(false)
    }
  }

  const characterCount = content.length
  const maxCharacters = 2000 // Reasonable limit for most platforms

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <div className="space-y-6">
        {/* Content Editor */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            เนื้อหาโพสต์
          </label>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="เขียนเนื้อหาโพสต์ของคุณที่นี่..."
            className="min-h-[120px] resize-none"
            maxLength={maxCharacters}
          />
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>กด Enter สำหรับขึ้นบรรทัดใหม่</span>
            <span className={characterCount > maxCharacters * 0.9 ? 'text-red-500' : ''}>
              {characterCount}/{maxCharacters}
            </span>
          </div>
        </div>

        {/* Media Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            รูปภาพและวิดีโอ
          </label>
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              isDragOver 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="flex flex-col items-center space-y-2">
              <div className="flex space-x-2">
                <Image className="h-8 w-8 text-gray-400" />
                <Video className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-600">
                ลากไฟล์มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์
              </p>
              <p className="text-sm text-gray-500">
                รองรับ: JPG, PNG, GIF, MP4, MOV (สูงสุด 10MB)
              </p>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*"
            className="hidden"
            onChange={(e) => handleFileUpload(e.target.files)}
          />
        </div>

        {/* Media Preview */}
        {mediaUrls.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {mediaUrls.map((url, index) => (
              <div key={index} className="relative group">
                <img 
                  src={url} 
                  alt={`Upload ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg"
                />
                <button
                  onClick={() => removeMedia(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Platform Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            เลือกแพลตฟอร์ม ({selectedPlatforms.length} selected)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {connectedAccounts.map((account) => (
              <button
                key={account.id}
                type="button"
                onClick={() => handlePlatformToggle(account.platform)}
                disabled={!account.isActive}
                className={`flex items-center space-x-2 p-3 rounded-lg border transition-all ${
                  selectedPlatforms.includes(account.platform)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                } ${!account.isActive ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className={`w-4 h-4 rounded ${platformColors[account.platform]}`} />
                <div className="text-left flex-1">
                  <div className="font-medium text-sm">
                    {platformLabels[account.platform]}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {account.accountName}
                  </div>
                </div>
                {selectedPlatforms.includes(account.platform) && (
                  <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                )}
              </button>
            ))}
          </div>
          {connectedAccounts.length === 0 && (
            <p className="text-gray-500 text-sm mt-2">
              คุณยังไม่ได้เชื่อมต่อบัญชีโซเชียลมีเดียใดๆ{' '}
              <a href="/settings/accounts" className="text-blue-500 hover:underline">
                เชื่อมต่อบัญชี
              </a>
            </p>
          )}
        </div>

        {/* Scheduling */}
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={isScheduled}
              onChange={(e) => setIsScheduled(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm font-medium text-gray-700">
              กำหนดเวลาโพสต์
            </span>
          </label>

          {isScheduled && (
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <Input
                type="datetime-local"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className="text-sm"
              />
            </div>
          )}
        </div>

        {/* Preview Section */}
        {content && (
          <div className="border-t pt-4">
            <h4 className="font-medium text-gray-700 mb-2">ตัวอย่าง</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="whitespace-pre-wrap text-sm">{content}</div>
              {mediaUrls.length > 0 && (
                <div className="mt-3 text-xs text-gray-500">
                  📎 {mediaUrls.length} ไฟล์สื่อ
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleSubmit(true)}
            disabled={isLoading || !content.trim()}
            className="flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>บันทึกแบบร่าง</span>
          </Button>

          <Button
            type="button"
            onClick={() => handleSubmit(false)}
            disabled={isLoading || !content.trim() || selectedPlatforms.length === 0}
            className="flex items-center space-x-2 flex-1"
          >
            {isScheduled ? (
              <>
                <Clock className="h-4 w-4" />
                <span>กำหนดเวลาโพสต์</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>โพสต์ทันที</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}