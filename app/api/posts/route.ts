
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'
import { z } from 'zod'

const createPostSchema = z.object({
  content: z.string().min(1, 'เนื้อหาโพสต์ต้องไม่ว่าง'),
  mediaUrls: z.array(z.string().url()).optional().default([]),
  platforms: z.array(z.string()).min(1, 'ต้องเลือกแพลตฟอร์มอย่างน้อย 1 แพลตฟอร์ม'),
  scheduledTime: z.string().datetime().optional(),
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

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')

    const where = {
      authorId: payload.userId,
      ...(status && { status: status as any })
    }

    const posts = await prisma.post.findMany({
      where,
      include: {
        platforms: {
          include: {
            socialAccount: true
          }
        },
        _count: {
          select: {
            platforms: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    })

    const totalPosts = await prisma.post.count({ where })

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total: totalPosts,
        totalPages: Math.ceil(totalPosts / limit)
      }
    })

  } catch (error) {
    console.error('Get posts error:', error)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลโพสต์' }, { status: 500 })
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
    const { content, mediaUrls, platforms, scheduledTime } = createPostSchema.parse(body)

    // Get user's social accounts for the selected platforms
    const socialAccounts = await prisma.socialAccount.findMany({
      where: {
        userId: payload.userId,
        platform: { in: platforms },
        isActive: true
      }
    })

    if (socialAccounts.length === 0) {
      return NextResponse.json(
        { error: 'ไม่พบบัญชีโซเชียลมีเดียที่เชื่อมต่อแล้วสำหรับแพลตฟอร์มที่เลือก' },
        { status: 400 }
      )
    }

    // Create post
    const post = await prisma.post.create({
      data: {
        content,
        mediaUrls,
        scheduledTime: scheduledTime ? new Date(scheduledTime) : null,
        status: scheduledTime ? 'SCHEDULED' : 'DRAFT',
        authorId: payload.userId,
        platforms: {
          create: socialAccounts.map(account => ({
            platform: account.platform,
            socialAccountId: account.id,
            status: 'PENDING'
          }))
        }
      },
      include: {
        platforms: {
          include: {
            socialAccount: true
          }
        }
      }
    })

    return NextResponse.json({
      message: 'สร้างโพสต์สำเร็จ',
      post
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'ข้อมูลไม่ถูกต้อง', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Create post error:', error)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการสร้างโพสต์' }, { status: 500 })
  }
}
