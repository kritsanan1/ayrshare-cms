
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ error: 'ไม่พบ token การยืนยันตัวตน' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Token ไม่ถูกต้อง' }, { status: 401 })
    }

    const { id } = params

    // Check if the account belongs to the user
    const socialAccount = await prisma.socialAccount.findFirst({
      where: {
        id,
        userId: payload.userId
      }
    })

    if (!socialAccount) {
      return NextResponse.json({ error: 'ไม่พบบัญชีหรือไม่มีสิทธิ์เข้าถึง' }, { status: 404 })
    }

    // Delete the social account
    await prisma.socialAccount.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'ลบบัญชีโซเชียลสำเร็จ' })

  } catch (error) {
    console.error('Delete social account error:', error)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการลบบัญชีโซเชียล' }, { status: 500 })
  }
}
