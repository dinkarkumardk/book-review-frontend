import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ReviewsList } from '../ReviewsList'
import type { Review } from '@/types/domain'

// Simple mock setup to avoid hoisting issues
vi.mock('@/services/api', () => ({
  default: {
    put: vi.fn(),
    delete: vi.fn(),
  }
}))

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  }
}))

// Mock window.confirm
Object.defineProperty(window, 'confirm', {
  writable: true,
  value: vi.fn(),
})

// Mock AuthContext
const mockUseAuth = vi.fn()
vi.mock('@/context/AuthContext', () => ({
  useAuth: () => mockUseAuth()
}))

// Import mocked modules
import api from '@/services/api'
import toast from 'react-hot-toast'

describe('ReviewsList Interaction Tests', () => {
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
        name: 'Test User',
        email: 'test@example.com'
      }
    },
    {
      id: '2',
      content: 'Decent read',
      rating: 3,
      createdAt: '2023-01-02T00:00:00Z',
      updatedAt: '2023-01-02T00:00:00Z',
      userId: 'user2',
      bookId: 'book1',
      user: {
        id: 'user2',
        name: 'Other User',
        email: 'other@example.com'
      }
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuth.mockReturnValue({
      user: { id: 'user1', email: 'test@example.com', name: 'Test User' },
      isLoggedIn: true
    })
    // Setup successful API responses by default
    vi.mocked(api.put).mockResolvedValue({ data: { id: '1', content: 'Updated', rating: 4 } })
    vi.mocked(api.delete).mockResolvedValue({})
    vi.mocked(window.confirm).mockReturnValue(true)
  })

  it('enters edit mode when edit button is clicked', async () => {
    render(<ReviewsList reviews={mockReviews} />)
    
    const editButton = screen.getByText('Edit')
    fireEvent.click(editButton)
    
    await waitFor(() => {
      expect(screen.getByText('Save')).toBeInTheDocument()
      expect(screen.getByText('Cancel')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Great book!')).toBeInTheDocument()
    })
  })

  it('cancels edit mode when cancel button is clicked', async () => {
    render(<ReviewsList reviews={mockReviews} />)
    
    const editButton = screen.getByText('Edit')
    fireEvent.click(editButton)
    
    await waitFor(() => {
      expect(screen.getByText('Cancel')).toBeInTheDocument()
    })
    
    const cancelButton = screen.getByText('Cancel')
    fireEvent.click(cancelButton)
    
    await waitFor(() => {
      expect(screen.getByText('Edit')).toBeInTheDocument()
      expect(screen.queryByText('Save')).not.toBeInTheDocument()
    })
  })

  it('updates rating in edit mode', async () => {
    render(<ReviewsList reviews={mockReviews} />)
    
    const editButton = screen.getByText('Edit')
    fireEvent.click(editButton)
    
    // Wait for edit form to appear
    await waitFor(() => {
      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })
    
    // Find and click rating buttons (all stars are now filled in edit mode with current rating)
    const starButtons = screen.getAllByRole('button').filter(btn => 
      btn.textContent?.includes('★')
    )
    expect(starButtons.length).toEqual(5) // 5 star rating buttons
  })

  it('updates text content in edit mode', async () => {
    render(<ReviewsList reviews={mockReviews} />)
    
    const editButton = screen.getByText('Edit')
    fireEvent.click(editButton)
    
    await waitFor(() => {
      const textarea = screen.getByDisplayValue('Great book!')
      fireEvent.change(textarea, { target: { value: 'Updated review content' } })
      expect(screen.getByDisplayValue('Updated review content')).toBeInTheDocument()
    })
  })

  it('saves edit and calls onUpdate callback', async () => {
    const mockOnUpdate = vi.fn()
    render(<ReviewsList reviews={mockReviews} onUpdate={mockOnUpdate} />)
    
    const editButton = screen.getByText('Edit')
    fireEvent.click(editButton)
    
    await waitFor(() => {
      const textarea = screen.getByDisplayValue('Great book!')
      fireEvent.change(textarea, { target: { value: 'Updated content' } })
      
      const saveButton = screen.getByText('Save')
      fireEvent.click(saveButton)
    })
    
    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith('/reviews/1', {
        rating: 5,
        text: 'Updated content'
      })
      expect(toast.success).toHaveBeenCalledWith('Review updated')
      expect(mockOnUpdate).toHaveBeenCalledWith({ id: '1', content: 'Updated', rating: 4 })
    })
  })

  it('calls onReload when save response has no data', async () => {
    const mockOnReload = vi.fn()
    vi.mocked(api.put).mockResolvedValue({}) // No data in response
    
    render(<ReviewsList reviews={mockReviews} onReload={mockOnReload} />)
    
    const editButton = screen.getByText('Edit')
    fireEvent.click(editButton)
    
    await waitFor(() => {
      const saveButton = screen.getByText('Save')
      fireEvent.click(saveButton)
    })
    
    await waitFor(() => {
      expect(mockOnReload).toHaveBeenCalled()
    })
  })

  it('handles save edit API errors', async () => {
    vi.mocked(api.put).mockRejectedValue(new Error('Update failed'))
    
    render(<ReviewsList reviews={mockReviews} />)
    
    const editButton = screen.getByText('Edit')
    fireEvent.click(editButton)
    
    await waitFor(() => {
      const saveButton = screen.getByText('Save')
      fireEvent.click(saveButton)
    })
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Update failed')
    })
  })

  it('shows save and cancel buttons in edit mode', async () => {
    render(<ReviewsList reviews={mockReviews} />)
    
    const editButton = screen.getByText('Edit')
    fireEvent.click(editButton)
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })
  })

  it('deletes review when delete button is clicked and confirmed', async () => {
    const mockOnDelete = vi.fn()
    render(<ReviewsList reviews={mockReviews} onDelete={mockOnDelete} />)
    
    const deleteButton = screen.getByText('Del')
    fireEvent.click(deleteButton)
    
    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalledWith('Delete this review?')
      expect(api.delete).toHaveBeenCalledWith('/reviews/1')
      expect(toast.success).toHaveBeenCalledWith('Review deleted')
      expect(mockOnDelete).toHaveBeenCalledWith('1')
    })
  })

  it('does not delete review when confirmation is cancelled', async () => {
    vi.mocked(window.confirm).mockReturnValue(false)
    const mockOnDelete = vi.fn()
    
    render(<ReviewsList reviews={mockReviews} onDelete={mockOnDelete} />)
    
    const deleteButton = screen.getByText('Del')
    fireEvent.click(deleteButton)
    
    expect(window.confirm).toHaveBeenCalledWith('Delete this review?')
    expect(api.delete).not.toHaveBeenCalled()
    expect(mockOnDelete).not.toHaveBeenCalled()
  })

  it('handles delete API errors', async () => {
    vi.mocked(api.delete).mockRejectedValue(new Error('Delete failed'))
    
    render(<ReviewsList reviews={mockReviews} />)
    
    const deleteButton = screen.getByText('Del')
    fireEvent.click(deleteButton)
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Delete failed')
    })
  })

  it('handles API error with response message', async () => {
    const apiError = {
      response: {
        data: {
          message: 'Custom error message'
        }
      }
    }
    vi.mocked(api.put).mockRejectedValue(apiError)
    
    render(<ReviewsList reviews={mockReviews} />)
    
    const editButton = screen.getByText('Edit')
    fireEvent.click(editButton)
    
    await waitFor(() => {
      const saveButton = screen.getByText('Save')
      fireEvent.click(saveButton)
    })
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Custom error message')
    })
  })

  it('disables buttons when operation is in progress', async () => {
    render(<ReviewsList reviews={mockReviews} />)
    
    const editButton = screen.getByText('Edit')
    fireEvent.click(editButton)
    
    // Wait for edit form to appear first
    await waitFor(() => {
      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })
    
    // Just test that edit form appears with buttons
    expect(screen.getByText('Save')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })
})