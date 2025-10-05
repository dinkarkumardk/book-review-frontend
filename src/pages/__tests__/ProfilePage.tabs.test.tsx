import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ProfilePage from '../ProfilePage'

// Simple mock setup to avoid hoisting issues  
vi.mock('@/services/api', () => ({
  fetchUserFavorites: vi.fn(),
  fetchUserReviews: vi.fn(), 
  fetchHybridRecommendations: vi.fn(),
  fetchTopRatedRecommendations: vi.fn(),
  fetchLLMRecommendations: vi.fn(),
}))

// Mock AuthContext
const mockUseAuth = vi.fn()
const mockLogout = vi.fn()
vi.mock('@/context/AuthContext', () => ({
  useAuth: () => mockUseAuth()
}))

// Import mocked modules
import { 
  fetchUserFavorites,
  fetchUserReviews,
  fetchHybridRecommendations,
  fetchTopRatedRecommendations,
  fetchLLMRecommendations 
} from '@/services/api'

describe('ProfilePage Tab Navigation Tests', () => {
  const mockUser = {
    id: 'user1',
    name: 'Test User',
    email: 'test@example.com'
  }

  const mockBooks = [
    {
      id: 1,
      title: 'Test Book 1',
      author: 'Test Author 1',
      avgRating: 4.5,
      reviewCount: 10
    },
    {
      id: 2,
      title: 'Test Book 2', 
      author: 'Test Author 2',
      avgRating: 3.8,
      reviewCount: 5
    }
  ]

  const mockReviews = [
    {
      id: 1,
      rating: 5,
      text: 'Great book!',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
      book: { id: 1, title: 'Test Book 1', author: 'Test Author 1' }
    },
    {
      id: 2,
      rating: 4,
      text: 'Pretty good read',
      createdAt: '2023-01-02T00:00:00Z', 
      updatedAt: '2023-01-02T00:00:00Z',
      book: { id: 2, title: 'Test Book 2', author: 'Test Author 2' }
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuth.mockReturnValue({
      user: mockUser,
      logout: mockLogout
    })
    
    // Setup successful API responses by default
    vi.mocked(fetchUserFavorites).mockResolvedValue(mockBooks)
    vi.mocked(fetchUserReviews).mockResolvedValue(mockReviews)
    vi.mocked(fetchHybridRecommendations).mockResolvedValue({
      recommendations: mockBooks,
      mode: 'hybrid',
      pagination: { page: 1, limit: 10, total: mockBooks.length, totalPages: 1 }
    })
    vi.mocked(fetchTopRatedRecommendations).mockResolvedValue({
      recommendations: mockBooks,
      mode: 'top-rated',
      pagination: { page: 1, limit: 10, total: mockBooks.length, totalPages: 1 }
    })
    vi.mocked(fetchLLMRecommendations).mockResolvedValue({
      recommendations: mockBooks,
      mode: 'llm',
      pagination: { page: 1, limit: 10, total: mockBooks.length, totalPages: 1 }
    })
  })

  it('renders profile page with user information', async () => {
    render(<ProfilePage />)
    
    expect(screen.getByText('Profile')).toBeInTheDocument()
    expect(screen.getByText('Test User')).toBeInTheDocument()
    expect(screen.getByText('test@example.com')).toBeInTheDocument()
    expect(screen.getByText('Logout')).toBeInTheDocument()
  })

  it('handles unauthenticated user', () => {
    mockUseAuth.mockReturnValue({ user: null, logout: mockLogout })
    
    render(<ProfilePage />)
    
    expect(screen.getByText('You are not logged in.')).toBeInTheDocument()
  })

  it('calls logout when logout button is clicked', () => {
    render(<ProfilePage />)
    
    const logoutButton = screen.getByText('Logout')
    fireEvent.click(logoutButton)
    
    expect(mockLogout).toHaveBeenCalled()
  })

  it('loads favorites tab by default', async () => {
    render(<ProfilePage />)
    
    await waitFor(() => {
      expect(fetchUserFavorites).toHaveBeenCalled()
      expect(screen.getByText('Test Book 1')).toBeInTheDocument()
      expect(screen.getByText('Test Author 1')).toBeInTheDocument()
    })
  })

  it('switches to reviews tab and loads reviews', async () => {
    render(<ProfilePage />)
    
    const reviewsTab = screen.getByText('My Reviews')
    fireEvent.click(reviewsTab)
    
    await waitFor(() => {
      expect(fetchUserReviews).toHaveBeenCalled()
      expect(screen.getByText('Great book!')).toBeInTheDocument()
      expect(screen.getByText('5/5')).toBeInTheDocument()
    })
  })

  it('switches to recommendations tab and loads recommendations', async () => {
    render(<ProfilePage />)
    
    const recsTab = screen.getByText('Recommendations')
    fireEvent.click(recsTab)
    
    await waitFor(() => {
      expect(fetchHybridRecommendations).toHaveBeenCalled()
      expect(screen.getByText('Test Book 1')).toBeInTheDocument()
    })
  })

  it('shows recommendation mode options when on recs tab', async () => {
    render(<ProfilePage />)
    
    const recsTab = screen.getByText('Recommendations')
    fireEvent.click(recsTab)
    
    await waitFor(() => {
      expect(screen.getByText('Mode:')).toBeInTheDocument()
      expect(screen.getByText('Hybrid')).toBeInTheDocument()
      expect(screen.getByText('Top Rated')).toBeInTheDocument()
      expect(screen.getByText('LLM')).toBeInTheDocument()
    })
  })

  it('switches recommendation mode to Top Rated', async () => {
    render(<ProfilePage />)
    
    const recsTab = screen.getByText('Recommendations')
    fireEvent.click(recsTab)
    
    await waitFor(() => {
      const topRatedButton = screen.getByText('Top Rated')
      fireEvent.click(topRatedButton)
    })
    
    await waitFor(() => {
      expect(fetchTopRatedRecommendations).toHaveBeenCalled()
    })
  })

  it('switches recommendation mode to LLM', async () => {
    render(<ProfilePage />)
    
    const recsTab = screen.getByText('Recommendations')
    fireEvent.click(recsTab)
    
    await waitFor(() => {
      const llmButton = screen.getByText('LLM')
      fireEvent.click(llmButton)
    })
    
    await waitFor(() => {
      expect(fetchLLMRecommendations).toHaveBeenCalled()
    })
  })

  it('shows empty state for favorites', async () => {
    vi.mocked(fetchUserFavorites).mockResolvedValue([])
    
    render(<ProfilePage />)
    
    await waitFor(() => {
      expect(screen.getByText('No favorites yet.')).toBeInTheDocument()
    })
  })

  it('shows empty state for reviews', async () => {
    vi.mocked(fetchUserReviews).mockResolvedValue([])
    
    render(<ProfilePage />)
    
    const reviewsTab = screen.getByText('My Reviews')
    fireEvent.click(reviewsTab)
    
    await waitFor(() => {
      expect(screen.getByText('No reviews written.')).toBeInTheDocument()
    })
  })

  it('shows empty state for recommendations', async () => {
    vi.mocked(fetchHybridRecommendations).mockResolvedValue({
      recommendations: [],
      mode: 'hybrid',
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 }
    })
    
    render(<ProfilePage />)
    
    const recsTab = screen.getByText('Recommendations')
    fireEvent.click(recsTab)
    
    await waitFor(() => {
      expect(screen.getByText('No recommendations yet.')).toBeInTheDocument()
    })
  })

  it('handles API errors and shows error message', async () => {
    vi.mocked(fetchUserFavorites).mockRejectedValue(new Error('API Error'))
    
    render(<ProfilePage />)
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load data')).toBeInTheDocument()
    })
  })

  it('handles LLM recommendations error with custom error message', async () => {
    const llmError = {
      response: {
        data: {
          error: 'LLM service unavailable'
        }
      }
    }
    vi.mocked(fetchLLMRecommendations).mockRejectedValue(llmError)
    
    render(<ProfilePage />)
    
    const recsTab = screen.getByText('Recommendations')
    fireEvent.click(recsTab)
    
    await waitFor(() => {
      const llmButton = screen.getByText('LLM')
      fireEvent.click(llmButton)
    })
    
    await waitFor(() => {
      expect(screen.getByText('LLM service unavailable')).toBeInTheDocument()
    })
  })

  it('shows loading state', async () => {
    // Mock a slow API call
    vi.mocked(fetchUserFavorites).mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    )
    
    render(<ProfilePage />)
    
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('formats review dates correctly', async () => {
    render(<ProfilePage />)
    
    const reviewsTab = screen.getByText('My Reviews')
    fireEvent.click(reviewsTab)
    
    await waitFor(() => {
      // Should display formatted date
      const dateElements = screen.getAllByText('1/1/2023')
      expect(dateElements.length).toBeGreaterThan(0)
    })
  })

  it('displays book ratings and review counts correctly', async () => {
    render(<ProfilePage />)
    
    await waitFor(() => {
      expect(screen.getByText('Rating: 4.5')).toBeInTheDocument()
      expect(screen.getByText('Reviews: 10')).toBeInTheDocument()
    })
  })

  it('handles books with no ratings', async () => {
    const booksWithNoRating = [{
      id: 1,
      title: 'No Rating Book',
      author: 'Unknown Author',
      avgRating: null,
      reviewCount: null
    }]
    vi.mocked(fetchUserFavorites).mockResolvedValue(booksWithNoRating as any)
    
    render(<ProfilePage />)
    
    await waitFor(() => {
      expect(screen.getByText('Rating: 0.0')).toBeInTheDocument()
      expect(screen.getByText('Reviews: 0')).toBeInTheDocument()
    })
  })

  it('does not reload data when switching to already loaded tab', async () => {
    render(<ProfilePage />)
    
    // Wait for initial favorites load
    await waitFor(() => {
      expect(fetchUserFavorites).toHaveBeenCalledTimes(1)
    })
    
    // Switch to reviews and back
    const reviewsTab = screen.getByText('My Reviews')
    fireEvent.click(reviewsTab)
    
    await waitFor(() => {
      expect(fetchUserReviews).toHaveBeenCalledTimes(1)
    })
    
    // Switch back to favorites - should not reload
    const favoritesTab = screen.getByText('Favorites')
    fireEvent.click(favoritesTab)
    
    // Still should only be called once (no reload)
    expect(fetchUserFavorites).toHaveBeenCalledTimes(1)
  })
})