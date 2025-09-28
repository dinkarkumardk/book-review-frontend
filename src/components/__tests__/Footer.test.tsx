import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import Footer from '../Footer'

describe('Footer Component', () => {
  it('renders footer with correct structure', () => {
    const { container } = render(<Footer />)
    
    const footer = container.querySelector('footer')
    expect(footer).toBeInTheDocument()
    expect(footer).toHaveClass('mt-auto', 'border-t', 'bg-white/80')
  })

  it('displays BookVerse brand and current year', () => {
    const { getByText } = render(<Footer />)
    
    expect(getByText('BookVerse')).toBeInTheDocument()
    expect(getByText(`© ${new Date().getFullYear()}`)).toBeInTheDocument()
  })

  it('renders navigation links', () => {
    const { getByText } = render(<Footer />)
    
    expect(getByText('About')).toBeInTheDocument()
    expect(getByText('Terms')).toBeInTheDocument()
    expect(getByText('Privacy')).toBeInTheDocument()
  })

  it('has proper footer navigation label', () => {
    const { container } = render(<Footer />)
    
    const nav = container.querySelector('nav')
    expect(nav).toHaveAttribute('aria-label', 'Footer navigation')
  })

  it('applies hover styles to navigation links', () => {
    const { getByText } = render(<Footer />)
    
    const aboutLink = getByText('About')
    expect(aboutLink).toHaveClass('hover:text-sky-600')
  })

  it('has responsive flex layout', () => {
    const { container } = render(<Footer />)
    
    const contentDiv = container.querySelector('.flex.flex-col.sm\\:flex-row')
    expect(contentDiv).toBeInTheDocument()
    expect(contentDiv).toHaveClass('items-center', 'justify-between')
  })
})