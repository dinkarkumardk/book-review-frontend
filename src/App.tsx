import Layout from './components/Layout';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth, AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from '@/components/ErrorBoundary';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import BookDetailPage from '@/pages/BookDetailPage';
import ProfilePage from '@/pages/ProfilePage';
import BookListPage from '@/pages/BookListPage';

function AppShell() {
  const { initializing } = useAuth();
  
  if (initializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col items-center justify-center gap-6">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-purple-600 rounded-full animate-pulse"></div>
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Loading BookVerse</h3>
          <p className="text-sm text-gray-500">Preparing your reading experience...</p>
        </div>
      </div>
    );
  }
  return (
    <ErrorBoundary>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<BookListPage />} />
            <Route path="/books" element={<BookListPage />} />
            <Route path="/books/:id" element={<BookDetailPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route element={<ProtectedRoute />}> 
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
          </Routes>
        </Layout>
        <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
      </Router>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}

export default App;
