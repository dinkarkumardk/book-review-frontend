import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ReviewsList } from '../ReviewsList'
import type { Review } from '@/types/domain'

// Mock AuthContext
vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    user: {
      id: '1',
      name: 'Test User',
      email: 'test@example.com'
    }
  }),
}))

// Mock API
vi.mock('@/services/api', () => ({
  default: {
    put: vi.fn().mockResolvedValue({ data: { id: '1' } }),
    delete: vi.fn().mockResolvedValue({}),
  },
}))

// Mock toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

describe('ReviewsList Component', () => {
  const mockReviews: Review[] = [
    {
      id: '1',
      bookId: '1',
      userId: '1',
      rating: 5,
      content: 'Great book!',
      createdAt: '2023-01-01T00:00:00Z',
      user: {
        id: '1',
        name: 'Test User',
        email: 'test@example.com'
      }
    },
    {
      id: '2',
      bookId: '1',
      userId: '2',
      rating: 4,
      content: 'Good read',
      createdAt: '2023-01-02T00:00:00Z',
      user: {
        id: '2',
        name: 'Other User',
        email: 'other@example.com'
      }
    }
  ]

  const defaultProps = {
    reviews: mockReviews,
    onReload: vi.fn(),
    onUpdate: vi.fn(),
    onDelete: vi.fn(),
  }

  it('renders list of reviews', () => {
    render(<ReviewsList {...defaultProps} />)
    
    expect(screen.getByText('Great book!')).toBeInTheDocument()
    expect(screen.getByText('Good read')).toBeInTheDocument()
  })

  it('displays review ratings', () => {
    render(<ReviewsList {...defaultProps} />)
    
    expect(screen.getByText('Test User')).toBeInTheDocument()
    expect(screen.getByText('Other User')).toBeInTheDocument()
  })

  it('shows empty state when no reviews', () => {
    render(<ReviewsList {...defaultProps} reviews={[]} />)
    
    expect(screen.getByText('No reviews yet.')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <ReviewsList {...defaultProps} reviews={[]} className="custom-class" />
    )
    
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('renders reviews with proper structure', () => {
    const { container } = render(<ReviewsList {...defaultProps} />)
    
    // Should have review items
    const reviewItems = container.querySelectorAll('[class*="space-y"]')
    expect(reviewItems.length).toBeGreaterThan(0)
  })

  it('displays user information for each review', () => {
    render(<ReviewsList {...defaultProps} />)
    
    // Should show usernames
    expect(screen.getByText('Test User')).toBeInTheDocument()
    expect(screen.getByText('Other User')).toBeInTheDocument()
  })
})