import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Label } from '../label'

describe('Label Component', () => {
  it('renders with default styling', () => {
    const { container } = render(<Label>Test Label</Label>)
    
    expect(container.firstChild).toHaveClass('text-sm', 'font-medium', 'leading-none')
    expect(container.firstChild).toHaveClass('peer-disabled:cursor-not-allowed', 'peer-disabled:opacity-70')
    expect(container.firstChild).toHaveTextContent('Test Label')
  })

  it('applies custom className', () => {
    const { container } = render(<Label className="custom-label">Label</Label>)
    
    expect(container.firstChild).toHaveClass('custom-label')
  })

  it('forwards props to label element', () => {
    const { container } = render(<Label htmlFor="input-id">Label</Label>)
    
    expect(container.firstChild).toHaveAttribute('for', 'input-id')
  })

  it('supports other HTML label attributes', () => {
    const { container } = render(<Label data-testid="label" id="label-id">Label</Label>)
    
    expect(container.firstChild).toHaveAttribute('data-testid', 'label')
    expect(container.firstChild).toHaveAttribute('id', 'label-id')
  })
})