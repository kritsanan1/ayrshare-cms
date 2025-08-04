
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ error: 'ไม่ได้รับอนุญาต' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Token ไม่ถูกต้อง' }, { status: 401 })
    }

    const post = await prisma.post.findFirst({
      where: {
        id: params.id,
        authorId: payload.userId
      },
      include: {
        platforms: {
          include: {
            socialAccount: true
          }
        }
      }
    })

    if (!post) {
      return NextResponse.json({ error: 'ไม่พบโพสต์' }, { status: 404 })
    }

    return NextResponse.json({ post })
  } catch (error) {
    console.error('Error fetching post:', error)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลโพสต์' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ error: 'ไม่ได้รับอนุญาต' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Token ไม่ถูกต้อง' }, { status: 401 })
    }

    const { content, scheduledTime, platforms } = await request.json()

    const post = await prisma.post.findFirst({
      where: {
        id: params.id,
        authorId: payload.userId
      }
    })

    if (!post) {
      return NextResponse.json({ error: 'ไม่พบโพสต์' }, { status: 404 })
    }

    const updatedPost = await prisma.post.update({
      where: { id: params.id },
      data: {
        content,
        scheduledTime: scheduledTime ? new Date(scheduledTime) : null,
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
      message: 'อัปเดตโพสต์เรียบร้อยแล้ว',
      post: updatedPost 
    })
  } catch (error) {
    console.error('Error updating post:', error)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการอัปเดตโพสต์' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ error: 'ไม่ได้รับอนุญาต' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Token ไม่ถูกต้อง' }, { status: 401 })
    }

    const post = await prisma.post.findFirst({
      where: {
        id: params.id,
        authorId: payload.userId
      }
    })

    if (!post) {
      return NextResponse.json({ error: 'ไม่พบโพสต์' }, { status: 404 })
    }

    // Delete related platform posts first
    await prisma.postPlatform.deleteMany({
      where: { postId: params.id }
    })

    // Delete the post
    await prisma.post.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'ลบโพสต์เรียบร้อยแล้ว' })
  } catch (error) {
    console.error('Error deleting post:', error)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการลบโพสต์' }, { status: 500 })
  }
}
