import { describe, it, expect } from 'vitest'
import type { User, Book, Review } from '../domain'

describe('Domain Types', () => {
  it('User interface structure', () => {
    const user: User = {
      id: '1',
      name: 'Test User',
      email: 'test@example.com'
    }
    
    expect(user.id).toBe('1')
    expect(user.name).toBe('Test User')
    expect(user.email).toBe('test@example.com')
  })

  it('Book interface structure', () => {
    const book: Book = {
      id: '1',
      title: 'Test Book',
      author: 'Test Author',
      description: 'A test book description'
    }
    
    expect(book.id).toBe('1')
    expect(book.title).toBe('Test Book')
    expect(book.author).toBe('Test Author')
    expect(book.description).toBe('A test book description')
  })

  it('Review interface structure', () => {
    const review: Review = {
      id: '1',
      rating: 5,
      content: 'Great book!',
      createdAt: '2024-01-01T00:00:00Z',
      userId: '1',
      bookId: '1'
    }
    
    expect(review.id).toBe('1')
    expect(review.rating).toBe(5)
    expect(review.content).toBe('Great book!')
    expect(review.userId).toBe('1')
    expect(review.bookId).toBe('1')
  })

  it('handles optional Book fields', () => {
    const bookWithOptionals: Book = {
      id: '1',
      title: 'Test Book',
      author: 'Test Author',
      description: 'A test book description',
      genres: ['Fiction', 'Adventure'],
      publishedYear: 2024,
      coverImage: 'https://example.com/cover.jpg',
      averageRating: 4.5,
      ratingsCount: 100
    }
    
    expect(bookWithOptionals.genres).toEqual(['Fiction', 'Adventure'])
    expect(bookWithOptionals.publishedYear).toBe(2024)
    expect(bookWithOptionals.averageRating).toBe(4.5)
  })

  it('handles Review with optional user relation', () => {
    const reviewWithUser: Review = {
      id: '1',
      rating: 5,
      content: 'Great book!',
      createdAt: '2024-01-01T00:00:00Z',
      userId: '1',
      bookId: '1',
      user: {
        id: '1',
        name: 'Test User',
        email: 'test@example.com'
      }
    }
    
    expect(reviewWithUser.user?.name).toBe('Test User')
  })

  it('handles User with optional fields', () => {
    const userWithOptionals: User = {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      avatarUrl: 'https://example.com/avatar.jpg',
      createdAt: '2024-01-01T00:00:00Z'
    }
    
    expect(userWithOptionals.avatarUrl).toBe('https://example.com/avatar.jpg')
    expect(userWithOptionals.createdAt).toBe('2024-01-01T00:00:00Z')
  })

  it('handles Review with optional title', () => {
    const reviewWithTitle: Review = {
      id: '1',
      rating: 4,
      title: 'Great Read',
      content: 'Really enjoyed this book!',
      createdAt: '2024-01-01T00:00:00Z',
      userId: '1',
      bookId: '1'
    }
    
    expect(reviewWithTitle.title).toBe('Great Read')
  })
})