
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Plus, FileText, Users, BarChart3, Calendar } from 'lucide-react'

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalPosts: 0,
    scheduledPosts: 0,
    connectedAccounts: 0,
    thisMonthPosts: 0
  })

  useEffect(() => {
    // TODO: Fetch real stats from API
    setStats({
      totalPosts: 12,
      scheduledPosts: 5,
      connectedAccounts: 3,
      thisMonthPosts: 8
    })
  }, [])

  const quickStats = [
    { name: 'โพสต์ทั้งหมด', value: stats.totalPosts, icon: FileText, color: 'bg-blue-500' },
    { name: 'โพสต์ที่กำหนดไว้', value: stats.scheduledPosts, icon: Calendar, color: 'bg-green-500' },
    { name: 'บัญชีที่เชื่อมต่อ', value: stats.connectedAccounts, icon: Users, color: 'bg-purple-500' },
    { name: 'โพสต์เดือนนี้', value: stats.thisMonthPosts, icon: BarChart3, color: 'bg-orange-500' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">แดชบอร์ด</h1>
          <p className="mt-1 text-gray-600">ภาพรวมการจัดการโซเชียลมีเดียของคุณ</p>
        </div>
        <Link href="/dashboard/posts/new">
          <Button className="mt-4 sm:mt-0">
            <Plus className="h-4 w-4 mr-2" />
            สร้างโพสต์ใหม่
          </Button>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`${stat.color} rounded-lg p-3`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">การดำเนินการด่วน</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/dashboard/posts/new">
              <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer">
                <FileText className="h-8 w-8 text-blue-600 mb-2" />
                <h3 className="font-medium text-gray-900">สร้างโพสต์ใหม่</h3>
                <p className="text-sm text-gray-600 mt-1">เขียนและกำหนดการโพสต์</p>
              </div>
            </Link>
            <Link href="/dashboard/settings/accounts">
              <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer">
                <Users className="h-8 w-8 text-green-600 mb-2" />
                <h3 className="font-medium text-gray-900">เชื่อมต่อบัญชี</h3>
                <p className="text-sm text-gray-600 mt-1">เพิ่มบัญชีโซเชียลมีเดีย</p>
              </div>
            </Link>
            <Link href="/dashboard/analytics">
              <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer">
                <BarChart3 className="h-8 w-8 text-purple-600 mb-2" />
                <h3 className="font-medium text-gray-900">ดูสถิติ</h3>
                <p className="text-sm text-gray-600 mt-1">วิเคราะห์ผลงานโพสต์</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Posts */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">โพสต์ล่าสุด</h2>
        </div>
        <div className="p-6">
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">ยังไม่มีโพสต์</p>
            <Link href="/dashboard/posts/new">
              <Button className="mt-4">
                สร้างโพสต์แรก
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
