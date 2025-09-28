import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import HomePage from '../pages/HomePage';

// Mock all the dependencies
vi.mock('@/context/AuthContext', () => ({
  useAuth: vi.fn(() => ({ user: null }))
}));

vi.mock('@/services/api', () => ({
  default: {
    get: vi.fn().mockResolvedValue({ data: { data: [] } })
  },
  fetchUserFavorites: vi.fn().mockResolvedValue([])
}));

vi.mock('../utils/getCoverFromBook', () => ({
  default: vi.fn()
}));

vi.mock('../components/SearchBar', () => ({
  default: () => <div>SearchBar</div>
}));

vi.mock('../components/BookCard', () => ({
  default: () => <div>BookCard</div>
}));

const renderHomePage = () => {
  return render(
    <BrowserRouter>
      <HomePage />
    </BrowserRouter>
  );
};

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders homepage components', () => {
    renderHomePage();
    expect(screen.getByText('SearchBar')).toBeInTheDocument();
  });

  it('renders without crashing', () => {
    renderHomePage();
    expect(screen.getByText('SearchBar')).toBeInTheDocument();
  });
});