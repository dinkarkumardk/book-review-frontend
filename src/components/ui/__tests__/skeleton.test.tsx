import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Skeleton } from '../Skeleton'

describe('Skeleton Component', () => {
  it('renders with default styling and shimmer effect', () => {
    const { container } = render(<Skeleton />)
    
    expect(container.firstChild).toHaveClass('relative', 'overflow-hidden', 'rounded-md', 'bg-slate-200')
    expect(container.firstChild).toHaveClass('after:absolute', 'after:inset-0', 'after:-translate-x-full')
  })

  it('renders without shimmer when shimmer is false', () => {
    const { container } = render(<Skeleton shimmer={false} />)
    
    expect(container.firstChild).toHaveClass('bg-slate-200')
    expect(container.firstChild).not.toHaveClass('after:absolute')
  })

  it('applies custom className', () => {
    const { container } = render(<Skeleton className="h-4 w-20" />)
    
    expect(container.firstChild).toHaveClass('h-4', 'w-20')
  })

  it('forwards other props', () => {
    const { container } = render(<Skeleton data-testid="skeleton" />)
    
    expect(container.firstChild).toHaveAttribute('data-testid', 'skeleton')
  })

  it('maintains base styles when custom props are applied', () => {
    const { container } = render(<Skeleton className="custom-class" shimmer={false} />)
    
    expect(container.firstChild).toHaveClass('relative', 'overflow-hidden', 'rounded-md')
    expect(container.firstChild).toHaveClass('custom-class')
  })
})