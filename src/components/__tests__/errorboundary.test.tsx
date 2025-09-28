import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { ErrorBoundary } from '../ErrorBoundary'

// Component that throws an error
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error')
  }
  return <div>No error</div>
}

describe('ErrorBoundary Component', () => {
  // Suppress console.error for these tests
  const originalError = console.error
  beforeEach(() => {
    console.error = vi.fn()
  })
  
  afterEach(() => {
    console.error = originalError
  })

  it('renders children when there is no error', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    )

    expect(getByText('Test content')).toBeInTheDocument()
  })

  it('renders error UI when child component throws', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(getByText('Something went wrong')).toBeInTheDocument()
    expect(getByText('An unexpected error occurred. You can try refreshing or returning home.')).toBeInTheDocument()
    expect(getByText('Try Again')).toBeInTheDocument()
    expect(getByText('Home')).toBeInTheDocument()
  })

  it('renders home link with correct href', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    const homeLink = getByText('Home')
    expect(homeLink).toHaveAttribute('href', '/')
  })

  it('applies correct styling to error UI', () => {
    const { container } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    const errorDiv = container.firstChild
    expect(errorDiv).toHaveClass('min-h-screen', 'flex', 'flex-col', 'items-center', 'justify-center')
  })
})