import type { ReactElement } from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  }
}))

// Mock API service
export const mockApi = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
}

vi.mock('@/services/api', () => ({
  default: mockApi
}))

// Simple test wrapper without AuthProvider to avoid circular dependencies
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <MemoryRouter>
      {children}
    </MemoryRouter>
  )
}

// Custom render function
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: TestWrapper, ...options })

export * from '@testing-library/react'
export { customRender as render }

// Mock data helpers
export const mockUser = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com'
}

export const mockBook = {
  id: 1,
  title: 'Test Book',
  author: 'Test Author',
  description: 'A great test book',
  coverImageURL: 'https://example.com/cover.jpg',
  genres: ['Fiction', 'Mystery'],
  publishedYear: 2023,
  avgRating: 4.5,
  reviewCount: 10,
  reviews: []
}

export const mockReview = {
  id: 1,
  rating: 5,
  text: 'Great book!',
  userId: 1,
  bookId: 1,
  createdAt: '2023-01-01T00:00:00.000Z',
  updatedAt: '2023-01-01T00:00:00.000Z',
  user: mockUser
}

export const createMockBooks = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    ...mockBook,
    id: i + 1,
    title: `Test Book ${i + 1}`,
    author: `Author ${i + 1}`
  }))
}

// Mock localStorage
export const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
})