
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'
import { z } from 'zod'

const connectAccountSchema = z.object({
  platform: z.enum(['FACEBOOK', 'INSTAGRAM', 'TWITTER', 'LINKEDIN', 'TIKTOK', 'YOUTUBE', 'LINE', 'PINTEREST']),
  accountName: z.string().min(1, 'ชื่อบัญชีไม่สามารถเว้นว่างได้'),
  accountId: z.string().min(1, 'ID บัญชีไม่สามารถเว้นว่างได้'),
  accessToken: z.string().optional(),
  refreshToken: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ error: 'ไม่พบ token การยืนยันตัวตน' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Token ไม่ถูกต้อง' }, { status: 401 })
    }

    const accounts = await prisma.socialAccount.findMany({
      where: {
        userId: decoded.userId
      },
      select: {
        id: true,
        platform: true,
        accountName: true,
        accountId: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ accounts })

  } catch (error) {
    console.error('Error fetching social accounts:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูลบัญชีโซเชียล' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ error: 'ไม่พบ token การยืนยันตัวตน' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Token ไม่ถูกต้อง' }, { status: 401 })
    }

    const body = await request.json()
    const { platform, accountName, accountId, accessToken, refreshToken } = connectAccountSchema.parse(body)

    // Check if account already exists
    const existingAccount = await prisma.socialAccount.findFirst({
      where: {
        userId: decoded.userId,
        platform,
        accountId
      }
    })

    if (existingAccount) {
      return NextResponse.json(
        { error: 'บัญชีนี้ได้เชื่อมต่อแล้ว' },
        { status: 400 }
      )
    }

    const account = await prisma.socialAccount.create({
      data: {
        platform,
        accountName,
        accountId,
        accessToken,
        refreshToken,
        userId: decoded.userId
      }
    })

    return NextResponse.json({
      message: 'เชื่อมต่อบัญชีสำเร็จ',
      account: {
        id: account.id,
        platform: account.platform,
        accountName: account.accountName,
        accountId: account.accountId,
        isActive: account.isActive
      }
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'ข้อมูลไม่ถูกต้อง', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error connecting social account:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการเชื่อมต่อบัญชี' },
      { status: 500 }
    )
  }
}
