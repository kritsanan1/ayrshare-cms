
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'
import { z } from 'zod'

const createPostSchema = z.object({
  content: z.string().min(1, 'เนื้อหาโพสต์ไม่สามารถเว้นว่างได้'),
  mediaUrls: z.array(z.string()).optional(),
  scheduledTime: z.string().datetime().optional(),
  platforms: z.array(z.string()).min(1, 'กรุณาเลือกแพลตฟอร์มอย่างน้อย 1 แพลตฟอร์ม'),
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

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')

    const where: any = {
      authorId: decoded.userId
    }

    if (status && status !== 'all') {
      where.status = status.toUpperCase()
    }

    const posts = await prisma.post.findMany({
      where,
      include: {
        platforms: {
          include: {
            socialAccount: true
          }
        },
        author: {
          select: {
            id: true,
            fullName: true,
            avatar: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit
    })

    const total = await prisma.post.count({ where })

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูลโพสต์' },
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
    const { content, mediaUrls, scheduledTime, platforms } = createPostSchema.parse(body)

    // Create post
    const post = await prisma.post.create({
      data: {
        content,
        mediaUrls: mediaUrls || [],
        scheduledTime: scheduledTime ? new Date(scheduledTime) : null,
        status: scheduledTime ? 'SCHEDULED' : 'DRAFT',
        authorId: decoded.userId
      }
    })

    // Create platform relationships
    for (const platformId of platforms) {
      const socialAccount = await prisma.socialAccount.findFirst({
        where: {
          userId: decoded.userId,
          id: platformId,
          isActive: true
        }
      })

      if (socialAccount) {
        await prisma.postPlatform.create({
          data: {
            postId: post.id,
            socialAccountId: socialAccount.id,
            platform: socialAccount.platform,
            status: 'PENDING'
          }
        })
      }
    }

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

    console.error('Error creating post:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการสร้างโพสต์' },
      { status: 500 }
    )
  }
}
