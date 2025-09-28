import { describe, it, expect, vi, beforeEach } from 'vitest'
import api, {
  fetchUserFavorites,
  fetchUserReviews,
  toggleFavorite,
  fetchHybridRecommendations,
  fetchTopRatedRecommendations,
  fetchLLMRecommendations
} from '../api'

// Mock axios
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      defaults: {
        baseURL: 'http://localhost:3001/api',
        withCredentials: true,
        headers: {}
      },
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() }
      },
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn()
    }))
  }
}))

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: '',
    pathname: '/home'
  },
  writable: true
})

describe('API Service Configuration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
  })

  it('should be properly configured with correct baseURL', () => {
    expect(api.defaults.baseURL).toBe('http://localhost:3001/api')
    expect(api.defaults.withCredentials).toBe(true)
  })

  it('should have request and response interceptors configured', () => {
    expect(api.interceptors.request).toBeDefined()
    expect(api.interceptors.response).toBeDefined()
  })

  it('should be an axios instance with HTTP methods', () => {
    expect(api.get).toBeTypeOf('function')
    expect(api.post).toBeTypeOf('function')
    expect(api.put).toBeTypeOf('function')
    expect(api.delete).toBeTypeOf('function')
  })
})

describe('API Helper Functions', () => {
  const mockApiGet = vi.fn()
  const mockApiPost = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    // Mock the api methods
    api.get = mockApiGet
    api.post = mockApiPost
    
    // Set up default successful responses
    mockApiGet.mockResolvedValue({ data: [] })
    mockApiPost.mockResolvedValue({ data: { message: 'Success' } })
  })

  describe('fetchUserFavorites', () => {
    it('should fetch user favorites successfully', async () => {
      const mockFavorites = [
        { id: 1, title: 'Test Book', author: 'Test Author' }
      ]
      mockApiGet.mockResolvedValueOnce({ data: mockFavorites })

      const result = await fetchUserFavorites()

      expect(mockApiGet).toHaveBeenCalledWith('/profile/favorites')
      expect(result).toEqual(mockFavorites)
    })

    it('should handle fetchUserFavorites error', async () => {
      const error = new Error('Failed to fetch')
      mockApiGet.mockRejectedValueOnce(error)

      await expect(fetchUserFavorites()).rejects.toThrow('Failed to fetch')
      expect(mockApiGet).toHaveBeenCalledWith('/profile/favorites')
    })
  })

  describe('fetchUserReviews', () => {
    it('should fetch user reviews successfully', async () => {
      const mockReviews = [
        { 
          id: 1, 
          rating: 5, 
          text: 'Great book!',
          book: { id: 1, title: 'Test Book' }
        }
      ]
      mockApiGet.mockResolvedValueOnce({ data: mockReviews })

      const result = await fetchUserReviews()

      expect(mockApiGet).toHaveBeenCalledWith('/profile/reviews')
      expect(result).toEqual(mockReviews)
    })

    it('should handle fetchUserReviews error', async () => {
      const error = new Error('Network error')
      mockApiGet.mockRejectedValueOnce(error)

      await expect(fetchUserReviews()).rejects.toThrow('Network error')
    })
  })

  describe('toggleFavorite', () => {
    it('should toggle favorite successfully', async () => {
      const mockResponse = { message: 'Added to favorites' }
      mockApiPost.mockResolvedValueOnce({ data: mockResponse })

      const result = await toggleFavorite(123)

      expect(mockApiPost).toHaveBeenCalledWith('/profile/favorites', { bookId: 123 })
      expect(result).toEqual(mockResponse)
    })

    it('should handle toggleFavorite error', async () => {
      const error = new Error('Unauthorized')
      mockApiPost.mockRejectedValueOnce(error)

      await expect(toggleFavorite(123)).rejects.toThrow('Unauthorized')
    })
  })

  describe('fetchHybridRecommendations', () => {
    it('should fetch hybrid recommendations successfully', async () => {
      const mockRecommendations = [
        { id: 1, title: 'Recommended Book', author: 'Author' }
      ]
      mockApiGet.mockResolvedValueOnce({ data: mockRecommendations })

      const result = await fetchHybridRecommendations()

      expect(mockApiGet).toHaveBeenCalledWith('/recommendations')
      expect(result).toEqual(mockRecommendations)
    })

    it('should handle recommendation fetch error', async () => {
      mockApiGet.mockRejectedValueOnce(new Error('Server error'))

      await expect(fetchHybridRecommendations()).rejects.toThrow('Server error')
    })
  })

  describe('fetchTopRatedRecommendations', () => {
    it('should fetch top-rated recommendations successfully', async () => {
      const mockBooks = [{ id: 1, title: 'Top Rated Book', avgRating: 4.8 }]
      mockApiGet.mockResolvedValueOnce({ data: mockBooks })

      const result = await fetchTopRatedRecommendations()

      expect(mockApiGet).toHaveBeenCalledWith('/recommendations/top-rated')
      expect(result).toEqual(mockBooks)
    })
  })

  describe('fetchLLMRecommendations', () => {
    it('should fetch LLM recommendations successfully', async () => {
      const mockBooks = [{ id: 1, title: 'LLM Recommended Book' }]
      mockApiGet.mockResolvedValueOnce({ data: mockBooks })

      const result = await fetchLLMRecommendations()

      expect(mockApiGet).toHaveBeenCalledWith('/recommendations/llm')
      expect(result).toEqual(mockBooks)
    })
  })
})