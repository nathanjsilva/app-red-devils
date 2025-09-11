import { describe, it, expect } from 'vitest'
import { validateEmail, validatePassword, validateName, sanitizeInput } from '@/utils/validation'

describe('Validation Utils', () => {
  describe('validateEmail', () => {
    it('should validate correct email', () => {
      expect(validateEmail('test@example.com')).toBe(true)
      expect(validateEmail('user.name@domain.co.uk')).toBe(true)
    })

    it('should reject invalid email', () => {
      expect(validateEmail('invalid-email')).toBe(false)
      expect(validateEmail('test@')).toBe(false)
      expect(validateEmail('@example.com')).toBe(false)
    })
  })

  describe('validatePassword', () => {
    it('should validate password with minimum length', () => {
      expect(validatePassword('password123')).toEqual({ isValid: true })
    })

    it('should reject short password', () => {
      expect(validatePassword('123')).toEqual({
        isValid: false,
        message: 'A senha deve ter pelo menos 6 caracteres'
      })
    })
  })

  describe('validateName', () => {
    it('should validate name with minimum length', () => {
      expect(validateName('João')).toEqual({ isValid: true })
    })

    it('should reject short name', () => {
      expect(validateName('A')).toEqual({
        isValid: false,
        message: 'O nome deve ter pelo menos 2 caracteres'
      })
    })
  })

  describe('sanitizeInput', () => {
    it('should remove dangerous characters', () => {
      expect(sanitizeInput('<script>alert("xss")</script>')).toBe('scriptalert("xss")/script')
    })

    it('should trim whitespace', () => {
      expect(sanitizeInput('  test  ')).toBe('test')
    })
  })
})
