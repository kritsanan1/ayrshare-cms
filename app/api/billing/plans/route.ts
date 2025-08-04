
import { NextResponse } from 'next/server'

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    nameLocal: 'เริ่มต้น',
    price: 299,
    currency: 'THB',
    interval: 'month',
    features: [
      'โพสต์ได้ 50 โพสต์ต่อเดือน',
      'เชื่อมต่อได้ 3 บัญชีโซเชียล',
      'กำหนดการโพสต์',
      'วิเคราะห์พื้นฐาน'
    ],
    limits: {
      postsPerMonth: 50,
      socialAccounts: 3,
      teamMembers: 1
    }
  },
  {
    id: 'professional',
    name: 'Professional',
    nameLocal: 'มืออาชีพ',
    price: 899,
    currency: 'THB',
    interval: 'month',
    features: [
      'โพสต์ไม่จำกัด',
      'เชื่อมต่อได้ 10 บัญชีโซเชียล',
      'การทำงานเป็นทีม',
      'วิเคราะห์ขั้นสูง',
      'แม่แบบโพสต์'
    ],
    limits: {
      postsPerMonth: -1,
      socialAccounts: 10,
      teamMembers: 5
    }
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    nameLocal: 'องค์กร',
    price: 2499,
    currency: 'THB',
    interval: 'month',
    features: [
      'ทุกฟีเจอร์ของแพ็กเกจ Professional',
      'เชื่อมต่อบัญชีไม่จำกัด',
      'ทีมไม่จำกัด',
      'รายงานขั้นสูง',
      'API Access',
      'การสนับสนุนระดับพรีเมียม'
    ],
    limits: {
      postsPerMonth: -1,
      socialAccounts: -1,
      teamMembers: -1
    }
  }
]

export async function GET() {
  return NextResponse.json({ plans })
}
