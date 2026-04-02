import {
  validatePassword,
  getPasswordStrength,
  getPasswordStrengthLabel,
} from './password'

describe('Password Validation', () => {
  describe('validatePassword()', () => {
    it('should reject empty password', () => {
      const result = validatePassword('')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Password is required')
    })

    it('should reject password shorter than 8 characters', () => {
      const result = validatePassword('Test123')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Password must be at least 8 characters long')
    })

    it('should reject password without uppercase letter', () => {
      const result = validatePassword('testpassword123')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Password must contain at least one uppercase letter')
    })

    it('should reject password without lowercase letter', () => {
      const result = validatePassword('TESTPASSWORD123')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Password must contain at least one lowercase letter')
    })

    it('should reject password without digit', () => {
      const result = validatePassword('TestPassword')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Password must contain at least one digit')
    })

    it('should accept valid password with 8+ chars, uppercase, lowercase, digit', () => {
      const result = validatePassword('TestPassword123')
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should accept valid password with minimum requirements', () => {
      const result = validatePassword('Aa123456')
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should accept valid password with special characters (not required)', () => {
      const result = validatePassword('TestPass@123!')
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject password with multiple missing requirements', () => {
      const result = validatePassword('test123')
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(1)
      expect(result.errors).toContain(
        'Password must contain at least one uppercase letter'
      )
    })

    it('should accept 9-character password with all requirements', () => {
      const result = validatePassword('TestPass1')
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should accept very long password', () => {
      const result = validatePassword(
        'TestPassword123VeryLongPasswordWithManyCharacters'
      )
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
  })

  describe('getPasswordStrength()', () => {
    it('should return 0 for empty password', () => {
      expect(getPasswordStrength('')).toBe(0)
    })

    it('should return higher strength for longer passwords', () => {
      const short = getPasswordStrength('TestPass1')
      const long = getPasswordStrength('TestPassword123WithManyCharacters')
      expect(long).toBeGreaterThan(short)
    })

    it('should return higher strength for more character variety', () => {
      const lowVariety = getPasswordStrength('aaaaBBBB1')
      const highVariety = getPasswordStrength('aAaA1234')
      expect(highVariety).toBeGreaterThanOrEqual(lowVariety)
    })

    it('should return max 5 strength', () => {
      const strength = getPasswordStrength(
        'VeryStrongPassword123WithAllRequirements'
      )
      expect(strength).toBeLessThanOrEqual(5)
    })

    it('should return correct strength levels', () => {
      expect(getPasswordStrength('Aa1')).toBeGreaterThan(0) // Has variety but short
      expect(getPasswordStrength('Aaaaaaa1')).toBeGreaterThan(0) // 8 chars with variety
      expect(getPasswordStrength('TestPassword123')).toBeGreaterThan(2) // Good strength
    })
  })

  describe('getPasswordStrengthLabel()', () => {
    it('should return correct labels for strength levels', () => {
      expect(getPasswordStrengthLabel(0)).toBe('Weak')
      expect(getPasswordStrengthLabel(1)).toBe('Fair')
      expect(getPasswordStrengthLabel(2)).toBe('Good')
      expect(getPasswordStrengthLabel(3)).toBe('Strong')
      expect(getPasswordStrengthLabel(4)).toBe('Very Strong')
      expect(getPasswordStrengthLabel(5)).toBe('Excellent')
    })

    it('should cap at Excellent for values > 5', () => {
      expect(getPasswordStrengthLabel(10)).toBe('Excellent')
    })
  })
})
