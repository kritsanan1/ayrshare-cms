'use client'

import { useState, useEffect } from 'react'
import { PostComposer } from '@/components/forms/PostComposer'
import { Button } from '@/components/ui/Button'
import { PlusIcon, CalendarIcon, UsersIcon, TrendingUpIcon } from 'lucide-react'

interface User {
  id: string
  email: string
  fullName?: string
  planType: string
  _count: {
    posts: number
    socialAccounts: number
  }
}

interface Post {
  id: string
  content: string
  status: string
  createdAt: string
  platforms: {
    platform: string
    status: string
    socialAccount: {
      accountName: string
    }
  }[]
}

export default function DashboardPage() {
  const [showComposer, setShowComposer] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [recentPosts, setRecentPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const [userResponse, postsResponse] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/posts?limit=5')
      ])

      if (userResponse.ok) {
        const userData = await userResponse.json()
        setUser(userData.user)
      }

      if (postsResponse.ok) {
        const postsData = await postsResponse.json()
        setRecentPosts(postsData.posts)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePostCreated = () => {
    setShowComposer(false)
    fetchDashboardData() // Refresh data
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED': return 'text-green-600 bg-green-100'
      case 'SCHEDULED': return 'text-blue-600 bg-blue-100'
      case 'DRAFT': return 'text-gray-600 bg-gray-100'
      case 'FAILED': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PUBLISHED': return 'เผยแพร่แล้ว'
      case 'SCHEDULED': return 'กำหนดเวลา'
      case 'DRAFT': return 'ร่าง'
      case 'FAILED': return 'ล้มเหลว'
      default: return status
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">แดชบอร์ด</h1>
          <p className="text-gray-600">ยินดีต้อนรับกลับ{user?.fullName ? `, ${user.fullName}` : ''}!</p>
        </div>
        <Button 
          onClick={() => setShowComposer(true)}
          className="flex items-center gap-2"
        >
          <PlusIcon className="w-4 h-4" />
          สร้างโพสต์ใหม่
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">โพสต์ทั้งหมด</p>
              <p className="text-2xl font-bold text-gray-900">{user?._count?.posts || 0}</p>
            </div>
            <CalendarIcon className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">บัญชีที่เชื่อมต่อ</p>
              <p className="text-2xl font-bold text-gray-900">{user?._count?.socialAccounts || 0}</p>
            </div>
            <UsersIcon className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">การมีส่วนร่วม</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
            <TrendingUpIcon className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">แผนปัจจุบัน</p>
              <p className="text-lg font-semibold text-gray-900">{user?.planType || 'STARTER'}</p>
            </div>
            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">
              {user?.planType?.charAt(0) || 'S'}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">การดำเนินการด่วน</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button variant="outline" className="h-20 flex flex-col gap-2">
            <CalendarIcon className="w-6 h-6" />
            กำหนดการโพสต์
          </Button>
          <Button variant="outline" className="h-20 flex flex-col gap-2">
            <UsersIcon className="w-6 h-6" />
            เชื่อมต่อบัญชี
          </Button>
          <Button variant="outline" className="h-20 flex flex-col gap-2">
            <TrendingUpIcon className="w-6 h-6" />
            ดูสถิติ
          </Button>
        </div>
      </div>

      {/* Recent Posts */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">โพสต์ล่าสุด</h2>
        {recentPosts.length > 0 ? (
          <div className="space-y-4">
            {recentPosts.map((post) => (
              <div key={post.id} className="border-l-4 border-blue-500 pl-4 py-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-gray-900 line-clamp-2">{post.content}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(post.status)}`}>
                        {getStatusText(post.status)}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(post.createdAt).toLocaleDateString('th-TH')}
                      </span>
                      <span className="text-sm text-gray-500">
                        {post.platforms.length} แพลตฟอร์ม
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            ยังไม่มีโพสต์ เริ่มต้นด้วยการสร้างโพสต์แรกของคุณ!
          </div>
        )}
      </div>

      {/* Post Composer Modal */}
      {showComposer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">สร้างโพสต์ใหม่</h2>
              <Button 
                variant="outline" 
                onClick={() => setShowComposer(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </Button>
            </div>
            <PostComposer onPostCreated={handlePostCreated} />
          </div>
        </div>
      )}
    </div>
  )
}