import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { RatingDistribution } from '../RatingDistribution'

describe('RatingDistribution Component', () => {
  it('returns null when no ratings provided', () => {
    const { container } = render(<RatingDistribution ratings={[]} />)
    
    expect(container.firstChild).toBeNull()
  })

  it('renders all star buckets from 5 to 1', () => {
    const ratings = [5, 4, 3, 2, 1]
    const { getByText } = render(<RatingDistribution ratings={ratings} />)
    
    expect(getByText('5★')).toBeInTheDocument()
    expect(getByText('4★')).toBeInTheDocument()
    expect(getByText('3★')).toBeInTheDocument()
    expect(getByText('2★')).toBeInTheDocument()
    expect(getByText('1★')).toBeInTheDocument()
  })

  it('calculates percentages correctly', () => {
    const ratings = [5, 5, 4, 4, 3] // 40% 5-star, 40% 4-star, 20% 3-star
    const { getAllByText } = render(<RatingDistribution ratings={ratings} />)
    
    expect(getAllByText('40%')).toHaveLength(2) // 5-star and 4-star both 40%
    expect(getAllByText('20%')).toHaveLength(1) // 3-star is 20%
  })

  it('applies custom className', () => {
    const { container } = render(
      <RatingDistribution ratings={[5, 4]} className="custom-class" />
    )
    
    expect(container.firstChild).toHaveClass('custom-class', 'space-y-2')
  })

  it('renders correct number of rating bars', () => {
    const ratings = [5, 4, 3]
    const { container } = render(<RatingDistribution ratings={ratings} />)
    
    const ratingBars = container.querySelectorAll('.flex.items-center.gap-2')
    expect(ratingBars).toHaveLength(5) // Always 5 buckets (5★ to 1★)
  })

  it('handles single rating correctly', () => {
    const ratings = [5]
    const { getByText, getAllByText } = render(<RatingDistribution ratings={ratings} />)
    
    expect(getByText('100%')).toBeInTheDocument() // 5-star should be 100%
    expect(getAllByText('0%')).toHaveLength(4) // Others should be 0%
  })

  it('renders progress bars with correct structure', () => {
    const ratings = [5, 4]
    const { container } = render(<RatingDistribution ratings={ratings} />)
    
    const progressBars = container.querySelectorAll('.flex-1.h-2.rounded.bg-muted')
    expect(progressBars).toHaveLength(5)
    
    const progressFills = container.querySelectorAll('.h-full.bg-yellow-500\\/80')
    expect(progressFills).toHaveLength(5)
  })
})