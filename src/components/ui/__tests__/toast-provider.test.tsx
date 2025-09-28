import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { ToastProvider } from '../toast-provider'

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  Toaster: ({ position, toastOptions }: any) => (
    <div data-testid="toaster" data-position={position} data-options={JSON.stringify(toastOptions)}>
      Toaster
    </div>
  ),
}))

describe('ToastProvider Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<ToastProvider />)
    
    expect(container).toBeDefined()
  })

  it('renders toaster component', () => {
    const { getByTestId } = render(<ToastProvider />)
    
    expect(getByTestId('toaster')).toBeInTheDocument()
  })

  it('applies correct position configuration', () => {
    const { getByTestId } = render(<ToastProvider />)
    
    const toaster = getByTestId('toaster')
    expect(toaster).toHaveAttribute('data-position', 'top-center')
  })

  it('has proper toast styling configuration', () => {
    const { getByTestId } = render(<ToastProvider />)
    
    const toaster = getByTestId('toaster')
    expect(toaster).toHaveAttribute('data-options')
  })
})