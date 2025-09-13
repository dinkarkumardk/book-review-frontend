import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
  const { user, logout } = useAuth();

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">You are not logged in.</div>;
  }

  return (
    <main className="max-w-md mx-auto py-10 px-4">
      <section className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm">
        <h1 className="text-2xl font-semibold mb-4">Profile</h1>
        <div className="mb-2"><strong>Name:</strong> {user.name}</div>
        <div className="mb-2"><strong>Email:</strong> {user.email}</div>
        <div className="mt-4">
          <button
            onClick={logout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
          >
            Logout
          </button>
        </div>
      </section>
    </main>
  );
};

export default ProfilePage;
