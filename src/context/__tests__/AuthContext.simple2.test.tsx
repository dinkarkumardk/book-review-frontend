import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { AuthProvider, useAuth } from '../../context/AuthContext'

// Mock the API service
vi.mock('@/services/api', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  }
}))

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  }
}))

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true
})

// Test component that uses AuthContext
const TestComponent = () => {
  const { user, token, login, logout } = useAuth()
  
  return (
    <div>
      <div data-testid="auth-status">
        {user && token ? 'authenticated' : 'not-authenticated'}
      </div>
      <div data-testid="user-name">
        {user?.name || 'no-user'}
      </div>
      <button onClick={() => login('mock-token', { id: '1', name: 'Test User', email: 'test@example.com' })}>
        Login
      </button>
      <button onClick={logout}>
        Logout
      </button>
    </div>
  )
}

describe('AuthContext Provider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue(null)
  })

  it('provides authentication context', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated')
    expect(screen.getByTestId('user-name')).toHaveTextContent('no-user')
  })

  it('handles login and logout actions', async () => {
    const mockApi = await import('@/services/api')
    mockApi.default.post = vi.fn().mockResolvedValue({
      data: {
        user: { id: '1', name: 'Test User', email: 'test@example.com' },
        token: 'mock-token'
      }
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    // Initially not authenticated
    expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated')

    // Simulate login
    const loginButton = screen.getByText('Login')
    await act(async () => {
      loginButton.click()
    })

    expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated')
    expect(screen.getByTestId('user-name')).toHaveTextContent('Test User')

    // Simulate logout
    const logoutButton = screen.getByText('Logout')
    await act(async () => {
      logoutButton.click()
    })

    expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated')
  })

  it('restores session from localStorage', () => {
    const mockUser = { id: '1', name: 'Test User', email: 'test@example.com' }
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockUser))

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated')
    expect(screen.getByTestId('user-name')).toHaveTextContent('Test User')
  })
})