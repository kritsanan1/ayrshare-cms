
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            จัดการโซเชียลมีเดียของคุณ
            <span className="block text-blue-600">ได้อย่างมืออาชีพ</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            สร้าง กำหนดการ และวิเคราะห์โพสต์ของคุณในทุกแพลตฟอร์มจากที่เดียว
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg" className="w-full sm:w-auto">
                เริ่มใช้งานฟรี
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                เข้าสู่ระบบ
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              📝
            </div>
            <h3 className="text-xl font-semibold mb-2">สร้างโพสต์ง่ายๆ</h3>
            <p className="text-gray-600">เขียนโพสต์ครั้งเดียว โพสต์ได้หลายแพลตฟอร์ม</p>
          </div>
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              ⏰
            </div>
            <h3 className="text-xl font-semibold mb-2">กำหนดเวลาโพสต์</h3>
            <p className="text-gray-600">วางแผนเนื้อหาล่วงหน้า โพสต์อัตโนมัติ</p>
          </div>
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              📊
            </div>
            <h3 className="text-xl font-semibold mb-2">วิเคราะห์ผลงาน</h3>
            <p className="text-gray-600">ติดตามยอดผู้ชมและการมีส่วนร่วม</p>
          </div>
        </div>
      </div>
    </div>
  )
}
