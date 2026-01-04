import { Card } from '../components/ui/Card';
import { Users, Calendar, CheckCircle, Clock } from 'lucide-react';

export function Dashboard() {
  const stats = [
    { label: 'Total Users', value: '142', icon: Users, color: 'text-blue-600' },
    { label: 'Active Events', value: '28', icon: Calendar, color: 'text-green-600' },
    { label: 'Completed Events', value: '156', icon: CheckCircle, color: 'text-gray-600' },
    { label: 'Pending Approvals', value: '7', icon: Clock, color: 'text-amber-600' },
  ];

  const recentActivity = [
    { action: 'New event created', event: 'Corporate Summit 2024', time: '2 hours ago' },
    { action: 'Event approved', event: 'Product Launch', time: '4 hours ago' },
    { action: 'User role updated', event: 'John Doe to Manager', time: '5 hours ago' },
    { action: 'Payment received', event: 'Annual Gala', time: '1 day ago' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-1">Dashboard</h2>
        <p className="text-sm text-gray-600">Overview of your event management system</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-3xl font-semibold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color}`}>
                  <Icon size={32} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {recentActivity.map((activity, index) => (
            <div
              key={index}
              className="flex items-start justify-between pb-4 border-b border-gray-100 last:border-0"
            >
              <div>
                <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                <p className="text-sm text-gray-600 mt-1">{activity.event}</p>
              </div>
              <span className="text-xs text-gray-500">{activity.time}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
