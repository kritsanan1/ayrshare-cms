
import { NextRequest, NextResponse } from 'next/server'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const subscribeSchema = z.object({
  planId: z.enum(['starter', 'professional', 'enterprise']),
  paymentMethod: z.enum(['card', 'promptpay', 'truemoney']),
})

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
    const { planId, paymentMethod } = subscribeSchema.parse(body)

    // Mock subscription creation - replace with actual Stripe integration
    const subscriptionId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Update user plan
    await prisma.user.update({
      where: { id: decoded.userId },
      data: {
        planType: planId.toUpperCase() as any,
        subscriptionId,
        subscriptionStatus: 'active',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      }
    })

    return NextResponse.json({
      message: 'สมัครแพ็กเกจสำเร็จ',
      subscriptionId,
      redirectUrl: '/dashboard'
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'ข้อมูลไม่ถูกต้อง', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating subscription:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการสมัครแพ็กเกจ' },
      { status: 500 }
    )
  }
}
