
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('รหัสผ่านไม่ตรงกัน')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName
        })
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem('auth-token', data.token)
        router.push('/dashboard')
      } else {
        setError(data.error || 'เกิดข้อผิดพลาด')
      }
    } catch (error) {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            สมัครสมาชิก
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            หรือ{' '}
            <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
              เข้าสู่ระบบ
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
          <div className="space-y-4">
            <Input
              type="text"
              placeholder="ชื่อ-นามสกุล"
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              required
            />
            <Input
              type="email"
              placeholder="อีเมล"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
            <Input
              type="password"
              placeholder="รหัสผ่าน"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
            <Input
              type="password"
              placeholder="ยืนยันรหัสผ่าน"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'กำลังสมัครสมาชิก...' : 'สมัครสมาชิก'}
          </Button>
        </form>
      </div>
    </div>
  )
}
