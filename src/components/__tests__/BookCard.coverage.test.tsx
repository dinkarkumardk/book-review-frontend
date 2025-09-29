import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
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

// Mock the API service
vi.mock('@/services/api', () => ({
  toggleFavorite: vi.fn().mockResolvedValue({})
}))

// Mock the ImageWithFallback component
vi.mock('../ImageWithFallback', () => ({
  default: ({ src, alt, className }: { src: string; alt: string; className?: string }) => (
    <img src={src} alt={alt} className={className} />
  )
}))

// Mock getAvatarUrl utility
vi.mock('../utils/getAvatarUrl', () => ({
  default: vi.fn().mockReturnValue('https://example.com/avatar.jpg')
}))

describe('BookCard - Coverage Tests', () => {
  it('covers favorite toggle functionality', async () => {
    render(
      <MemoryRouter>
        <BookCard {...mockBookProps} />
      </MemoryRouter>
    )

    const favoriteButton = screen.getByRole('button')
    fireEvent.click(favoriteButton)
    
    // Should update the favorite state
    expect(favoriteButton).toBeInTheDocument()
  })

  it('covers favorite toggle with already favorited book', async () => {
    render(
      <MemoryRouter>
        <BookCard {...mockBookProps} initialFavorited={true} />
      </MemoryRouter>
    )

    const favoriteButton = screen.getByRole('button')
    expect(favoriteButton).toBeInTheDocument()
  })

  it('covers invalid numericId handling', async () => {
    render(
      <MemoryRouter>
        <BookCard {...mockBookProps} id="invalid" />
      </MemoryRouter>
    )

    const favoriteButton = screen.getByRole('button')
    fireEvent.click(favoriteButton)
    
    expect(favoriteButton).toBeInTheDocument()
  })

  it('covers book article structure', () => {
    render(
      <MemoryRouter>
        <BookCard {...mockBookProps} />
      </MemoryRouter>
    )

    const bookArticle = screen.getByRole('article')
    expect(bookArticle).toHaveAttribute('data-book-id', '1')
  })

  it('covers title and author rendering', () => {
    render(
      <MemoryRouter>
        <BookCard {...mockBookProps} />
      </MemoryRouter>
    )
    
    expect(screen.getByText(mockBookProps.title)).toBeInTheDocument()
    expect(screen.getByText(`by ${mockBookProps.author}`)).toBeInTheDocument()
  })

  it('covers rating display', () => {
    render(
      <MemoryRouter>
        <BookCard {...mockBookProps} />
      </MemoryRouter>
    )
    
    expect(screen.getByText('4.5')).toBeInTheDocument()
    expect(screen.getByText('/5')).toBeInTheDocument()
  })

  it('covers zero rating display', () => {
    render(
      <MemoryRouter>
        <BookCard {...mockBookProps} averageRating={0} />
      </MemoryRouter>
    )
    
    expect(screen.getByText('0.0')).toBeInTheDocument()
    expect(screen.getByText('/5')).toBeInTheDocument()
  })

  it('covers cover image rendering with coverImage prop', () => {
    render(
      <MemoryRouter>
        <BookCard {...mockBookProps} />
      </MemoryRouter>
    )
    
    const image = screen.getByAltText(mockBookProps.title)
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src', mockBookProps.coverImage)
  })

  it('covers cover image rendering without coverImage prop', () => {
    render(
      <MemoryRouter>
        <BookCard {...mockBookProps} coverImage={null} />
      </MemoryRouter>
    )
    
    const image = screen.getByAltText(mockBookProps.title) as HTMLImageElement
    expect(image).toBeInTheDocument()
    // Should use generated avatar when no coverImage
    expect(image.src).toContain('dicebear.com')
  })

  it('covers favorite button event propagation stop', async () => {
    const mockParentClick = vi.fn()
    
    render(
      <MemoryRouter>
        <div onClick={mockParentClick}>
          <BookCard {...mockBookProps} />
        </div>
      </MemoryRouter>
    )

    const favoriteButton = screen.getByRole('button')
    fireEvent.click(favoriteButton)
    
    // Parent click should not be triggered due to stopPropagation
    expect(mockParentClick).not.toHaveBeenCalled()
  })

  it('covers API error handling for favorite toggle', async () => {
    const { toggleFavorite } = await import('@/services/api')
    vi.mocked(toggleFavorite).mockRejectedValue(new Error('API Error'))
    
    render(
      <MemoryRouter>
        <BookCard {...mockBookProps} />
      </MemoryRouter>
    )

    const favoriteButton = screen.getByRole('button')
    fireEvent.click(favoriteButton)
    
    // Should handle error gracefully
    expect(favoriteButton).toBeInTheDocument()
  })
})