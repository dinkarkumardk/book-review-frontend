import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { BookCardShadcn } from '../BookCardShadcn'
import type { Book } from '@/types/domain'

// Mock the image component
vi.mock('@/components/ImageWithFallback', () => ({
  default: ({ src, alt, className }: any) => <img src={src} alt={alt} className={className} />,
}))

// Mock utility functions
vi.mock('@/utils/getCoverFromBook', () => ({
  getCoverFromBook: () => 'https://example.com/cover.jpg',
}))

vi.mock('@/lib/utils', () => ({
  cn: (...classes: string[]) => classes.filter(Boolean).join(' '),
}))

describe('BookCardShadcn Component', () => {
  const mockBook: Book = {
    id: '1',
    title: 'Test Book',
    author: 'Test Author',
    genres: ['Fiction', 'Drama'],
    description: 'A test book description',
    publishedYear: 2023,
    averageRating: 4.5,
    ratingsCount: 100,
    coverImage: 'https://example.com/cover.jpg',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  }

  const renderWithRouter = (component: React.ReactElement) => {
    return render(
      <MemoryRouter>
        {component}
      </MemoryRouter>
    )
  }

  it('renders book card with basic information', () => {
    renderWithRouter(<BookCardShadcn book={mockBook} />)
    
    expect(screen.getByText('Test Book')).toBeInTheDocument()
    expect(screen.getByText('Test Author')).toBeInTheDocument()
  })

  it('renders book cover image', () => {
    renderWithRouter(<BookCardShadcn book={mockBook} />)
    
    const image = screen.getByAltText('Test Book')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src', 'https://example.com/cover.jpg')
  })

  it('creates link to book detail page', () => {
    renderWithRouter(<BookCardShadcn book={mockBook} />)
    
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/books/1')
  })

  it('shows rating when provided', () => {
    renderWithRouter(<BookCardShadcn book={mockBook} />)
    
    // Rating should be displayed as 4.5 with ratings count
    expect(screen.getByText('4.5')).toBeInTheDocument()
    expect(screen.getByText('(100)')).toBeInTheDocument()
  })

  it('shows genres when showGenres is true', () => {
    renderWithRouter(<BookCardShadcn book={mockBook} showGenres={true} />)
    
    expect(screen.getByText('Fiction')).toBeInTheDocument()
    expect(screen.getByText('Drama')).toBeInTheDocument()
  })

  it('hides genres when showGenres is false', () => {
    renderWithRouter(<BookCardShadcn book={mockBook} showGenres={false} />)
    
    expect(screen.queryByText('Fiction')).not.toBeInTheDocument()
    expect(screen.queryByText('Drama')).not.toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = renderWithRouter(
      <BookCardShadcn book={mockBook} className="custom-class" />
    )
    
    // Check that the Card component has the custom class
    const card = container.querySelector('[class*="custom-class"]')
    expect(card).toBeInTheDocument()
  })

  it('calls onClick handler when provided', () => {
    const mockOnClick = vi.fn()
    renderWithRouter(<BookCardShadcn book={mockBook} onClick={mockOnClick} />)
    
    const card = screen.getByRole('link').parentElement
    card?.click()
    
    expect(mockOnClick).toHaveBeenCalledWith(mockBook)
  })

  it('handles book without rating gracefully', () => {
    const bookWithoutRating: Book = { ...mockBook, averageRating: undefined, ratingsCount: undefined }
    renderWithRouter(<BookCardShadcn book={bookWithoutRating} />)
    
    expect(screen.getByText('Test Book')).toBeInTheDocument()
    expect(screen.queryByText('4.5')).not.toBeInTheDocument()
  })

  it('applies hover effect classes', () => {
    const { container } = renderWithRouter(<BookCardShadcn book={mockBook} />)
    
    const card = container.querySelector('.group')
    expect(card).toHaveClass('hover:shadow-lg', 'transition-shadow', 'duration-200')
  })
})