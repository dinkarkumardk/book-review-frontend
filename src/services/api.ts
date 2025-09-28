import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  withCredentials: true,
});

// Attach auth token from unified storage key if present
api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers = config.headers || {};
      (config.headers as any)['Authorization'] = `Bearer ${token}`;
    }
  } catch {}
  return config;
});

// (Refresh logic placeholder if token refresh is added later)

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      // Simple strategy: clear auth and redirect to login once.
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        if (!window.location.pathname.startsWith('/login')) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// ---- Domain API Helpers ----

export interface Book {
  id: number;
  title: string;
  author: string;
  description?: string;
  coverImageURL?: string;
  genres?: string[];
  avgRating?: number;
  reviewCount?: number;
}

export interface Review {
  id: number;
  rating: number;
  text: string;
  createdAt: string;
  updatedAt: string;
  book: { id: number; title: string; author?: string };
}

export async function fetchUserFavorites(): Promise<Book[]> {
  const { data } = await api.get<Book[]>('/profile/favorites');
  return data;
}

export async function fetchUserReviews(): Promise<Review[]> {
  const { data } = await api.get<Review[]>('/profile/reviews');
  return data;
}

export async function toggleFavorite(bookId: number): Promise<{ message: string }> {
  const { data } = await api.post<{ message: string }>('/profile/favorites', { bookId });
  return data;
}

export async function fetchHybridRecommendations(): Promise<Book[]> {
  const { data } = await api.get<Book[]>('/recommendations');
  return data;
}

export async function fetchTopRatedRecommendations(): Promise<Book[]> {
  const { data } = await api.get<Book[]>('/recommendations/top-rated');
  return data;
}

export async function fetchLLMRecommendations(): Promise<Book[]> {
  const { data } = await api.get<Book[]>('/recommendations/llm');
  return data;
}
