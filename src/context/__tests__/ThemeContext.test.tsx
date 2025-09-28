import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeProvider, useTheme } from '../ThemeContext'

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
})

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Test component that uses theme
function TestComponent() {
  const { theme, toggleTheme, setTheme } = useTheme()
  
  return (
    <div>
      <div data-testid="current-theme">{theme}</div>
      <button data-testid="toggle-theme" onClick={toggleTheme}>
        Toggle
      </button>
      <button data-testid="set-dark" onClick={() => setTheme('dark')}>
        Set Dark
      </button>
      <button data-testid="set-light" onClick={() => setTheme('light')}>
        Set Light
      </button>
    </div>
  )
}

describe('ThemeContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    document.documentElement.dataset.theme = ''
  })

  it('provides default light theme when no stored preference', () => {
    mockLocalStorage.getItem.mockReturnValue(null)
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )
    
    expect(screen.getByTestId('current-theme')).toHaveTextContent('light')
  })

  it('uses stored theme preference', () => {
    mockLocalStorage.getItem.mockReturnValue('dark')
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )
    
    expect(screen.getByTestId('current-theme')).toHaveTextContent('dark')
  })

  it('toggles theme correctly', () => {
    mockLocalStorage.getItem.mockReturnValue('light')
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )
    
    expect(screen.getByTestId('current-theme')).toHaveTextContent('light')
    
    fireEvent.click(screen.getByTestId('toggle-theme'))
    expect(screen.getByTestId('current-theme')).toHaveTextContent('dark')
    
    fireEvent.click(screen.getByTestId('toggle-theme'))
    expect(screen.getByTestId('current-theme')).toHaveTextContent('light')
  })

  it('sets theme directly', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )
    
    fireEvent.click(screen.getByTestId('set-dark'))
    expect(screen.getByTestId('current-theme')).toHaveTextContent('dark')
    
    fireEvent.click(screen.getByTestId('set-light'))
    expect(screen.getByTestId('current-theme')).toHaveTextContent('light')
  })

  it('updates document dataset when theme changes', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )
    
    fireEvent.click(screen.getByTestId('set-dark'))
    expect(document.documentElement.dataset.theme).toBe('dark')
    
    fireEvent.click(screen.getByTestId('set-light'))
    expect(document.documentElement.dataset.theme).toBe('light')
  })

  it('attempts to save to localStorage when theme changes', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )
    
    fireEvent.click(screen.getByTestId('set-dark'))
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('bv-theme', 'dark')
  })
})