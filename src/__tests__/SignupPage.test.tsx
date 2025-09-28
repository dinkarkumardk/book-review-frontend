import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect } from 'vitest';
import SignupPage from '../pages/SignupPage';

// Mock the auth context to avoid auth provider error
vi.mock('@/context/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useAuth: vi.fn(() => ({ user: null, login: vi.fn(), logout: vi.fn() }))
}));

describe('SignupPage', () => {
  it('renders signup form', () => {
    render(
      <BrowserRouter>
        <SignupPage />
      </BrowserRouter>
    );
    expect(screen.getByText('Create your account')).toBeInTheDocument();
  });
});