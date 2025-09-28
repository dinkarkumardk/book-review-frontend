import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { RatingStars } from '../RatingStars'

describe('RatingStars Component', () => {
  it('renders with default props', () => {
    const { container } = render(<RatingStars />)
    
    expect(container.firstChild).toHaveClass('flex', 'items-center', 'gap-1')
    expect(container.firstChild).toHaveAttribute('aria-label', 'Rated 0.0 out of 5')
  })

  it('renders correct number of stars based on value', () => {
    const { container } = render(<RatingStars value={3} />)
    const stars = container.querySelectorAll('span[aria-hidden]')
    
    expect(stars).toHaveLength(5) // 5 stars total
  })

  it('shows rating value when showValue is true', () => {
    const { getByText } = render(<RatingStars value={4.2} showValue={true} />)
    
    expect(getByText('4.2')).toBeInTheDocument()
  })

  it('hides rating value when showValue is false', () => {
    const { container, queryByText } = render(<RatingStars value={4.2} showValue={false} />)
    
    expect(queryByText('4.2')).not.toBeInTheDocument()
    expect(container.firstChild).not.toHaveAttribute('aria-label')
  })

  it('displays rating count when provided', () => {
    const { getByText } = render(<RatingStars value={4.0} ratingCount={125} />)
    
    expect(getByText('(125)')).toBeInTheDocument()
  })

  it('handles different outOf values', () => {
    const { container } = render(<RatingStars value={3} outOf={10} />)
    const stars = container.querySelectorAll('span[aria-hidden]')
    
    expect(stars).toHaveLength(10)
    expect(container.firstChild).toHaveAttribute('aria-label', 'Rated 3.0 out of 10')
  })

  it('applies different size classes', () => {
    const { container: smContainer } = render(<RatingStars size="sm" />)
    const { container: mdContainer } = render(<RatingStars size="md" />)
    
    const smStars = smContainer.querySelectorAll('span[aria-hidden]')
    const mdStars = mdContainer.querySelectorAll('span[aria-hidden]')
    
    expect(smStars[0]).toHaveClass('text-[12px]')
    expect(mdStars[0]).toHaveClass('text-base')
  })

  it('applies custom className', () => {
    const { container } = render(<RatingStars className="custom-rating" />)
    
    expect(container.firstChild).toHaveClass('custom-rating')
  })

  it('handles null value gracefully', () => {
    const { container } = render(<RatingStars value={null} />)
    
    expect(container.firstChild).toHaveAttribute('aria-label', 'Rated 0.0 out of 5')
  })

  it('clamps value within bounds', () => {
    const { container: overContainer } = render(<RatingStars value={10} outOf={5} />)
    const { container: underContainer } = render(<RatingStars value={-2} outOf={5} />)
    
    expect(overContainer.firstChild).toHaveAttribute('aria-label', 'Rated 5.0 out of 5')
    expect(underContainer.firstChild).toHaveAttribute('aria-label', 'Rated 0.0 out of 5')
  })
})