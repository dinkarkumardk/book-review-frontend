import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Force re-render when auth state changes
  useEffect(() => {
    // This effect will run whenever user or token changes
    console.log('Navbar: Auth state changed', { user: user?.name, hasToken: !!token });
  }, [user, token]);

  const handleLogout = () => {
    logout();
    toast.success('Successfully logged out!', {
      icon: '👋',
      style: {
        borderRadius: '24px',
        background: '#f8fafc',
        color: '#334155',
        border: '1px solid #e2e8f0'
      }
    });
    navigate('/', { replace: true });
  };

  return (
    <nav className="sticky top-0 z-50 glass-card border-b border-white/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 2c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6H6zm7 7V3.5L18.5 9H13z"/>
                </svg>
              </div>
              <div className="hidden sm:block">
                <h1 className="headline-small bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent font-bold">
                  BookVerse
                </h1>
                <p className="body-small text-gray-500 -mt-1">Discover Amazing Books</p>
              </div>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-1">
            <NavItem to="/" label="Home" currentPath={location.pathname} />
            <NavItem to="/books" label="Books" currentPath={location.pathname} />
            {user && <NavItem to="/profile" label="Profile" currentPath={location.pathname} />}
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="title-small text-gray-700">{user.name}</span>
                  <span className="body-small text-gray-500">{user.email}</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <button onClick={handleLogout} className="btn-text text-red-600 hover:bg-red-50">
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-text">Login</Link>
                <Link to="/signup" className="btn-filled">Sign Up</Link>
              </div>
            )}

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden btn-text p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-2 border-t border-white/20">
            <MobileNavItem to="/" label="Home" onClick={() => setIsMenuOpen(false)} />
            <MobileNavItem to="/books" label="Books" onClick={() => setIsMenuOpen(false)} />
            {user && <MobileNavItem to="/profile" label="Profile" onClick={() => setIsMenuOpen(false)} />}
          </div>
        )}
      </div>
    </nav>
  );
};

interface NavItemProps {
  to: string;
  label: string;
  currentPath: string;
}

const NavItem = ({ to, label, currentPath }: NavItemProps) => {
  const isActive = currentPath === to || (to !== '/' && currentPath.startsWith(to));
  
  return (
    <Link
      to={to}
      className={`px-4 py-2 rounded-full title-small transition-all duration-200 ${
        isActive 
          ? 'bg-purple-100 text-purple-700 font-medium' 
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      {label}
    </Link>
  );
};

interface MobileNavItemProps {
  to: string;
  label: string;
  onClick: () => void;
}

const MobileNavItem = ({ to, label, onClick }: MobileNavItemProps) => (
  <Link
    to={to}
    onClick={onClick}
    className="block px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors duration-200"
  >
    {label}
  </Link>
);

export default Navbar;
