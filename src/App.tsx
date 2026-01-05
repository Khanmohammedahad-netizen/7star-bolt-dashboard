import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';

import Login from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Events } from './pages/Events';
import { EventDetail } from './pages/EventDetail';
import { Users } from './pages/Users';
import { AuditLog } from './pages/AuditLog';

export default function App() {
  const { user, loading, logout } = useAuth();

  // 🔄 App initialization state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading...</p>
          <p className="text-sm text-gray-400 mt-2">
            Initializing application
          </p>
        </div>
      </div>
    );
  }

  // 🔐 Not logged in → Login page
  if (!user) {
    return <Login />;
  }

  // 🧠 RBAC helpers
  const isAdmin =
    user.role === 'super_admin' || user.role === 'country_admin';

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Header
          companyName="7 Star International"
          userName={user.email}
          onLogout={logout}
        />

        <main className="flex-1 p-8 overflow-auto">
          <Routes>
            {/* Core routes */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/:id" element={<EventDetail />} />

            {/* Admin-only routes */}
            {isAdmin && (
              <Route path="/users" element={<Users />} />
            )}

            {/* Audit (visible to all logged-in users for now) */}
            <Route path="/audit" element={<AuditLog />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
