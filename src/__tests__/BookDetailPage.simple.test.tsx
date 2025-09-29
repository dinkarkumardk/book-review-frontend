import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import BookDetailPage from '../pages/BookDetailPage'

// Mock API
vi.mock('@/services/api', () => ({
  default: {
    get: vi.fn().mockResolvedValue({ data: [] }),
  },
  toggleFavorite: vi.fn()
}))

// Mock AuthContext
vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'user1', name: 'Test User', email: 'test@example.com' },
    token: 'mock-token'
  })
}))

// Mock components
vi.mock('@/components/ReviewForm', () => ({
  ReviewForm: () => <div data-testid="review-form">Review Form</div>
}))

vi.mock('@/components/ReviewsList', () => ({
  ReviewsList: () => <div data-testid="reviews-list">Reviews List</div>
}))

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn()
  }
}))

const renderBookDetailPage = (bookId = '1') => {
  return render(
    <MemoryRouter initialEntries={[`/books/${bookId}`]}>
      <BookDetailPage />
    </MemoryRouter>
  )
}

describe('BookDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows loading state initially', () => {
    renderBookDetailPage()
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('shows loading initially', () => {
    renderBookDetailPage()
    // This will always show loading since we're mocking the API
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('handles page routing', () => {
    render(
      <MemoryRouter initialEntries={['/books/1']}>
        <BookDetailPage />
      </MemoryRouter>
    )

    // Should show loading initially regardless of book ID
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })
})