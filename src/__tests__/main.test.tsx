import { describe, it, expect, vi } from 'vitest'

// Mock React DOM
vi.mock('react-dom/client', () => ({
  createRoot: vi.fn(() => ({
    render: vi.fn()
  }))
}))

// Mock the App component
vi.mock('./App', () => ({
  default: () => 'App'
}))

describe('main.tsx', () => {
  it('renders without crashing', async () => {
    // Import main to trigger the render
    await import('../main')
    
    expect(true).toBe(true) // Simple assertion to verify the import worked
  })
})