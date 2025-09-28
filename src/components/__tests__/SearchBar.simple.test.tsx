import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import SearchBar from '../SearchBar'

const mockOnSearch = vi.fn()

describe('SearchBar Component', () => {
  it('renders search input', () => {
    render(<SearchBar onSearch={mockOnSearch} />)
    
    expect(screen.getByPlaceholderText(/search books/i)).toBeInTheDocument()
  })

  it('calls onSearch when form is submitted', () => {
    render(<SearchBar onSearch={mockOnSearch} />)
    
    const input = screen.getByPlaceholderText(/search books/i)
    const submitButton = screen.getByRole('button', { name: /search/i })
    
    fireEvent.change(input, { target: { value: 'test query' } })
    fireEvent.click(submitButton)
    
    expect(mockOnSearch).toHaveBeenCalledWith('test query')
  })
})