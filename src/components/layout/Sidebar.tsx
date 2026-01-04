import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Calendar, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function Sidebar() {
  const { user } = useAuth();

  // HARD GUARD — no sidebar if not logged in
  if (!user) return null;

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-blue-50 text-blue-700'
        : 'text-gray-700 hover:bg-gray-50'
    }`;

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-full">
      <div className="p-4">
        <nav className="space-y-1">

          <NavLink to="/dashboard" className={linkClass}>
            <LayoutDashboard size={20} />
            Dashboard
          </NavLink>

          <NavLink to="/events" className={linkClass}>
            <Calendar size={20} />
            Events
          </NavLink>

          {/* ADMIN ONLY */}
          {user.role === 'admin' && (
            <NavLink to="/users" className={linkClass}>
              <Users size={20} />
              Users
            </NavLink>
          )}

          <NavLink to="/audit" className={linkClass}>
            <FileText size={20} />
            Reports
          </NavLink>

        </nav>
      </div>
    </aside>
  );
}
