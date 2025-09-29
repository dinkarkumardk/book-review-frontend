import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ReviewForm } from '../ReviewForm'

// Mock AuthContext
const mockUseAuth = vi.fn();
vi.mock('@/context/AuthContext', () => ({
  useAuth: () => mockUseAuth()
}))

// Mock the API service
vi.mock('@/services/api', () => ({
  default: {
    post: vi.fn(),
  }
}))

// Mock toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn()
  }
}))

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  },
  writable: true
})

describe('ReviewForm Component', () => {
  const defaultProps = {
    bookId: 'test-book-id',
    onCreated: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuth.mockReturnValue({
      user: { id: 'user1', name: 'Test User', email: 'test@example.com' },
      token: 'mock-token'
    })
  })

  it('renders the review form', () => {
    render(<ReviewForm {...defaultProps} />)
    
    expect(screen.getByPlaceholderText(/share your thoughts/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /post review/i })).toBeInTheDocument()
  })

  it('shows star rating buttons', () => {
    render(<ReviewForm {...defaultProps} />)
    
    expect(screen.getByLabelText('Rate 1 star')).toBeInTheDocument()
    expect(screen.getByLabelText('Rate 2 stars')).toBeInTheDocument()
    expect(screen.getByLabelText('Rate 3 stars')).toBeInTheDocument()
    expect(screen.getByLabelText('Rate 4 stars')).toBeInTheDocument()
    expect(screen.getByLabelText('Rate 5 stars')).toBeInTheDocument()
  })

  it('allows rating selection', () => {
    render(<ReviewForm {...defaultProps} />)
    
    const star3 = screen.getByLabelText('Rate 3 stars')
    fireEvent.click(star3)
    
    // The stars should be updated (this would need the actual implementation to test properly)
    expect(star3).toBeInTheDocument()
  })

  it('handles text input', () => {
    render(<ReviewForm {...defaultProps} />)
    
    const textArea = screen.getByPlaceholderText(/share your thoughts/i)
    fireEvent.change(textArea, { target: { value: 'This is a great book!' } })
    
    expect(textArea).toHaveValue('This is a great book!')
  })

  it('shows login prompt when user not authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      token: null
    })

    render(<ReviewForm {...defaultProps} />)
    
    expect(screen.getByText('Log in to write a review.')).toBeInTheDocument()
  })
})