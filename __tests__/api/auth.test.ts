
import { hashPassword, verifyPassword, generateToken, verifyToken } from '@/lib/auth'

describe('Auth Utils', () => {
  describe('Password hashing', () => {
    it('hashes password correctly', async () => {
      const password = 'testpassword123'
      const hashedPassword = await hashPassword(password)
      
      expect(hashedPassword).not.toBe(password)
      expect(hashedPassword.length).toBeGreaterThan(50)
    })

    it('verifies password correctly', async () => {
      const password = 'testpassword123'
      const hashedPassword = await hashPassword(password)
      
      const isValid = await verifyPassword(password, hashedPassword)
      expect(isValid).toBe(true)
      
      const isInvalid = await verifyPassword('wrongpassword', hashedPassword)
      expect(isInvalid).toBe(false)
    })
  })

  describe('JWT tokens', () => {
    it('generates and verifies token correctly', () => {
      const userId = 'test-user-id'
      const token = generateToken(userId)
      
      expect(token).toBeTruthy()
      expect(typeof token).toBe('string')
      
      const decoded = verifyToken(token)
      expect(decoded).toBeTruthy()
      expect(decoded?.userId).toBe(userId)
    })

    it('returns null for invalid token', () => {
      const invalidToken = 'invalid.token.here'
      const decoded = verifyToken(invalidToken)
      
      expect(decoded).toBeNull()
    })
  })
})
