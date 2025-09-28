import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import BookCard from '../BookCard'

const mockBookProps = {
  id: '1',
  title: 'Test Book',
  author: 'Test Author',
  coverImage: 'https://example.com/cover.jpg',
  averageRating: 4.5,
  initialFavorited: false
}

describe('BookCard Component', () => {
  it('renders book title', () => {
    render(
      <MemoryRouter>
        <BookCard {...mockBookProps} />
      </MemoryRouter>
    )
    
    expect(screen.getByText('Test Book')).toBeInTheDocument()
  })

  it('renders book author', () => {
    render(
      <MemoryRouter>
        <BookCard {...mockBookProps} />
      </MemoryRouter>
    )
    
    expect(screen.getByText(/Test Author/)).toBeInTheDocument()
  })
})