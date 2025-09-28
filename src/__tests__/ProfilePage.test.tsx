import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect } from 'vitest';
import ProfilePage from '../pages/ProfilePage';

// Mock all dependencies
vi.mock('@/context/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useAuth: vi.fn(() => ({ user: { id: 1, username: 'testuser' } }))
}));

vi.mock('@/services/api', () => ({
  default: {
    get: vi.fn().mockResolvedValue({ data: [] })
  },
  fetchUserFavorites: vi.fn().mockResolvedValue([]),
  fetchUserReviews: vi.fn().mockResolvedValue([]),
  fetchHybridRecommendations: vi.fn().mockResolvedValue([])
}));

describe('ProfilePage', () => {
  it('renders profile page header', () => {
    render(
      <BrowserRouter>
        <ProfilePage />
      </BrowserRouter>
    );
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });
});