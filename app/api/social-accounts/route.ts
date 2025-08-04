
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'
import { z } from 'zod'

const connectAccountSchema = z.object({
  platform: z.enum(['FACEBOOK', 'INSTAGRAM', 'TWITTER', 'LINKEDIN', 'TIKTOK', 'YOUTUBE', 'LINE', 'PINTEREST']),
  accountName: z.string().min(1, 'ชื่อบัญชีต้องไม่ว่าง'),
  accountId: z.string().min(1, 'ID บัญชีต้องไม่ว่าง'),
  accessToken: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ error: 'ไม่พบ token การยืนยันตัวตน' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Token ไม่ถูกต้อง' }, { status: 401 })
    }

    const socialAccounts = await prisma.socialAccount.findMany({
      where: {
        userId: payload.userId
      },
      select: {
        id: true,
        platform: true,
        accountName: true,
        accountId: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: {
            posts: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ socialAccounts })

  } catch (error) {
    console.error('Get social accounts error:', error)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลบัญชีโซเชียล' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ error: 'ไม่พบ token การยืนยันตัวตน' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Token ไม่ถูกต้อง' }, { status: 401 })
    }

    const body = await request.json()
    const { platform, accountName, accountId, accessToken } = connectAccountSchema.parse(body)

    // Check if account already exists
    const existingAccount = await prisma.socialAccount.findUnique({
      where: {
        userId_platform_accountId: {
          userId: payload.userId,
          platform,
          accountId
        }
      }
    })

    if (existingAccount) {
      return NextResponse.json(
        { error: 'บัญชีนี้ได้ถูกเชื่อมต่อแล้ว' },
        { status: 400 }
      )
    }

    // Create social account
    const socialAccount = await prisma.socialAccount.create({
      data: {
        platform,
        accountName,
        accountId,
        accessToken,
        userId: payload.userId
      },
      select: {
        id: true,
        platform: true,
        accountName: true,
        accountId: true,
        isActive: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      message: 'เชื่อมต่อบัญชีโซเชียลสำเร็จ',
      socialAccount
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'ข้อมูลไม่ถูกต้อง', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Connect social account error:', error)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการเชื่อมต่อบัญชีโซเชียล' }, { status: 500 })
  }
}
