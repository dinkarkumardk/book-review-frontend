import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Textarea } from '../textarea'

describe('Textarea Component', () => {
  it('renders textarea with default styling', () => {
    const { container } = render(<Textarea />)
    const textarea = container.firstChild
    
    expect(textarea).toHaveClass('flex', 'min-h-[120px]', 'w-full', 'rounded-md', 'border')
    expect(textarea).toHaveClass('bg-white', 'px-3', 'py-2', 'text-sm')
  })

  it('applies custom className', () => {
    const { container } = render(<Textarea className="custom-textarea" />)
    
    expect(container.firstChild).toHaveClass('custom-textarea')
  })

  it('forwards props to textarea element', () => {
    const { container } = render(<Textarea placeholder="Enter description" rows={5} />)
    const textarea = container.firstChild
    
    expect(textarea).toHaveAttribute('placeholder', 'Enter description')
    expect(textarea).toHaveAttribute('rows', '5')
  })

  it('supports disabled state', () => {
    const { container } = render(<Textarea disabled />)
    
    expect(container.firstChild).toBeDisabled()
    expect(container.firstChild).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50')
  })

  it('accepts ref', () => {
    const ref = { current: null }
    render(<Textarea ref={ref} />)
    
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement)
  })
})