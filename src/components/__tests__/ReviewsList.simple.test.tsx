import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ReviewsList } from '../ReviewsList'
import type { Review } from '@/types/domain'

// Mock AuthContext
const mockUseAuth = vi.fn();
vi.mock('@/context/AuthContext', () => ({
  useAuth: () => mockUseAuth()
}))

// Mock the API service
vi.mock('@/services/api', () => ({
  default: {
    reviews: {
      list: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    put: vi.fn(),
    delete: vi.fn(),
  }
}))

// Mock toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn()
  }
}))

describe('ReviewsList Component', () => {
  const mockReviews: Review[] = [
    {
      id: '1',
      content: 'Great book!',
      rating: 5,
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
      userId: 'user1',
      bookId: 'book1',
      user: {
        id: 'user1',
        email: 'test@example.com',
        name: 'Test User',
        createdAt: '2023-01-01T00:00:00Z'
      }
    }
  ]

  const defaultProps = {
    reviews: mockReviews,
    onReviewUpdate: vi.fn(),
    onReviewDelete: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuth.mockReturnValue({
      user: { id: 'user1', name: 'Test User', email: 'test@example.com' },
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn()
    })
  })

  it('renders reviews list', () => {
    render(<ReviewsList {...defaultProps} />)
    
    expect(screen.getByText('Great book!')).toBeInTheDocument()
    expect(screen.getByText('Test User')).toBeInTheDocument()
    // Check for individual stars instead of combined text
    const stars = screen.getAllByText('★')
    expect(stars).toHaveLength(5) // Should have 5 stars
  })

  it('shows edit/delete buttons for user own reviews', () => {
    render(<ReviewsList {...defaultProps} />)
    
    expect(screen.getByText('Edit')).toBeInTheDocument()
    expect(screen.getByText('Del')).toBeInTheDocument()  // The button shows "Del" not "Delete"
  })

  it('handles empty reviews list', () => {
    render(<ReviewsList {...defaultProps} reviews={[]} />)
    
    expect(screen.getByText('No reviews yet.')).toBeInTheDocument()
  })

  it('hides edit/delete buttons for other users reviews', () => {
    const otherUserReview: Review[] = [{
      ...mockReviews[0],
      userId: 'other-user',
      user: {
        ...mockReviews[0].user,
        id: 'other-user',
        name: 'Other User',
        email: 'other@example.com'
      }
    }]

    render(<ReviewsList {...defaultProps} reviews={otherUserReview} />)
    
    expect(screen.queryByText('Edit')).not.toBeInTheDocument()
    expect(screen.queryByText('Del')).not.toBeInTheDocument()  // Fixed to "Del"
  })
})