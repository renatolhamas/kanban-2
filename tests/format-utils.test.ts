import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { formatRelativeTime, truncate, getMediaLabel } from '../src/lib/format-utils'

describe('format-utils', () => {
  describe('formatRelativeTime', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('returns "-" for null input', () => {
      expect(formatRelativeTime(null)).toBe('-')
    })

    it('returns "just now" for dates less than 60 seconds ago', () => {
      const now = new Date('2026-04-23T14:00:00Z')
      vi.setSystemTime(now)
      const justNow = new Date('2026-04-23T13:59:50Z')
      expect(formatRelativeTime(justNow)).toBe('just now')
    })

    it('returns minutes ago for dates within the hour', () => {
      const now = new Date('2026-04-23T14:00:00Z')
      vi.setSystemTime(now)
      const fiveMinsAgo = new Date('2026-04-23T13:55:00Z')
      expect(formatRelativeTime(fiveMinsAgo)).toBe('5m ago')
    })

    it('returns hours ago for dates within the day', () => {
      const now = new Date('2026-04-23T14:00:00Z')
      vi.setSystemTime(now)
      const twoHoursAgo = new Date('2026-04-23T12:00:00Z')
      expect(formatRelativeTime(twoHoursAgo)).toBe('2h ago')
    })

    it('returns days ago for dates within the week', () => {
      const now = new Date('2026-04-23T14:00:00Z')
      vi.setSystemTime(now)
      const threeDaysAgo = new Date('2026-04-20T14:00:00Z')
      expect(formatRelativeTime(threeDaysAgo)).toBe('3d ago')
    })

    it('returns formatted date for older dates', () => {
      const now = new Date('2026-04-23T14:00:00Z')
      vi.setSystemTime(now)
      const oldDate = new Date('2025-01-01T12:00:00Z')
      // Format depends on locale, but we expect a date string
      expect(formatRelativeTime(oldDate)).toMatch(/\d{2}\/\d{2}/)
    })
  })

  describe('truncate', () => {
    it('returns empty string for null input', () => {
      expect(truncate(null)).toBe('')
    })

    it('returns the same string if shorter than length', () => {
      expect(truncate('Hello', 10)).toBe('Hello')
    })

    it('truncates and adds ellipsis if longer than length', () => {
      expect(truncate('This is a long message', 10)).toBe('This is a...')
    })

    it('trims whitespace before adding ellipsis', () => {
      expect(truncate('Hello     ', 5)).toBe('Hello...')
    })
  })

  describe('getMediaLabel', () => {
    it('returns empty string for null input', () => {
      expect(getMediaLabel(null)).toBe('')
    })

    it('identifies photos', () => {
      expect(getMediaLabel('test.jpg')).toBe('📷 Foto')
      expect(getMediaLabel('test.webp')).toBe('📷 Foto')
    })

    it('identifies videos', () => {
      expect(getMediaLabel('test.mp4')).toBe('🎥 Vídeo')
    })

    it('identifies audio', () => {
      expect(getMediaLabel('test.mp3')).toBe('🎵 Áudio')
    })

    it('identifies documents', () => {
      expect(getMediaLabel('test.pdf')).toBe('📄 Arquivo')
    })

    it('returns generic media label for unknown extensions', () => {
      expect(getMediaLabel('test.xyz')).toBe('📎 Mídia')
    })
  })
})
