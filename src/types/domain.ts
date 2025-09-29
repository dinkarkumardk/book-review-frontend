export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  createdAt?: string;
}

export interface Review {
  id: string;
  bookId: string;
  userId: string;
  rating: number; // 1-5
  title?: string;
  text?: string;    // Backend returns 'text'
  content?: string; // Some components expect 'content'
  comment?: string; // Some components expect 'comment'
  createdAt: string;
  updatedAt?: string;
  user?: User; // expanded
}

export interface Book {
  id: string;
  title: string;
  author: string;
  description?: string;
  genres?: string[];
  publishedYear?: number;
  coverImage?: string | null;
  averageRating?: number; // computed
  ratingsCount?: number; // total number of reviews with rating
  createdAt?: string;
  updatedAt?: string;
}

export interface Recommendation {
  id: string;
  bookId: string;
  reason?: string; // LLM explanation or heuristic reason
  rank: number;
  book?: Book;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: unknown;
}
