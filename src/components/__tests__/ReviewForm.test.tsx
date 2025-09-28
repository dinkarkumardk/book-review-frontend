import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ReviewForm } from '../ReviewForm'

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
    post: vi.fn().mockResolvedValue({ data: { id: '1' } }),
  },
}))

// Mock toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

describe('ReviewForm Component', () => {
  const defaultProps = {
    bookId: '1',
    onCreated: vi.fn(),
  }

  it('renders review form', () => {
    render(<ReviewForm {...defaultProps} />)
    
    expect(screen.getByPlaceholderText(/share your thoughts/i)).toBeInTheDocument()
  })

  it('renders rating stars', () => {
    render(<ReviewForm {...defaultProps} />)
    
    // Should have star rating elements
    const stars = screen.getAllByRole('button')
    expect(stars.length).toBeGreaterThan(0)
  })

  it('renders review textarea', () => {
    render(<ReviewForm {...defaultProps} />)
    
    const textarea = screen.getByRole('textbox')
    expect(textarea).toBeInTheDocument()
    expect(textarea).toHaveAttribute('placeholder', 'Share your thoughts about this book...')
  })

  it('renders submit button', () => {
    render(<ReviewForm {...defaultProps} />)
    
    const submitButton = screen.getByText('Post Review')
    expect(submitButton).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <ReviewForm {...defaultProps} className="custom-class" />
    )
    
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('has proper form structure', () => {
    const { container } = render(<ReviewForm {...defaultProps} />)
    
    const form = container.querySelector('form')
    expect(form).toBeInTheDocument()
  })
})