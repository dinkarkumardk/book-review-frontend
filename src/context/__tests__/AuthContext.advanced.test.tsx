import { render, screen, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AuthProvider, useAuth } from '../AuthContext'

// Mock the API module
vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  }
}))

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    error: vi.fn(),
    success: vi.fn(),
  }
}))

// Test component that uses useAuth
const TestComponent = () => {
  const { user, token, initializing } = useAuth()
  return (
    <div>
      <div data-testid="user">{user?.name || 'No user'}</div>
      <div data-testid="token">{token || 'No token'}</div>
      <div data-testid="initializing">{initializing ? 'Loading' : 'Ready'}</div>
    </div>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Clear localStorage
    localStorage.clear()
  })

  it('provides initial auth state', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    expect(screen.getByTestId('user')).toHaveTextContent('No user')
    expect(screen.getByTestId('token')).toHaveTextContent('No token')
  })

  it('handles login', () => {
    const TestLoginComponent = () => {
      const { login, user, token } = useAuth()
      
      const handleLogin = () => {
        login('test-token', { id: '1', name: 'Test User', email: 'test@test.com' })
      }

      return (
        <div>
          <button onClick={handleLogin} data-testid="login-btn">Login</button>
          <div data-testid="user">{user?.name || 'No user'}</div>
          <div data-testid="token">{token || 'No token'}</div>
        </div>
      )
    }

    render(
      <AuthProvider>
        <TestLoginComponent />
      </AuthProvider>
    )

    act(() => {
      screen.getByTestId('login-btn').click()
    })

    expect(screen.getByTestId('user')).toHaveTextContent('Test User')
    expect(screen.getByTestId('token')).toHaveTextContent('test-token')
  })

  it('handles logout', () => {
    const TestLogoutComponent = () => {
      const { login, logout, user, token } = useAuth()
      
      const handleLogin = () => {
        login('test-token', { id: '1', name: 'Test User', email: 'test@test.com' })
      }
      
      const handleLogout = () => {
        logout()
      }

      return (
        <div>
          <button onClick={handleLogin} data-testid="login-btn">Login</button>
          <button onClick={handleLogout} data-testid="logout-btn">Logout</button>
          <div data-testid="user">{user?.name || 'No user'}</div>
          <div data-testid="token">{token || 'No token'}</div>
        </div>
      )
    }

    render(
      <AuthProvider>
        <TestLogoutComponent />
      </AuthProvider>
    )

    // Login first
    act(() => {
      screen.getByTestId('login-btn').click()
    })

    expect(screen.getByTestId('user')).toHaveTextContent('Test User')

    // Then logout
    act(() => {
      screen.getByTestId('logout-btn').click()
    })

    expect(screen.getByTestId('user')).toHaveTextContent('No user')
    expect(screen.getByTestId('token')).toHaveTextContent('No token')
  })
})