import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../Card'

describe('Card Components', () => {
  it('renders Card component', () => {
    const { container } = render(<Card>Test content</Card>)
    expect(container.firstChild).toHaveClass('rounded-lg', 'border', 'bg-white', 'shadow-sm')
  })

  it('renders CardHeader component', () => {
    const { container } = render(<CardHeader>Header content</CardHeader>)
    expect(container.firstChild).toHaveClass('flex', 'flex-col', 'gap-1', 'p-4')
  })

  it('renders CardTitle component', () => {
    const { container } = render(<CardTitle>Title</CardTitle>)
    expect(container.firstChild).toHaveClass('text-base', 'font-semibold', 'leading-tight')
  })

  it('renders CardDescription component', () => {
    const { container } = render(<CardDescription>Description</CardDescription>)
    expect(container.firstChild).toHaveClass('text-sm', 'text-slate-600')
  })

  it('renders CardContent component', () => {
    const { container } = render(<CardContent>Content</CardContent>)
    expect(container.firstChild).toHaveClass('px-4', 'pb-4', 'pt-0')
  })

  it('Card accepts custom className', () => {
    const { container } = render(<Card className="custom-class">Test</Card>)
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('CardTitle accepts custom className', () => {
    const { container } = render(<CardTitle className="custom-title">Title</CardTitle>)
    expect(container.firstChild).toHaveClass('custom-title')
  })
})