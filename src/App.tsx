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
  const { user, loading } = useAuth();

  // ✅ MUST be inside function
  if (loading) {
    return <div className="p-10">Loading…</div>;
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Header
          companyName="7 Star International"
          userName={user.email}
          onLogout={() => {}}
        />

        <main className="flex-1 p-8 overflow-auto">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/:id" element={<EventDetail />} />

            {user.role === 'admin' && (
              <Route path="/users" element={<Users />} />
            )}

            <Route path="/audit" element={<AuditLog />} />

            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
