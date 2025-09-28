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
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-sm text-muted-foreground">
        <div className="animate-spin h-8 w-8 rounded-full border-2 border-sky-500 border-t-transparent" />
        <p>Loading session...</p>
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
