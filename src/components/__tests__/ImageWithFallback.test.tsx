import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import ImageWithFallback from '../ImageWithFallback'

describe('ImageWithFallback Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders with provided source', () => {
    const { container } = render(
      <ImageWithFallback 
        src="https://example.com/image.jpg" 
        alt="Test image" 
      />
    )
    
    const img = container.querySelector('img')
    expect(img).toHaveAttribute('src', 'https://example.com/image.jpg')
    expect(img).toHaveAttribute('alt', 'Test image')
  })

  it('falls back to proxy source on error', () => {
    const { container } = render(
      <ImageWithFallback 
        src="https://example.com/broken.jpg" 
        alt="Test image" 
      />
    )
    
    const img = container.querySelector('img')
    expect(img?.src).toContain('example.com/broken.jpg')
    
    // Simulate image load error
    fireEvent.error(img!)
    
    // Should fallback to weserv proxy
    expect(img?.src).toContain('images.weserv.nl')
  })

  it('renders default image when no src provided', () => {
    const { container } = render(
      <ImageWithFallback alt="No source" />
    )
    
    const img = container.querySelector('img')
    expect(img?.src).toContain('/default-cover.svg')
  })

  it('applies custom className', () => {
    const { container } = render(
      <ImageWithFallback 
        src="image.jpg" 
        alt="Test" 
        className="custom-class"
      />
    )
    
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('forwards other props to img element', () => {
    const { container } = render(
      <ImageWithFallback 
        src="image.jpg" 
        alt="Test" 
        data-testid="test-image"
        loading="lazy"
      />
    )
    
    const img = container.querySelector('img')
    expect(img).toHaveAttribute('data-testid', 'test-image')
    expect(img).toHaveAttribute('loading', 'lazy')
  })

  it('handles null src gracefully', () => {
    const { container } = render(
      <ImageWithFallback 
        src={null} 
        alt="Null source" 
      />
    )
    
    const img = container.querySelector('img')
    expect(img?.src).toContain('/default-cover.svg')
  })
})