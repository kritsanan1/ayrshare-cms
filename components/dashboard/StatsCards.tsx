
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Send, Calendar, BarChart3, Users } from 'lucide-react'

interface StatsCardsProps {
  stats: {
    totalPosts: number
    scheduledPosts: number
    connectedAccounts: number
    engagementRate: number
  }
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: 'โพสต์ทั้งหมด',
      value: stats.totalPosts,
      icon: Send,
      color: 'text-blue-600'
    },
    {
      title: 'โพสต์ที่กำหนดไว้',
      value: stats.scheduledPosts,
      icon: Calendar,
      color: 'text-green-600'
    },
    {
      title: 'บัญชีที่เชื่อมต่อ',
      value: stats.connectedAccounts,
      icon: Users,
      color: 'text-purple-600'
    },
    {
      title: 'อัตราการมีส่วนร่วม',
      value: `${stats.engagementRate}%`,
      icon: BarChart3,
      color: 'text-orange-600'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              </div>
              <card.icon className={`h-8 w-8 ${card.color}`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
