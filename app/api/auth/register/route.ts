
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, generateToken } from '@/lib/auth'
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email('อีเมลไม่ถูกต้อง'),
  password: z.string().min(8, 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร'),
  fullName: z.string().min(2, 'ชื่อต้องมีอย่างน้อย 2 ตัวอักษร').optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, fullName } = registerSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'ผู้ใช้งานนี้มีอยู่แล้ว' },
        { status: 400 }
      )
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        planType: true,
        status: true,
        createdAt: true,
      }
    })

    // Generate JWT token
    const token = generateToken(user.id)

    // Set cookie
    const response = NextResponse.json({
      message: 'สมัครสมาชิกสำเร็จ',
      user,
      token
    })

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })

    return response

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'ข้อมูลไม่ถูกต้อง', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการสมัครสมาชิก' },
      { status: 500 }
    )
  }
}
