import { useState } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
  <form onSubmit={handleSubmit} className="flex items-center gap-3">
      <label htmlFor="search" className="sr-only">Search books</label>
      <div className="flex-1">
        <input
          id="search"
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search books by title or author"
          className="w-full h-11 px-4 rounded-md border border-slate-300 dark:border-slate-600 bg-white/90 dark:bg-slate-800/70 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400 text-sm placeholder:text-slate-400"
        />
      </div>
      <button
        type="submit"
        className="inline-flex h-11 items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white px-5 rounded-md shadow-sm text-sm font-medium transition-colors"
        aria-label="Search"
      >
        Search
      </button>
    </form>
  );
};

export default SearchBar;
