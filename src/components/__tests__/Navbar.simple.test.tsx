import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Navbar from '../Navbar'
import { AuthProvider } from '../../context/AuthContext'

const MockedNavbar = () => (
  <MemoryRouter>
    <AuthProvider>
      <Navbar />
    </AuthProvider>
  </MemoryRouter>
)

describe('Navbar Component', () => {
  it('renders without crashing', () => {
    render(<MockedNavbar />)
    expect(screen.getByText('BookVerse')).toBeInTheDocument()
  })

  it('shows navigation links', () => {
    render(<MockedNavbar />)
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Search')).toBeInTheDocument()
  })
})