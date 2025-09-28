import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import App from '../App';

// Mock auth context
vi.mock('@/context/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="auth-provider">{children}</div>
  ),
  useAuth: vi.fn(() => ({
    user: null,
    isLoading: false,
    login: vi.fn(),
    logout: vi.fn()
  }))
}));

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  Toaster: () => null
}));

describe('App Component', () => {
  it('renders app components', () => {
    render(<App />);
    expect(screen.getByTestId('auth-provider')).toBeInTheDocument();
  });
});