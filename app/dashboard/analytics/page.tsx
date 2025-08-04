
'use client'

import { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  Users, 
  Heart, 
  MessageCircle, 
  Share2,
  Eye,
  Calendar,
  Target
} from 'lucide-react'

interface AnalyticsData {
  overview: {
    totalPosts: number
    totalViews: number
    totalEngagement: number
    growthRate: number
  }
  platforms: Array<{
    name: string
    posts: number
    engagement: number
    growth: number
  }>
  recentPosts: Array<{
    id: string
    content: string
    platforms: string[]
    views: number
    likes: number
    comments: number
    shares: number
    publishedAt: string
  }>
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('7d')

  useEffect(() => {
    fetchAnalytics()
  }, [dateRange])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      // Mock data for now - replace with actual API call
      const mockData: AnalyticsData = {
        overview: {
          totalPosts: 45,
          totalViews: 12500,
          totalEngagement: 890,
          growthRate: 12.5
        },
        platforms: [
          { name: 'Facebook', posts: 15, engagement: 450, growth: 8.2 },
          { name: 'Instagram', posts: 12, engagement: 320, growth: 15.3 },
          { name: 'Twitter', posts: 10, engagement: 120, growth: -2.1 },
          { name: 'LinkedIn', posts: 8, engagement: 80, growth: 25.4 }
        ],
        recentPosts: [
          {
            id: '1',
            content: 'การตลาดดิจิทัลในยุค AI',
            platforms: ['Facebook', 'Instagram'],
            views: 1250,
            likes: 45,
            comments: 12,
            shares: 8,
            publishedAt: '2024-01-15T10:00:00Z'
          },
          {
            id: '2',
            content: 'เทรนด์โซเชียลมีเดีย 2024',
            platforms: ['Twitter', 'LinkedIn'],
            views: 890,
            likes: 32,
            comments: 6,
            shares: 15,
            publishedAt: '2024-01-14T14:30:00Z'
          }
        ]
      }
      setAnalytics(mockData)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return <div className="flex justify-center py-8">กำลังโหลดข้อมูล...</div>
  }

  if (!analytics) {
    return <div className="text-center py-8">ไม่สามารถโหลดข้อมูลได้</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">การวิเคราะห์</h1>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="7d">7 วันที่ผ่านมา</option>
          <option value="30d">30 วันที่ผ่านมา</option>
          <option value="90d">90 วันที่ผ่านมา</option>
        </select>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">จำนวนโพสต์</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.overview.totalPosts}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">ยอดชม</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(analytics.overview.totalViews)}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Eye className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">การมีส่วนร่วม</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(analytics.overview.totalEngagement)}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Heart className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">อัตราเติบโต</p>
              <p className="text-2xl font-bold text-green-600">+{analytics.overview.growthRate}%</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Platform Performance */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">ประสิทธิภาพแต่ละแพลตฟอร์ม</h2>
        <div className="space-y-4">
          {analytics.platforms.map((platform) => (
            <div key={platform.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-600">
                    {platform.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{platform.name}</p>
                  <p className="text-sm text-gray-600">{platform.posts} โพสต์</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900">{platform.engagement} การมีส่วนร่วม</p>
                <p className={`text-sm ${platform.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {platform.growth >= 0 ? '+' : ''}{platform.growth}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Posts Performance */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">ประสิทธิภาพโพสต์ล่าสุด</h2>
        <div className="space-y-4">
          {analytics.recentPosts.map((post) => (
            <div key={post.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <p className="text-gray-900 font-medium mb-2">{post.content}</p>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {post.platforms.map((platform) => (
                      <span key={platform} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {platform}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500">{formatDate(post.publishedAt)}</p>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <div className="flex items-center justify-center text-gray-600 mb-1">
                    <Eye className="w-4 h-4 mr-1" />
                  </div>
                  <p className="text-sm font-medium">{formatNumber(post.views)}</p>
                  <p className="text-xs text-gray-500">ยอดชม</p>
                </div>
                <div>
                  <div className="flex items-center justify-center text-red-600 mb-1">
                    <Heart className="w-4 h-4 mr-1" />
                  </div>
                  <p className="text-sm font-medium">{post.likes}</p>
                  <p className="text-xs text-gray-500">ไลค์</p>
                </div>
                <div>
                  <div className="flex items-center justify-center text-blue-600 mb-1">
                    <MessageCircle className="w-4 h-4 mr-1" />
                  </div>
                  <p className="text-sm font-medium">{post.comments}</p>
                  <p className="text-xs text-gray-500">ความคิดเห็น</p>
                </div>
                <div>
                  <div className="flex items-center justify-center text-green-600 mb-1">
                    <Share2 className="w-4 h-4 mr-1" />
                  </div>
                  <p className="text-sm font-medium">{post.shares}</p>
                  <p className="text-xs text-gray-500">แชร์</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
