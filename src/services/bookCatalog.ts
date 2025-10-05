import api from './api';
import type { Book } from './api';

export type SortKey = 'title' | 'author' | 'rating' | 'reviews';
export type SortOrder = 'asc' | 'desc';

export interface BookPageRequest {
  page?: number;
  limit?: number;
  search?: string;
  genre?: string;
  sort?: SortKey;
  order?: SortOrder;
  includeFacets?: boolean;
}

export interface BookPageResult {
  books: Book[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  availableGenres: string[];
  fromCache: boolean;
}

interface CacheEntry {
  data: Book[];
  page: number;
  total: number;
  totalPages: number;
  availableGenres?: string[];
  pageSize: number;
  timestamp: number;
}

interface MetaEntry {
  total: number;
  totalPages: number;
  availableGenres?: string[];
  timestamp: number;
}

const DEFAULT_LIMIT = 10;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

const pageCache = new Map<string, CacheEntry>();
const metaCache = new Map<string, MetaEntry>();

const normalizeGenre = (value?: string) => {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed || trimmed.toLowerCase() === 'all') return undefined;
  return trimmed;
};

const normalizeSearch = (value?: string) => {
  if (!value) return undefined;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
};

const normalizeSort = (sort?: SortKey, order?: SortOrder): { sort: SortKey; order: SortOrder } => {
  const key: SortKey = sort ?? 'title';
  if (order) return { sort: key, order };
  if (key === 'rating' || key === 'reviews') {
    return { sort: key, order: 'desc' };
  }
  return { sort: key, order: 'asc' };
};

const getAuthCacheKey = () => {
  if (typeof window === 'undefined') return 'anonymous';
  try {
    const userRaw = window.localStorage.getItem('auth_user');
    if (userRaw) {
      const parsed = JSON.parse(userRaw);
      if (parsed && typeof parsed.id !== 'undefined') {
        return `user:${parsed.id}`;
      }
    }
    const token = window.localStorage.getItem('auth_token');
    if (token) {
      return `token:${token.slice(0, 12)}`;
    }
  } catch (_err) {
    // Swallow access errors (e.g., private mode)
  }
  return 'anonymous';
};

const makeFilterKey = (opts: { search?: string; genre?: string; sort: SortKey; order: SortOrder; limit: number; authKey: string }) =>
  JSON.stringify(opts);

const makeCacheKey = (filterKey: string, page: number) => `${filterKey}|page=${page}`;

const getValidMeta = (filterKey: string, now: number): MetaEntry | undefined => {
  const meta = metaCache.get(filterKey);
  if (!meta) return undefined;
  if (now - meta.timestamp > CACHE_TTL_MS) {
    metaCache.delete(filterKey);
    return undefined;
  }
  return meta;
};

export function invalidateBookCache() {
  pageCache.clear();
  metaCache.clear();
}

export async function fetchBooksPage(request: BookPageRequest = {}): Promise<BookPageResult> {
  const page = Math.max(1, Math.floor(request.page ?? 1));
  const limit = Math.max(1, Math.floor(request.limit ?? DEFAULT_LIMIT));
  const search = normalizeSearch(request.search);
  const genre = normalizeGenre(request.genre);
  const { sort, order } = normalizeSort(request.sort, request.order);

  const now = Date.now();
  const authKey = getAuthCacheKey();
  const filterKey = makeFilterKey({ search, genre, sort, order, limit, authKey });
  const cacheKey = makeCacheKey(filterKey, page);

  const cachedMeta = getValidMeta(filterKey, now);
  const cachedPage = pageCache.get(cacheKey);
  if (cachedPage && now - cachedPage.timestamp > CACHE_TTL_MS) {
    pageCache.delete(cacheKey);
  }
  if (cachedPage && now - cachedPage.timestamp <= CACHE_TTL_MS) {
    const total = cachedMeta?.total ?? cachedPage.total;
    const totalPages = cachedMeta?.totalPages ?? cachedPage.totalPages;
    const availableGenres = cachedMeta?.availableGenres ?? cachedPage.availableGenres ?? [];
    return {
      books: cachedPage.data,
      page: cachedPage.page,
      pageSize: cachedPage.pageSize,
      total,
      totalPages,
      availableGenres,
      fromCache: true,
    };
  }

  const params: Record<string, any> = {
    page,
    limit,
    sort,
    order,
  };

  let includeMeta = request.includeFacets ?? (!search && (!cachedMeta || page === 1));
  if (genre) params.genre = genre;

  let endpoint = '/books';
  if (search) {
    endpoint = '/books/search';
    params.q = search;
    includeMeta = true; // search endpoint always returns pagination metadata
  } else if (includeMeta) {
    params.meta = 'true';
    params.facets = 'true';
  }

  const response = await api.get(endpoint, { params });
  const payload = response.data;

  let books: Book[] = [];
  let total = cachedMeta?.total ?? 0;
  let totalPages = cachedMeta?.totalPages ?? 1;
  let availableGenres: string[] | undefined = cachedMeta?.availableGenres;

  if (Array.isArray(payload)) {
    books = payload;
    const effectiveTotal = cachedMeta?.total ?? payload.length;
    total = effectiveTotal;
    totalPages = cachedMeta?.totalPages ?? Math.max(1, Math.ceil(effectiveTotal / limit));
  } else {
    const rawData = payload?.data ?? payload?.books ?? [];
    books = Array.isArray(rawData) ? rawData : [];
    if (typeof payload?.total === 'number') {
      total = payload.total;
    } else if (!cachedMeta) {
      total = books.length;
    }
    if (typeof payload?.totalPages === 'number') {
      totalPages = payload.totalPages;
    } else if (!cachedMeta && total) {
      totalPages = Math.max(1, Math.ceil(total / limit));
    }
    if (!search && Array.isArray(payload?.availableGenres)) {
      availableGenres = payload.availableGenres;
    }
  }

  const pageEntry: CacheEntry = {
    data: books,
    page,
    total,
    totalPages,
    availableGenres,
    pageSize: limit,
    timestamp: now,
  };
  pageCache.set(cacheKey, pageEntry);

  if (!search) {
    metaCache.set(filterKey, {
      total,
      totalPages,
      availableGenres,
      timestamp: now,
    });
  } else {
    metaCache.set(filterKey, {
      total,
      totalPages,
      timestamp: now,
    });
  }

  return {
    books,
    page,
    pageSize: limit,
    total,
    totalPages,
    availableGenres: availableGenres ?? [],
    fromCache: false,
  };
}
