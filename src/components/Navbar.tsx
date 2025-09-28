import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav aria-label="Main navigation" className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/70 shadow-sm">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8 lg:px-10 h-16 flex items-center justify-between gap-8">
  <div className="flex items-center gap-6 min-w-0 py-1">
          <Link
            to="/"
            className="relative font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-600 via-indigo-500 to-fuchsia-500 text-2xl tracking-tight select-none hover:scale-[1.02] active:scale-[0.99] transition-transform"
            aria-label="BookVerse Home"
          >
            BookVerse
          </Link>
          <span className="hidden md:inline text-[11px] uppercase tracking-widest font-medium bg-gradient-to-r from-slate-500 to-slate-400 dark:from-slate-400 dark:to-slate-500 bg-clip-text text-transparent">
            Discover · Curate · Review
          </span>
        </div>
  <div className="flex items-center py-1 overflow-x-auto no-scrollbar">
          <ul className="flex items-center font-medium whitespace-nowrap list-none p-0 m-0">
            <li className="mr-10 sm:mr-14 lg:mr-20 xl:mr-24"><NavLinkItem to="/" label="Home" /></li>
            <li className="mr-10 sm:mr-14 lg:mr-20 xl:mr-24"><NavLinkItem to="/search" label="Search" /></li>
            {user ? (
              <>
                <li className="mr-10 sm:mr-14 lg:mr-20 xl:mr-24"><NavLinkItem to="/profile" label="Profile" /></li>
                <li>
                  <button
                    onClick={() => {
                      logout();
                      toast.success('Logged out');
                      navigate('/', { replace: true });
                    }}
                    aria-label="Logout"
                    className="group inline-flex items-center gap-1.5 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/60 text-white text-xs sm:text-sm font-semibold px-6 py-2.5 rounded-md shadow-sm transition-all active:scale-[0.97]"
                  >
                    <span className="opacity-90 group-hover:opacity-100">Logout</span>
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="mr-10 sm:mr-14 lg:mr-20 xl:mr-24"><NavLinkItem to="/login" label="Login" /></li>
                <li>
                  <Link
                    to="/signup"
                    className="inline-flex items-center text-xs sm:text-sm font-semibold bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60 text-white px-6 py-2.5 rounded-md shadow-sm transition-all active:scale-[0.97]"
                    aria-label="Create account"
                  >
                    Sign Up
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

// Reusable nav link component with active + focus styles
import { NavLink } from 'react-router-dom';

interface NavLinkItemProps { to: string; label: string; }
const NavLinkItem = ({ to, label }: NavLinkItemProps) => (
  <NavLink
    to={to}
    end={to === '/'}
    aria-label={label}
    className={({ isActive }) => [
  'group relative inline-flex items-center justify-center rounded-md px-4 sm:px-5 py-2 text-xs sm:text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60 flex-shrink-0',
      isActive
        ? 'text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-900/30 shadow-inner'
        : 'text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
    ].join(' ')}
  >
    <span className="relative flex items-center px-0.5">{label}</span>
  </NavLink>
);
