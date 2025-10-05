import axios from 'axios';

// Determine base API URL:
// Priority: explicitly provided VITE_API_BASE_URL (can be absolute or /api) -> fallback to '/api' when running under CDN/domain -> dev localhost
function resolveBaseURL() {
  const envUrl = (import.meta as any)?.env?.VITE_API_BASE_URL || (window as any)?.VITE_API_BASE_URL || '';
  let candidate = envUrl.trim();
  if (!candidate && typeof window !== 'undefined') {
    candidate = '/api';
  }
  if (!candidate) {
    candidate = 'http://localhost:3001/api';
  }
  return candidate.replace(/\/$/, '');
}

const api = axios.create({
  baseURL: resolveBaseURL(),
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
  } catch (e) {
    console.warn('Failed to get auth token from localStorage:', e);
  }
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
  isFavorite?: boolean;
  relevanceScore?: number; // For recommendation scoring
}

export interface Review {
  id: number;
  rating: number;
  text: string;
  createdAt: string;
  updatedAt: string;
  book: { id: number; title: string; author?: string };
}

export interface RecommendationResponse {
  recommendations: Book[];
  mode: 'hybrid' | 'top-rated' | 'llm';
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function fetchUserFavorites(): Promise<Book[]> {
  const { data } = await api.get<Book[]>('/profile/favorites');
  return Array.isArray(data) ? data : [];
}

export async function fetchUserReviews(): Promise<Review[]> {
  const { data } = await api.get<Review[]>('/profile/reviews');
  return Array.isArray(data) ? data : [];
}

export async function toggleFavorite(bookId: number): Promise<{ message: string }> {
  const { data } = await api.post<{ message: string }>('/profile/favorites', { bookId });
  return data;
}

export async function fetchHybridRecommendations(page = 1, limit = 10): Promise<RecommendationResponse> {
  const { data } = await api.get<RecommendationResponse>(`/recommendations?page=${page}&limit=${limit}`);
  return data;
}

export async function fetchTopRatedRecommendations(page = 1, limit = 10): Promise<RecommendationResponse> {
  const { data } = await api.get<RecommendationResponse>(`/recommendations/top-rated?page=${page}&limit=${limit}`);
  return data;
}

export async function fetchLLMRecommendations(page = 1, limit = 10): Promise<RecommendationResponse> {
  const { data } = await api.get<RecommendationResponse>(`/recommendations/llm?page=${page}&limit=${limit}`);
  return data;
}
