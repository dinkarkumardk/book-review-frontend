import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect } from 'vitest';
import LoginPage from '../pages/LoginPage';

// Mock the auth context to avoid auth provider error
vi.mock('@/context/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useAuth: vi.fn(() => ({ user: null, login: vi.fn(), logout: vi.fn() }))
}));

describe('LoginPage', () => {
  it('renders login form', () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );
    expect(screen.getByText('Welcome back')).toBeInTheDocument();
  });
});