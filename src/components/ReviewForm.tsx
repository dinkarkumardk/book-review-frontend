import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

interface ReviewFormProps {
  bookId: string;
  onCreated?: (review?: any) => void; // pass created review for optimistic UI
  className?: string;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({ bookId, onCreated, className }) => {
  const { user } = useAuth();
  const [rating, setRating] = useState<number>(0);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const DRAFT_KEY = `review_draft_${bookId}`;

  // Load draft
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed.rating === 'number') setRating(parsed.rating);
        if (typeof parsed.content === 'string') setContent(parsed.content);
      }
    } catch {}
  }, [DRAFT_KEY]);

  // Persist draft (debounced via simple timeout)
  useEffect(() => {
    const t = setTimeout(() => {
      if (!user) return; // only save if logged in
      if (rating || content.trim()) {
        try { localStorage.setItem(DRAFT_KEY, JSON.stringify({ rating, content })); } catch {}
      } else {
        localStorage.removeItem(DRAFT_KEY);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [rating, content, user, DRAFT_KEY]);

  if (!user) {
    return <div className={cn('text-xs text-muted-foreground', className)}>Log in to write a review.</div>;
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating || !content.trim()) return;
    setSubmitting(true);
    try {
  const res = await api.post(`/books/${bookId}/reviews`, { rating, text: content });
  toast.success('Review added');
  setRating(0);
  setContent('');
  localStorage.removeItem(DRAFT_KEY);
  onCreated?.(res.data);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to add review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className={cn('space-y-4', className)}>
      <div className="flex items-center gap-2">
        {Array.from({ length: 5 }).map((_, i) => {
          const val = i + 1;
            return (
              <button
                key={val}
                type="button"
                onClick={() => setRating(val)}
                className={cn('text-xl transition-colors', val <= rating ? 'text-yellow-500' : 'text-muted-foreground hover:text-foreground')}
                aria-label={`Rate ${val} star${val>1?'s':''}`}
              >
                {val <= rating ? '★' : '☆'}
              </button>
            );
        })}
      </div>
      <div>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={4}
          placeholder="Share your thoughts about this book..."
          className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          required
        />
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={submitting || !rating || !content.trim()} loading={submitting} size="sm">
          Post Review
        </Button>
      </div>
    </form>
  );
};

export default ReviewForm;
