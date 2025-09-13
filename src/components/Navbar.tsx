import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav aria-label="Main navigation" className="sticky top-0 z-40 bg-white/85 dark:bg-slate-900/85 backdrop-blur border-b border-slate-200 dark:border-slate-800">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-6">
        <div className="flex items-center gap-5 min-w-0">
          <Link to="/" className="text-sky-600 dark:text-sky-400 font-semibold text-xl tracking-tight">BookVerse</Link>
          <span className="hidden md:inline text-xs text-slate-500 dark:text-slate-400">Discover & review books</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/" className="text-xs font-medium text-slate-600 dark:text-slate-200 hover:text-sky-600 transition-colors">Home</Link>
          <Link to="/search" className="text-xs font-medium text-slate-600 dark:text-slate-200 hover:text-sky-600 transition-colors">Search</Link>
          {user ? (
            <div className="flex items-center gap-3">
              <Link to="/profile" className="text-xs font-medium text-slate-600 dark:text-slate-200 hover:text-sky-600 transition-colors">Profile</Link>
              <button
                onClick={() => {
                  logout();
                  toast.success('Logged out');
                  navigate('/', { replace: true });
                }}
                className="inline-flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium px-3 py-1.5 rounded-md shadow-sm transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-xs font-medium text-slate-600 dark:text-slate-200 hover:text-sky-600 transition-colors">Login</Link>
              <Link to="/signup" className="inline-flex items-center text-xs font-medium bg-sky-600 hover:bg-sky-500 text-white px-3 py-1.5 rounded-md shadow-sm transition-colors">Sign up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
