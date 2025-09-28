import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Input } from '../input'

describe('Input Component', () => {
  it('renders input with default styling', () => {
    const { container } = render(<Input />)
    const input = container.firstChild
    
    expect(input).toHaveClass('flex', 'h-10', 'w-full', 'rounded-md', 'border')
    expect(input).toHaveClass('bg-white', 'px-3', 'py-2', 'text-sm')
  })

  it('applies custom className', () => {
    const { container } = render(<Input className="custom-class" />)
    
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('forwards props to input element', () => {
    const { container } = render(<Input placeholder="Enter text" type="email" />)
    const input = container.firstChild
    
    expect(input).toHaveAttribute('placeholder', 'Enter text')
    expect(input).toHaveAttribute('type', 'email')
  })

  it('supports disabled state', () => {
    const { container } = render(<Input disabled />)
    
    expect(container.firstChild).toBeDisabled()
    expect(container.firstChild).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50')
  })

  it('accepts ref', () => {
    const ref = { current: null }
    render(<Input ref={ref} />)
    
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
  })
})