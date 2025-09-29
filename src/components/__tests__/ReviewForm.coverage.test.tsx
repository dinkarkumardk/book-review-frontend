import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ReviewForm } from '../ReviewForm'
import api from '@/services/api'
import toast from 'react-hot-toast'

const mockUser = {
  id: '1',
  name: 'Test User',
  email: 'test@example.com'
}

const mockUseAuth = vi.fn()

// Mock AuthContext
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

describe('ReviewForm - Coverage Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuth.mockReturnValue({ user: mockUser })
    
    // Mock localStorage
    global.localStorage.getItem = vi.fn()
    global.localStorage.setItem = vi.fn()
    global.localStorage.removeItem = vi.fn()
  })

  it('handles localStorage getItem errors gracefully', () => {
    global.localStorage.getItem = vi.fn().mockImplementation(() => {
      throw new Error('Storage error')
    })

    render(<ReviewForm bookId="123" onCreated={vi.fn()} />)

    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('covers setDraftReview with empty content removal path', async () => {
    const mockRemoveItem = vi.fn()
    global.localStorage.removeItem = mockRemoveItem
    
    render(<ReviewForm bookId="123" onCreated={vi.fn()} />)

    const textarea = screen.getByRole('textbox')
    
    // Add content then remove it to trigger removeItem path
    fireEvent.change(textarea, { target: { value: 'Some content' } })
    await waitFor(() => {})
    
    fireEvent.change(textarea, { target: { value: '' } })
    await waitFor(() => {
      expect(mockRemoveItem).toHaveBeenCalledWith('review_draft_123')
    })
  })

  it('covers rating validation path', () => {
    render(<ReviewForm bookId="123" onCreated={vi.fn()} />)

    const submitButton = screen.getByRole('button', { name: /post review/i })
    expect(submitButton).toBeDisabled()
  })

  it('covers content validation path', async () => {
    render(<ReviewForm bookId="123" onCreated={vi.fn()} />)

    // Click first star to set rating
    const firstStar = screen.getAllByRole('button')[0]
    fireEvent.click(firstStar)

    const submitButton = screen.getByRole('button', { name: /post review/i })
    expect(submitButton).toBeDisabled()
  })

  it('covers both rating and content validation success', async () => {
    render(<ReviewForm bookId="123" onCreated={vi.fn()} />)

    // Set rating
    const firstStar = screen.getAllByRole('button')[0]
    fireEvent.click(firstStar)

    // Set content
    const textarea = screen.getByRole('textbox')
    fireEvent.change(textarea, { target: { value: 'Great book!' } })

    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: /post review/i })
      expect(submitButton).not.toBeDisabled()
    })
  })

  it('covers localStorage setItem when user is authenticated', async () => {
    const mockSetItem = vi.fn()
    global.localStorage.setItem = mockSetItem
    
    render(<ReviewForm bookId="123" onCreated={vi.fn()} />)

    const textarea = screen.getByRole('textbox')
    fireEvent.change(textarea, { target: { value: 'Test content' } })

    await waitFor(() => {
      expect(mockSetItem).toHaveBeenCalledWith('review_draft_123', JSON.stringify({
        rating: 0,
        content: 'Test content'
      }))
    })
  })

  it('covers no draft saving when user is not authenticated', async () => {
    mockUseAuth.mockReturnValue({ user: null })
    
    render(<ReviewForm bookId="123" onCreated={vi.fn()} />)

    // Should show login message when user is not authenticated
    expect(screen.getByText('Log in to write a review.')).toBeInTheDocument()
  })

  it('covers successful form submission path', async () => {
    const mockOnCreated = vi.fn()
    const mockPost = vi.mocked(api.post).mockResolvedValue({ data: { id: '123' } })
    
    render(<ReviewForm bookId="123" onCreated={mockOnCreated} />)

    // Fill form completely
    const firstStar = screen.getAllByRole('button')[0]
    fireEvent.click(firstStar)

    const textarea = screen.getByRole('textbox')
    fireEvent.change(textarea, { target: { value: 'Great book!' } })

    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: /post review/i })
      fireEvent.click(submitButton)
    })

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith('/books/123/reviews', {
        rating: 1,
        text: 'Great book!'
      })
      expect(toast.success).toHaveBeenCalledWith('Review added')
      expect(mockOnCreated).toHaveBeenCalled()
    })
  })

  it('covers API error handling during submission', async () => {
    vi.mocked(api.post).mockRejectedValue({
      response: { data: { message: 'Validation failed' } }
    })
    
    render(<ReviewForm bookId="123" onCreated={vi.fn()} />)

    // Fill form
    const firstStar = screen.getAllByRole('button')[0]
    fireEvent.click(firstStar)

    const textarea = screen.getByRole('textbox')
    fireEvent.change(textarea, { target: { value: 'Test content' } })

    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: /post review/i })
      fireEvent.click(submitButton)
    })

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Validation failed')
    })
  })

  it('covers generic API error handling', async () => {
    vi.mocked(api.post).mockRejectedValue(new Error('Network error'))
    
    render(<ReviewForm bookId="123" onCreated={vi.fn()} />)

    // Fill form
    const firstStar = screen.getAllByRole('button')[0]
    fireEvent.click(firstStar)

    const textarea = screen.getByRole('textbox')
    fireEvent.change(textarea, { target: { value: 'Test content' } })

    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: /post review/i })
      fireEvent.click(submitButton)
    })

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to add review')
    })
  })

  it('covers draft loading from localStorage on mount', () => {
    global.localStorage.getItem = vi.fn().mockReturnValue(JSON.stringify({
      rating: 3,
      content: 'Draft content'
    }))
    
    render(<ReviewForm bookId="123" onCreated={vi.fn()} />)

    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
    expect(textarea.value).toBe('Draft content')
  })

  it('covers malformed localStorage data handling', () => {
    global.localStorage.getItem = vi.fn().mockReturnValue('[invalid json')
    
    render(<ReviewForm bookId="123" onCreated={vi.fn()} />)

    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
    expect(textarea.value).toBe('')
  })

  it('covers localStorage setItem error handling', async () => {
    global.localStorage.setItem = vi.fn().mockImplementation(() => {
      throw new Error('Storage quota exceeded')
    })
    
    render(<ReviewForm bookId="123" onCreated={vi.fn()} />)

    const textarea = screen.getByRole('textbox')
    
    // This should not throw even if localStorage fails
    expect(() => {
      fireEvent.change(textarea, { target: { value: 'Test content' } })
    }).not.toThrow()
  })

  it('covers custom className application', () => {
    render(
      <ReviewForm 
        bookId="123" 
        onCreated={vi.fn()} 
        className="custom-review-form" 
      />
    )

    // Check className on the form element by data-testid or container
    const form = document.querySelector('form')
    expect(form).toHaveClass('custom-review-form')
  })

  it('covers form reset after successful submission', async () => {
    const mockPost = vi.mocked(api.post).mockResolvedValue({ data: { id: '123' } })
    
    render(<ReviewForm bookId="123" onCreated={vi.fn()} />)

    // Fill form
    const stars = screen.getAllByRole('button')
    fireEvent.click(stars[2]) // 3 stars

    const textarea = screen.getByRole('textbox')
    fireEvent.change(textarea, { target: { value: 'Great book!' } })

    const submitButton = screen.getByRole('button', { name: /post review/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalled()
    })

    // Check form is reset
    await waitFor(() => {
      const textareaAfter = screen.getByRole('textbox') as HTMLTextAreaElement
      expect(textareaAfter.value).toBe('')
    })
  })
})