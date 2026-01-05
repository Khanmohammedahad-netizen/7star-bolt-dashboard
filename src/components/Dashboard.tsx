import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Sidebar } from './Sidebar';
import { CalendarView } from './CalendarView';
import { EventDetails } from './EventDetails';
import { MaterialsManagement } from './MaterialsManagement';
import { PaymentsManagement } from './PaymentsManagement';
import { InvoicesManagement } from './InvoicesManagement';
import { UsersManagement } from './UsersManagement';

type View = 'calendar' | 'materials' | 'payments' | 'invoices' | 'users';

export function Dashboard() {
  const { profile } = useAuth();
  const [currentView, setCurrentView] = useState<View>('calendar');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  if (!profile) {
    return null;
  }

  const handleEventClick = (eventId: string) => {
    setSelectedEventId(eventId);
    setCurrentView('calendar');
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />

      <main className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-900">
              {currentView === 'calendar' && 'Events Calendar'}
              {currentView === 'materials' && 'Materials Management'}
              {currentView === 'payments' && 'Payment Tracking'}
              {currentView === 'invoices' && 'Invoice Management'}
              {currentView === 'users' && 'User Management'}
            </h1>
            <div className="flex items-center space-x-4 mt-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-slate-100 text-slate-800">
                {profile.region.toUpperCase()}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800">
                {profile.role.replace('_', ' ').toUpperCase()}
              </span>
            </div>
          </div>

          {currentView === 'calendar' && (
            selectedEventId ? (
              <EventDetails eventId={selectedEventId} onBack={() => setSelectedEventId(null)} />
            ) : (
              <CalendarView onEventClick={handleEventClick} />
            )
          )}
          {currentView === 'materials' && <MaterialsManagement />}
          {currentView === 'payments' && <PaymentsManagement />}
          {currentView === 'invoices' && <InvoicesManagement />}
          {currentView === 'users' && profile.role === 'admin' && <UsersManagement />}
        </div>
      </main>
    </div>
  );
}
