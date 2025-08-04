
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { PlusIcon, TrashIcon, CheckCircleIcon, XCircleIcon } from 'lucide-react'

interface SocialAccount {
  id: string
  platform: string
  accountName: string
  accountId: string
  isActive: boolean
  createdAt: string
  _count: {
    posts: number
  }
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

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<SocialAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    platform: 'FACEBOOK',
    accountName: '',
    accountId: '',
    accessToken: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchAccounts()
  }, [])

  const fetchAccounts = async () => {
    try {
      const response = await fetch('/api/social-accounts')
      if (response.ok) {
        const data = await response.json()
        setAccounts(data.socialAccounts)
      }
    } catch (error) {
      console.error('Error fetching accounts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.accountName || !formData.accountId) return

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/social-accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        await fetchAccounts()
        setFormData({
          platform: 'FACEBOOK',
          accountName: '',
          accountId: '',
          accessToken: ''
        })
        setShowAddForm(false)
      } else {
        const error = await response.json()
        alert(error.error || 'เกิดข้อผิดพลาดในการเชื่อมต่อบัญชี')
      }
    } catch (error) {
      console.error('Error adding account:', error)
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อบัญชี')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteAccount = async (accountId: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบบัญชีนี้?')) return

    try {
      const response = await fetch(`/api/social-accounts/${accountId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchAccounts()
      } else {
        alert('เกิดข้อผิดพลาดในการลบบัญชี')
      }
    } catch (error) {
      console.error('Error deleting account:', error)
      alert('เกิดข้อผิดพลาดในการลบบัญชี')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">บัญชีโซเชียลมีเดีย</h1>
          <p className="text-gray-600">จัดการบัญชีโซเชียลมีเดียที่เชื่อมต่อ</p>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
          <PlusIcon className="w-4 h-4" />
          เชื่อมต่อบัญชีใหม่
        </Button>
      </div>

      {/* Connected Accounts */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            บัญชีที่เชื่อมต่อ ({accounts.length})
          </h2>
        </div>

        {accounts.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {accounts.map((account) => (
              <div key={account.id} className="p-6 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-lg ${platformColors[account.platform]} flex items-center justify-center text-white font-bold`}>
                    {platformLabels[account.platform]?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {platformLabels[account.platform]}
                    </h3>
                    <p className="text-sm text-gray-600">{account.accountName}</p>
                    <p className="text-xs text-gray-500">
                      เชื่อมต่อเมื่อ {new Date(account.createdAt).toLocaleDateString('th-TH')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      {account.isActive ? (
                        <CheckCircleIcon className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircleIcon className="w-5 h-5 text-red-500" />
                      )}
                      <span className={`text-sm ${account.isActive ? 'text-green-600' : 'text-red-600'}`}>
                        {account.isActive ? 'ใช้งานได้' : 'ไม่ใช้งาน'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {account._count.posts} โพสต์
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteAccount(account.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <div className="text-4xl mb-4">🔗</div>
            <p>ยังไม่ได้เชื่อมต่อบัญชีโซเชียลมีเดียใดๆ</p>
            <p className="text-sm mt-1">เริ่มต้นด้วยการเชื่อมต่อบัญชีแรกของคุณ</p>
          </div>
        )}
      </div>

      {/* Add Account Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">เชื่อมต่อบัญชีใหม่</h2>
              <Button
                variant="outline"
                onClick={() => setShowAddForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </Button>
            </div>

            <form onSubmit={handleAddAccount} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  แพลตฟอร์ม
                </label>
                <select
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {Object.entries(platformLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ชื่อบัญชี
                </label>
                <Input
                  type="text"
                  value={formData.accountName}
                  onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                  placeholder="ชื่อบัญชีของคุณ"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account ID
                </label>
                <Input
                  type="text"
                  value={formData.accountId}
                  onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                  placeholder="Account ID หรือ Username"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Access Token (ถ้ามี)
                </label>
                <Input
                  type="password"
                  value={formData.accessToken}
                  onChange={(e) => setFormData({ ...formData, accessToken: e.target.value })}
                  placeholder="Access Token (ไม่บังคับ)"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1"
                >
                  ยกเลิก
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? 'กำลังเชื่อมต่อ...' : 'เชื่อมต่อ'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
