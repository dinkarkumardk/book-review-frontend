import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import Layout from '../Layout'

// Mock the components to avoid complex dependencies
vi.mock('../Navbar', () => ({
  default: () => <div data-testid="navbar">Mocked Navbar</div>
}))

vi.mock('../Footer', () => ({
  default: () => <div data-testid="footer">Mocked Footer</div>
}))

describe('Layout Component', () => {
  it('renders children within layout structure', () => {
    const { getByTestId, getByText } = render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    )
    
    expect(getByTestId('navbar')).toBeInTheDocument()
    expect(getByTestId('footer')).toBeInTheDocument()
    expect(getByText('Test Content')).toBeInTheDocument()
  })

  it('has proper structure classes', () => {
    const { container } = render(
      <Layout>
        <div>Content</div>
      </Layout>
    )
    
    // Check for flex column structure
    const layoutDiv = container.firstChild
    expect(layoutDiv).toHaveClass('flex', 'flex-col', 'min-h-screen')
  })

  it('renders main content area with children', () => {
    const { getByText } = render(
      <Layout>
        <div>Main Content</div>
      </Layout>
    )
    
    // Check that content is rendered within the layout
    expect(getByText('Main Content')).toBeInTheDocument()
  })
})