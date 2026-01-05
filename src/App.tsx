import { useAuth } from './contexts/AuthContext';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';

function App() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-slate-600 text-lg">Loading...</div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Login />;
  }

  return <Dashboard />;
}

export default App;
