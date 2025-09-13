import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/login', { email, password });
      login(response.data.token, response.data.user);
      toast.success('Logged in successfully');
      navigate('/', { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-slate-900 py-12">
      <div className="app-container">
        <div className="max-w-md mx-auto">
          <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-gray-100 text-center">Welcome back</h2>
            {error && <div className="mb-3 text-red-500 text-center">{error}</div>}
            <div className="mb-4">
              <label className="block mb-1 text-sm text-slate-700 dark:text-slate-300">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                required
              />
            </div>
            <div className="mb-6">
              <label className="block mb-1 text-sm text-slate-700 dark:text-slate-300">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-sky-600 text-white py-2 rounded-md hover:bg-sky-700 shadow-sm"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
