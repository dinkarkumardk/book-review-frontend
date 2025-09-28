import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Badge } from '../badge'

describe('Badge Component', () => {
  it('renders badge with default variant', () => {
    const { container } = render(<Badge>Default Badge</Badge>)
    
    expect(container.firstChild).toHaveClass('bg-sky-600', 'text-white')
    expect(container.firstChild).toHaveTextContent('Default Badge')
  })

  it('renders secondary variant', () => {
    const { container } = render(<Badge variant="secondary">Secondary Badge</Badge>)
    
    expect(container.firstChild).toHaveClass('bg-slate-200', 'text-slate-900')
  })

  it('renders outline variant', () => {
    const { container } = render(<Badge variant="outline">Outline Badge</Badge>)
    
    expect(container.firstChild).toHaveClass('text-slate-700', 'border-slate-300')
  })

  it('applies custom className', () => {
    const { container } = render(<Badge className="custom-badge">Badge</Badge>)
    
    expect(container.firstChild).toHaveClass('custom-badge')
  })

  it('forwards other props', () => {
    const { container } = render(<Badge data-testid="badge">Badge Content</Badge>)
    
    expect(container.firstChild).toHaveAttribute('data-testid', 'badge')
  })
})