import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { DarkModeToggle } from '../DarkModeToggle'

// Mock the theme context
const mockToggleTheme = vi.fn()
vi.mock('../../context/ThemeContext', () => ({
  useTheme: () => ({
    theme: 'light',
    toggleTheme: mockToggleTheme,
  }),
}))

describe('DarkModeToggle Component', () => {
  it('renders toggle button with proper accessibility', () => {
    render(<DarkModeToggle />)
    
    const button = screen.getByLabelText('Toggle dark mode')
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('type', 'button')
  })

  it('applies correct button styling classes', () => {
    render(<DarkModeToggle />)
    
    const button = screen.getByLabelText('Toggle dark mode')
    expect(button).toHaveClass('h-9', 'w-9', 'p-0', 'rounded-full')
  })

  it('calls toggleTheme when clicked', async () => {
    const user = userEvent.setup()
    render(<DarkModeToggle />)
    
    const button = screen.getByLabelText('Toggle dark mode')
    await user.click(button)
    
    expect(mockToggleTheme).toHaveBeenCalledOnce()
  })

  it('renders button properly', () => {
    render(<DarkModeToggle />)
    
    // Should render button with SVG icon
    const button = screen.getByLabelText('Toggle dark mode')
    expect(button).toBeInTheDocument()
    
    const svg = button.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })
})

// Test with dark theme
vi.mock('../../context/ThemeContext', () => ({
  useTheme: () => ({
    theme: 'dark',
    toggleTheme: mockToggleTheme,
  }),
}))

describe('DarkModeToggle Component - Dark Theme', () => {
  it('shows moon icon in dark mode', () => {
    render(<DarkModeToggle />)
    
    // Moon icon has this specific path
    const moonIcon = screen.getByRole('button').querySelector('path[d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"]')
    expect(moonIcon).toBeInTheDocument()
  })
})