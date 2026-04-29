import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { vi } from 'vitest'
import { ConversationCard } from './ConversationCard'

const defaultProps = {
  id: 'conv-123',
  name: 'João Silva',
  phone: '5511999999999',
  lastMessage: 'Olá, tudo bem?',
  senderType: null as string | null,
  mediaUrl: null as string | null,
  mediaType: null as string | null,
  timestamp: '2026-04-23T14:30:00Z',
}

describe('ConversationCard', () => {
  describe('rendering', () => {
    it('should render name', () => {
      render(<ConversationCard {...defaultProps} />)
      expect(screen.getByText('João Silva')).toBeInTheDocument()
    })

    it('should render phone', () => {
      render(<ConversationCard {...defaultProps} />)
      expect(screen.getByText('5511999999999')).toBeInTheDocument()
    })

    it('should render timestamp', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-04-23T14:35:00Z'))
      render(<ConversationCard {...defaultProps} />)
      expect(screen.getByText('5m ago')).toBeInTheDocument()
      vi.useRealTimers()
    })

    it('should render lastMessage when under 80 chars', () => {
      render(<ConversationCard {...defaultProps} lastMessage="Mensagem curta" />)
      expect(screen.getByText('Mensagem curta')).toBeInTheDocument()
    })

    it('should truncate lastMessage over 100 chars with ellipsis', () => {
      const long = 'A'.repeat(110)
      render(<ConversationCard {...defaultProps} lastMessage={long} />)
      expect(screen.getByText(`${'A'.repeat(100)}...`)).toBeInTheDocument()
    })

    it('should show unread badge when unreadCount > 0', () => {
      render(<ConversationCard {...defaultProps} unreadCount={3} />)
      expect(screen.getByText('3')).toBeInTheDocument()
    })

    it('should not show unread badge when unreadCount is 0', () => {
      render(<ConversationCard {...defaultProps} unreadCount={0} />)
      expect(screen.queryByText('0')).not.toBeInTheDocument()
    })

    it('should not show unread badge when unreadCount is undefined', () => {
      const { container } = render(<ConversationCard {...defaultProps} />)
      expect(container.querySelector('[class*="badge"]')).not.toBeInTheDocument()
    })
  })

  describe('accessibility attributes', () => {
    it('should have role="button"', () => {
      render(<ConversationCard {...defaultProps} />)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should have tabIndex={0}', () => {
      render(<ConversationCard {...defaultProps} />)
      expect(screen.getByRole('button')).toHaveAttribute('tabindex', '0')
    })

    it('should have descriptive aria-label', () => {
      render(<ConversationCard {...defaultProps} />)
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label', expect.stringContaining('João Silva'))
      expect(button).toHaveAttribute('aria-label', expect.stringContaining('5511999999999'))
    })

    it('should have aria-pressed=false when not selected', () => {
      render(<ConversationCard {...defaultProps} isSelected={false} />)
      expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false')
    })

    it('should have aria-pressed=true when selected', () => {
      render(<ConversationCard {...defaultProps} isSelected={true} />)
      expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true')
    })
  })

  describe('interaction', () => {
    it('should call onClick when clicked', async () => {
      const handler = vi.fn()
      render(<ConversationCard {...defaultProps} onClick={handler} />)
      await userEvent.click(screen.getByRole('button'))
      expect(handler).toHaveBeenCalledTimes(1)
    })

    it('should call onClick when Enter is pressed', async () => {
      const handler = vi.fn()
      render(<ConversationCard {...defaultProps} onClick={handler} />)
      screen.getByRole('button').focus()
      await userEvent.keyboard('{Enter}')
      expect(handler).toHaveBeenCalledTimes(1)
    })

    it('should call onClick when Space is pressed', async () => {
      const handler = vi.fn()
      render(<ConversationCard {...defaultProps} onClick={handler} />)
      screen.getByRole('button').focus()
      await userEvent.keyboard(' ')
      expect(handler).toHaveBeenCalledTimes(1)
    })

    it('should not call onClick for other keys', async () => {
      const handler = vi.fn()
      render(<ConversationCard {...defaultProps} onClick={handler} />)
      screen.getByRole('button').focus()
      await userEvent.keyboard('{Tab}')
      expect(handler).not.toHaveBeenCalled()
    })
  })

  describe('accessibility', () => {
    it('should have no a11y violations', async () => {
      const { container } = render(<ConversationCard {...defaultProps} />)
      // @ts-expect-error jest-axe matcher not recognized by Vitest types
      expect(await axe(container)).toHaveNoViolations()
    })

    it('should have no a11y violations when selected', async () => {
      const { container } = render(<ConversationCard {...defaultProps} isSelected unreadCount={2} />)
      // @ts-expect-error jest-axe matcher not recognized by Vitest types
      expect(await axe(container)).toHaveNoViolations()
    })
  })
})
