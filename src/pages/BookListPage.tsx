import React, { useEffect, useState } from 'react';
import api from '@/services/api';
import type { Book } from '@/types/domain';
import { BookCardShadcn } from '@/components/BookCardShadcn';
import { Skeleton } from '@/components/ui/Skeleton';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface FetchState {
  loading: boolean;
  error: string | null;
}

export const BookListPage: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [query, setQuery] = useState('');
  const [fetchState, setFetchState] = useState<FetchState>({ loading: true, error: null });

  useEffect(() => {
    let active = true;
    setFetchState({ loading: true, error: null });
    api.get('/books')
      .then(res => {
        if (!active) return;
        const booksData = res.data.books || res.data || [];
        setBooks(Array.isArray(booksData) ? booksData : []);
        setFetchState({ loading: false, error: null });
      })
      .catch(err => {
        if (!active) return;
        setFetchState({ loading: false, error: err?.response?.data?.message || 'Failed to load books' });
      });
    return () => { active = false; };
  }, []);

  const filtered = query.trim()
    ? books.filter(b => [b.title, b.author, b.genres?.join(' ')].filter(Boolean).join(' ').toLowerCase().includes(query.toLowerCase()))
    : books;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Books</h1>
        <div className="w-full sm:w-72">
          <Input
            placeholder="Search by title, author, genre..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-9"
          />
        </div>
      </div>

      {fetchState.loading ? (
        <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(170px,1fr))]">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <Skeleton className="w-full aspect-[3/4] rounded-md" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : fetchState.error ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
          {fetchState.error}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
          <div className="text-6xl">📚</div>
          <div className="space-y-1">
            <p className="font-medium">No books found</p>
            <p className="text-sm text-muted-foreground">Try adjusting your search keywords.</p>
          </div>
        </div>
      ) : (
        <div className={cn('grid gap-4', 'grid-cols-[repeat(auto-fill,minmax(170px,1fr))]')}> 
          {filtered.map(book => (
            <BookCardShadcn key={book.id} book={book} />
          ))}
        </div>
      )}
    </div>
  );
};

export default BookListPage;
