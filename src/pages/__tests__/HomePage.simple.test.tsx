import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import HomePage from '../HomePage'
import { AuthProvider } from '../../context/AuthContext'

// Mock components to avoid complex dependencies
vi.mock('../../components/SearchBar', () => ({
  default: () => <div>Search Bar</div>
}))

vi.mock('../../components/BookCard', () => ({
  default: () => <div>Book Card</div>
}))

const MockedHomePage = () => (
  <MemoryRouter>
    <AuthProvider>
      <HomePage />
    </AuthProvider>
  </MemoryRouter>
)

describe('HomePage Component', () => {
  it('renders without crashing', () => {
    render(<MockedHomePage />)
    expect(screen.getByText('Discover Books')).toBeInTheDocument()
  })
})