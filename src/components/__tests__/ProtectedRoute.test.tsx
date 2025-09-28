import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ProtectedRoute from '../ProtectedRoute'

// Mock the AuthContext
const mockUseAuth = vi.fn()
vi.mock('@/context/AuthContext', () => ({
  useAuth: () => mockUseAuth()
}))

// Mock react-router-dom components
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    Navigate: ({ to }: { to: string }) => <div data-testid="navigate" data-to={to}>Redirecting to {to}</div>,
    Outlet: () => <div data-testid="outlet">Protected Content</div>
  }
})

describe('ProtectedRoute Component', () => {
  it('returns null when initializing', () => {
    mockUseAuth.mockReturnValue({ user: null, initializing: true })
    
    const { container } = render(
      <MemoryRouter>
        <ProtectedRoute />
      </MemoryRouter>
    )
    
    expect(container.firstChild).toBeNull()
  })

  it('redirects to login when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({ user: null, initializing: false })
    
    const { getByTestId } = render(
      <MemoryRouter>
        <ProtectedRoute />
      </MemoryRouter>
    )
    
    const navigate = getByTestId('navigate')
    expect(navigate).toBeInTheDocument()
    expect(navigate).toHaveAttribute('data-to', '/login')
  })

  it('redirects to custom route when specified', () => {
    mockUseAuth.mockReturnValue({ user: null, initializing: false })
    
    const { getByTestId } = render(
      <MemoryRouter>
        <ProtectedRoute redirectTo="/home" />
      </MemoryRouter>
    )
    
    const navigate = getByTestId('navigate')
    expect(navigate).toHaveAttribute('data-to', '/home')
  })

  it('renders Outlet when user is authenticated', () => {
    mockUseAuth.mockReturnValue({ 
      user: { id: 1, name: 'Test User' }, 
      initializing: false 
    })
    
    const { getByTestId } = render(
      <MemoryRouter>
        <ProtectedRoute />
      </MemoryRouter>
    )
    
    expect(getByTestId('outlet')).toBeInTheDocument()
  })
})