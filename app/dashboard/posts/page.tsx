
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { PostComposer } from '@/components/forms/PostComposer'
import { Plus, Edit, Trash2, Calendar, Eye } from 'lucide-react'

interface Post {
  id: string
  content: string
  status: string
  scheduledTime?: string
  createdAt: string
  platforms: Array<{
    platform: string
    status: string
  }>
}

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [showComposer, setShowComposer] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem('auth-token')
      const response = await fetch('/api/posts', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setPosts(data.posts)
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePost = async (postId: string) => {
    if (!confirm('คุณต้องการลบโพสต์นี้หรือไม่?')) return
    
    try {
      const token = localStorage.getItem('auth-token')
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        setPosts(posts.filter(post => post.id !== postId))
      }
    } catch (error) {
      console.error('Error deleting post:', error)
    }
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('th-TH')
  }

  if (loading) {
    return <div className="flex justify-center py-8">กำลังโหลด...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">จัดการโพสต์</h1>
        <Button onClick={() => setShowComposer(true)}>
          <Plus className="w-4 h-4 mr-2" />
          สร้างโพสต์ใหม่
        </Button>
      </div>

      {showComposer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <PostComposer 
              onClose={() => setShowComposer(false)}
              onSuccess={() => {
                setShowComposer(false)
                fetchPosts()
              }}
            />
          </div>
        </div>
      )}

      <div className="bg-white shadow-sm rounded-lg">
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg text-gray-900 mb-2">ยังไม่มีโพสต์</h3>
            <p className="text-gray-500 mb-4">เริ่มสร้างโพสต์แรกของคุณกันเลย</p>
            <Button onClick={() => setShowComposer(true)}>
              สร้างโพสต์ใหม่
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {posts.map((post) => (
              <div key={post.id} className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(post.status)}`}>
                        {post.status}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatDate(post.createdAt)}
                      </span>
                    </div>
                    <p className="text-gray-900 mb-3 line-clamp-3">{post.content}</p>
                    {post.scheduledTime && (
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <Calendar className="w-4 h-4 mr-1" />
                        กำหนดเผยแพร่: {formatDate(post.scheduledTime)}
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {post.platforms.map((platform, index) => (
                        <span 
                          key={index}
                          className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                        >
                          {platform.platform}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDeletePost(post.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
