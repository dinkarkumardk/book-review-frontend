import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Navbar from '../Navbar'
import toast from 'react-hot-toast'

const mockUser = {
  id: '1',
  name: 'Test User',
  email: 'test@example.com'
}

const mockUseAuth = vi.fn()
const mockNavigate = vi.fn()

// Mock AuthContext
vi.mock('@/context/AuthContext', () => ({
  useAuth: () => mockUseAuth()
}))

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate
  }
})

// Mock toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn()
  }
}))

describe('Navbar - Coverage Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('covers authenticated user state with Profile and Logout', () => {
    const mockLogout = vi.fn()
    mockUseAuth.mockReturnValue({ 
      user: mockUser, 
      logout: mockLogout 
    })

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    )

    // Should show Profile link for authenticated users
    expect(screen.getByText('Profile')).toBeInTheDocument()
    expect(screen.getByText('Logout')).toBeInTheDocument()
    
    // Should NOT show Login/Signup for authenticated users
    expect(screen.queryByText('Login')).not.toBeInTheDocument()
    expect(screen.queryByText('Sign Up')).not.toBeInTheDocument()
  })

  it('covers logout functionality with navigation and toast', async () => {
    const mockLogout = vi.fn()
    mockUseAuth.mockReturnValue({ 
      user: mockUser, 
      logout: mockLogout 
    })

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    )

    const logoutButton = screen.getByRole('button', { name: /logout/i })
    fireEvent.click(logoutButton)

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled()
      expect(toast.success).toHaveBeenCalledWith('Logged out')
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true })
    })
  })

  it('covers unauthenticated user state with Login and Signup', () => {
    mockUseAuth.mockReturnValue({ 
      user: null, 
      logout: vi.fn() 
    })

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    )

    // Should show Login/Signup for unauthenticated users
    expect(screen.getByText('Login')).toBeInTheDocument()
    expect(screen.getByText('Sign Up')).toBeInTheDocument()
    
    // Should NOT show Profile/Logout for unauthenticated users
    expect(screen.queryByText('Profile')).not.toBeInTheDocument()
    expect(screen.queryByText('Logout')).not.toBeInTheDocument()
  })

  it('covers NavLinkItem component with active state', () => {
    mockUseAuth.mockReturnValue({ 
      user: null, 
      logout: vi.fn() 
    })

    render(
      <MemoryRouter initialEntries={['/']}>
        <Navbar />
      </MemoryRouter>
    )

    const homeLink = screen.getByRole('link', { name: 'Home' })
    expect(homeLink).toBeInTheDocument()
    expect(homeLink).toHaveClass('text-sky-700') // Active state class
  })

  it('covers NavLinkItem component with inactive state', () => {
    mockUseAuth.mockReturnValue({ 
      user: null, 
      logout: vi.fn() 
    })

    render(
      <MemoryRouter initialEntries={['/search']}>
        <Navbar />
      </MemoryRouter>
    )

    const homeLink = screen.getByRole('link', { name: 'Home' })
    expect(homeLink).toBeInTheDocument()
    expect(homeLink).toHaveClass('text-slate-600') // Inactive state class
    
    const searchLink = screen.getByRole('link', { name: /search/i })
    expect(searchLink).toHaveClass('text-sky-700') // Active state class
  })

  it('covers all navigation links and their hrefs', () => {
    mockUseAuth.mockReturnValue({ 
      user: mockUser, 
      logout: vi.fn() 
    })

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    )

    // Main brand link
    const brandLink = screen.getByRole('link', { name: /bookverse home/i })
    expect(brandLink).toHaveAttribute('href', '/')

    // Navigation links for authenticated user
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: 'Search' })).toHaveAttribute('href', '/search')
    expect(screen.getByRole('link', { name: 'Profile' })).toHaveAttribute('href', '/profile')
  })

  it('covers signup link for unauthenticated users', () => {
    mockUseAuth.mockReturnValue({ 
      user: null, 
      logout: vi.fn() 
    })

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    )

    const signupLink = screen.getByRole('link', { name: /create account/i })
    expect(signupLink).toHaveAttribute('href', '/signup')
    expect(signupLink).toHaveTextContent('Sign Up')
  })

  it('covers brand link navigation', () => {
    mockUseAuth.mockReturnValue({ 
      user: null, 
      logout: vi.fn() 
    })

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    )

    const brandLink = screen.getByText('BookVerse')
    expect(brandLink.closest('a')).toHaveAttribute('href', '/')
  })

  it('covers tagline rendering on desktop', () => {
    mockUseAuth.mockReturnValue({ 
      user: null, 
      logout: vi.fn() 
    })

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    )

    expect(screen.getByText('Discover · Curate · Review')).toBeInTheDocument()
  })

  it('covers accessibility attributes', () => {
    mockUseAuth.mockReturnValue({ 
      user: mockUser, 
      logout: vi.fn() 
    })

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    )

    // Navigation has proper aria-label
    const nav = screen.getByRole('navigation')
    expect(nav).toHaveAttribute('aria-label', 'Main navigation')

    // Logout button has proper aria-label
    const logoutButton = screen.getByRole('button')
    expect(logoutButton).toHaveAttribute('aria-label', 'Logout')
  })
})