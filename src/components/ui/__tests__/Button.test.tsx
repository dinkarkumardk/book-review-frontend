import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Button } from '../Button'

describe('Button Component', () => {
  it('renders with default variant and size', () => {
    const { container } = render(<Button>Test</Button>)
    const button = container.firstChild
    
    expect(button).toHaveClass('inline-flex', 'items-center', 'justify-center')
    expect(button).toHaveClass('bg-sky-600', 'text-white')
    expect(button).toHaveClass('h-10', 'px-4')
  })

  it('renders with destructive variant', () => {
    const { container } = render(<Button variant="destructive">Delete</Button>)
    const button = container.firstChild
    
    expect(button).toHaveClass('bg-rose-600', 'text-white')
  })

  it('renders with outline variant', () => {
    const { container } = render(<Button variant="outline">Outline</Button>)
    const button = container.firstChild
    
    expect(button).toHaveClass('border')
  })

  it('renders with secondary variant', () => {
    const { container } = render(<Button variant="secondary">Secondary</Button>)
    const button = container.firstChild
    
    expect(button).toHaveClass('bg-slate-200')
  })

  it('renders with ghost variant', () => {
    const { container } = render(<Button variant="ghost">Ghost</Button>)
    const button = container.firstChild
    
    expect(button).toHaveClass('hover:bg-slate-100')
  })

  it('renders with different sizes', () => {
    const { container: smallContainer } = render(<Button size="sm">Small</Button>)
    const { container: lgContainer } = render(<Button size="lg">Large</Button>)
    const { container: iconContainer } = render(<Button size="icon">Icon</Button>)
    
    expect(smallContainer.firstChild).toHaveClass('h-8', 'px-3')
    expect(lgContainer.firstChild).toHaveClass('h-11', 'px-5')
    expect(iconContainer.firstChild).toHaveClass('h-10', 'w-10')
  })

  it('applies custom className', () => {
    const { container } = render(<Button className="custom-class">Test</Button>)
    
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('handles disabled state', () => {
    const { container } = render(<Button disabled>Disabled</Button>)
    
    expect(container.firstChild).toBeDisabled()
    expect(container.firstChild).toHaveClass('disabled:pointer-events-none', 'disabled:opacity-50')
  })
})