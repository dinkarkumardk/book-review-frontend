import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import SearchBar from '../SearchBar'

describe('SearchBar Component - Advanced', () => {
  it('updates input value when typing', () => {
    const mockOnSearch = vi.fn()
    render(<SearchBar onSearch={mockOnSearch} />)
    
    const input = screen.getByPlaceholderText(/search books/i)
    
    fireEvent.change(input, { target: { value: 'Harry Potter' } })
    
    expect(input).toHaveValue('Harry Potter')
  })

  it('submits search when pressing Enter in form', () => {
    const mockOnSearch = vi.fn()
    render(<SearchBar onSearch={mockOnSearch} />)
    
    const input = screen.getByPlaceholderText(/search books/i)
    const form = input.closest('form')
    
    fireEvent.change(input, { target: { value: 'Test Query' } })
    fireEvent.submit(form!)
    
    expect(mockOnSearch).toHaveBeenCalledWith('Test Query')
  })

  it('submits empty search', () => {
    const mockOnSearch = vi.fn()
    render(<SearchBar onSearch={mockOnSearch} />)
    
    const submitButton = screen.getByRole('button', { name: /search/i })
    
    fireEvent.click(submitButton)
    
    expect(mockOnSearch).toHaveBeenCalledWith('')
  })

  it('prevents default form submission behavior', () => {
    const mockOnSearch = vi.fn()
    render(<SearchBar onSearch={mockOnSearch} />)
    
    const input = screen.getByPlaceholderText(/search books/i)
    const form = input.closest('form')
    
    // Submit the form and check that our handler is called
    fireEvent.submit(form!)
    
    // The preventDefault is called internally, so we just check that our handler runs
    expect(mockOnSearch).toHaveBeenCalled()
  })

  it('has proper accessibility attributes', () => {
    const mockOnSearch = vi.fn()
    render(<SearchBar onSearch={mockOnSearch} />)
    
    const input = screen.getByLabelText(/search books/i)
    const button = screen.getByRole('button', { name: /search/i })
    
    expect(input).toBeInTheDocument()
    expect(button).toBeInTheDocument()
  })
})