import React, { useState } from 'react';
import type { Review } from '@/types/domain';
import { RatingStars } from '@/components/ui/RatingStars';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

interface ReviewsListProps {
  reviews: Review[];
  className?: string;
  onReload?: () => void; // fallback reload
  onUpdate?: (review: Review) => void; // optimistic update
  onDelete?: (id: string) => void; // optimistic delete
}

export const ReviewsList: React.FC<ReviewsListProps> = ({ reviews, className, onReload, onUpdate, onDelete }) => {
  const { user } = useAuth();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [editRating, setEditRating] = useState(0);
  const [busyId, setBusyId] = useState<string | null>(null);

  if (!reviews.length) return <div className={cn('text-sm text-muted-foreground', className)}>No reviews yet.</div>;

  const startEdit = (r: Review) => {
  setEditingId(r.id);
  setEditText((r as any).text || (r as any).content || '');
    setEditRating(r.rating || 0);
  };

  const cancelEdit = () => {
    setEditingId(null);
  setEditText('');
    setEditRating(0);
  };

  const saveEdit = async (reviewId: string) => {
  if (!editText.trim() || !editRating) return;
    setBusyId(reviewId);
    try {
  const res = await api.put(`/reviews/${reviewId}`, { rating: editRating, text: editText });
      toast.success('Review updated');
      cancelEdit();
      if (res.data) {
        onUpdate?.(res.data);
      } else {
        onReload?.();
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Update failed');
    } finally {
      setBusyId(null);
    }
  };

  const deleteReview = async (reviewId: string) => {
    if (!confirm('Delete this review?')) return;
    setBusyId(reviewId);
    try {
  await api.delete(`/reviews/${reviewId}`);
  toast.success('Review deleted');
  onDelete?.(reviewId);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Delete failed');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {reviews.map(r => {
        const mine = user && r.user?.id === user.id;
        const editing = editingId === r.id;
        return (
          <div key={r.id} className="rounded-md border p-4 bg-background/50 space-y-2">
            <div className="flex items-center justify-between gap-4">
              <div className="text-sm font-medium">{r.user?.name || 'Anonymous'}</div>
              <div className="flex items-center gap-2">
                <RatingStars value={editing ? editRating : r.rating} showValue={false} size="sm" />
                {mine && !editing && (
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => startEdit(r)}>Edit</Button>
                    <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-red-600" disabled={busyId===r.id} onClick={() => deleteReview(r.id)}>Del</Button>
                  </div>
                )}
              </div>
            </div>
            {editing ? (
              <div className="space-y-3">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => {
                    const v = i+1;
                    return (
                      <button key={v} type="button" onClick={()=>setEditRating(v)} className={cn('text-lg', v <= editRating ? 'text-yellow-500' : 'text-muted-foreground hover:text-foreground')}>{v <= editRating ? '★':'☆'}</button>
                    );
                  })}
                </div>
                <textarea
                  value={editText}
                  onChange={e=>setEditText(e.target.value)}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  rows={4}
                />
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="outline" onClick={cancelEdit} disabled={busyId===r.id}>Cancel</Button>
                  <Button size="sm" onClick={()=>saveEdit(r.id)} disabled={busyId===r.id || !editRating || !editText.trim()} loading={busyId===r.id}>Save</Button>
                </div>
              </div>
            ) : (
              <>
                {r.title && <div className="text-sm font-semibold">{r.title}</div>}
                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{(r as any).text || (r as any).content}</p>
              </>
            )}
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</div>
          </div>
        );
      })}
    </div>
  );
};

export default ReviewsList;
