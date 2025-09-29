import { type ReactNode } from 'react';
import Navbar from './Navbar';

interface LayoutProps { 
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navbar />
      <main className="flex-1 relative">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="relative z-10 mt-16 border-t border-white/20 bg-white/10 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h3 className="headline-small mb-4 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
              BookVerse
            </h3>
            <p className="body-medium text-gray-600 mb-6 max-w-md mx-auto">
              Discover your next favorite book with our community-driven recommendations and reviews.
            </p>
            <div className="flex justify-center items-center gap-6 text-sm text-gray-500">
              <span>© 2025 BookVerse</span>
              <span>•</span>
              <a href="#" className="hover:text-purple-600 transition-colors">Privacy</a>
              <span>•</span>
              <a href="#" className="hover:text-purple-600 transition-colors">Terms</a>
              <span>•</span>
              <a href="#" className="hover:text-purple-600 transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
