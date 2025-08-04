
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request)
    
    if (!token) {
      return NextResponse.json(
        { error: 'ไม่พบ token การยืนยันตัวตน' },
        { status: 401 }
      )
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json(
        { error: 'Token ไม่ถูกต้อง' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        avatar: true,
        planType: true,
        status: true,
        ayrshareApiKey: true,
        subscriptionStatus: true,
        currentPeriodEnd: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
            socialAccounts: true,
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'ไม่พบผู้ใช้งาน' },
        { status: 404 }
      )
    }

    if (user.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'บัญชีผู้ใช้ถูกปิดใช้งาน' },
        { status: 401 }
      )
    }

    return NextResponse.json({ user })

  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้' },
      { status: 500 }
    )
  }
}
