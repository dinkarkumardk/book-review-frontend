import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import {
  fetchUserFavorites,
  fetchUserReviews,
  fetchHybridRecommendations,
  fetchTopRatedRecommendations,
  fetchLLMRecommendations,
} from '../services/api';
import type { Book, Review } from '../services/api';

const ProfilePage = () => {
  const { user, logout } = useAuth();

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">You are not logged in.</div>;
  }

  const [favorites, setFavorites] = useState<Book[] | null>(null);
  const [reviews, setReviews] = useState<Review[] | null>(null);
  const [recs, setRecs] = useState<Book[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<'favorites' | 'reviews' | 'recs'>('favorites');
  const [recMode, setRecMode] = useState<'hybrid' | 'top' | 'llm'>('hybrid');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        if (tab === 'favorites' && favorites === null) {
          const data = await fetchUserFavorites();
          if (!cancelled) setFavorites(data);
        } else if (tab === 'reviews' && reviews === null) {
          const data = await fetchUserReviews();
          if (!cancelled) setReviews(data);
        } else if (tab === 'recs') {
          let data: Book[] = [];
            if (recMode === 'hybrid') data = await fetchHybridRecommendations();
            else if (recMode === 'top') data = await fetchTopRatedRecommendations();
            else if (recMode === 'llm') {
              try { data = await fetchLLMRecommendations(); }
              catch (e: any) { setError(e?.response?.data?.error || 'LLM recs unavailable'); }
            }
          if (!cancelled) setRecs(data);
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.response?.data?.error || 'Failed to load data');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [tab, recMode]);

  const tabButton = (key: typeof tab, label: string) => (
    <button
      onClick={() => setTab(key)}
      className={`px-4 py-2 text-sm font-medium rounded-md border transition-colors ${
        tab === key
          ? 'bg-sky-600 text-white border-sky-600'
          : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600 hover:bg-sky-50 dark:hover:bg-slate-600'
      }`}
    >
      {label}
    </button>
  );

  const recModeButton = (mode: typeof recMode, label: string) => (
    <button
      onClick={() => { setRecMode(mode); setRecs(null); }}
      className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${
        recMode === mode
          ? 'bg-indigo-600 text-white border-indigo-600'
          : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600 hover:bg-indigo-50 dark:hover:bg-slate-600'
      }`}
    >
      {label}
    </button>
  );

  return (
    <main className="max-w-5xl mx-auto py-10 px-4">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-sky-600 via-indigo-600 to-fuchsia-600 text-transparent bg-clip-text">Profile</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Manage your activity, favorites and personalized recommendations.</p>
        </div>
        <div className="flex items-center gap-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-5 py-3 shadow-sm">
          <div>
            <div className="font-semibold">{user.name}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">{user.email}</div>
          </div>
          <button
            onClick={logout}
            className="text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white px-3 py-2 rounded-md shadow-sm"
          >Logout</button>
        </div>
      </header>

      <div className="flex flex-wrap gap-3 mb-6">
        {tabButton('favorites', 'Favorites')}
        {tabButton('reviews', 'My Reviews')}
        {tabButton('recs', 'Recommendations')}
      </div>

      {tab === 'recs' && (
        <div className="flex flex-wrap gap-2 mb-6 items-center">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mr-2">Mode:</span>
          {recModeButton('hybrid', 'Hybrid')}
          {recModeButton('top', 'Top Rated')}
          {recModeButton('llm', 'LLM')}
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-sm dark:bg-rose-900/30 dark:border-rose-800 dark:text-rose-200">{error}</div>
      )}

      {loading && (
        <div className="py-10 text-center text-sm text-slate-500">Loading...</div>
      )}

      {!loading && tab === 'favorites' && (
        <section>
          {favorites && favorites.length === 0 && <p className="text-sm text-slate-500">No favorites yet.</p>}
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {favorites?.map(b => (
              <li key={b.id} className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
                <h3 className="font-semibold text-sm mb-1 line-clamp-1">{b.title}</h3>
                <p className="text-xs text-slate-500 mb-2 line-clamp-1">{b.author}</p>
                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                  <span>Rating: {b.avgRating?.toFixed(1) ?? '0.0'}</span>
                  <span>Reviews: {b.reviewCount ?? 0}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {!loading && tab === 'reviews' && (
        <section>
          {reviews && reviews.length === 0 && <p className="text-sm text-slate-500">No reviews written.</p>}
          <ul className="space-y-4">
            {reviews?.map(r => (
              <li key={r.id} className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-sm">{r.book.title}</h3>
                  <span className="text-xs font-medium text-amber-600">{r.rating}/5</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-2 whitespace-pre-line">{r.text}</p>
                <div className="text-[10px] text-slate-400">{new Date(r.createdAt).toLocaleDateString()}</div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {!loading && tab === 'recs' && (
        <section>
          {recs && recs.length === 0 && <p className="text-sm text-slate-500">No recommendations yet.</p>}
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {recs?.map(b => (
              <li key={b.id} className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
                <h3 className="font-semibold text-sm mb-1 line-clamp-1">{b.title}</h3>
                <p className="text-xs text-slate-500 mb-2 line-clamp-1">{b.author}</p>
                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                  <span>{b.avgRating?.toFixed(1) ?? '0.0'}★</span>
                  <span>{b.reviewCount ?? 0} reviews</span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
};

export default ProfilePage;
