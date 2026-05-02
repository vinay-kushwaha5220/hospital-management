import React, { useEffect, useState } from 'react';
import API from '../api/axios';
import {
  UserGroupIcon,
  UsersIcon,
  CalendarDaysIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="card flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const cls = {
    Pending: 'badge-pending',
    Confirmed: 'badge-confirmed',
    Cancelled: 'badge-cancelled',
  };
  return <span className={cls[status] || 'badge-pending'}>{status}</span>;
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/dashboard')
      .then(({ data }) => setStats(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Overview of your hospital</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Doctors"
          value={stats?.totalDoctors ?? 0}
          icon={UserGroupIcon}
          color="bg-blue-500"
        />
        <StatCard
          title="Total Patients"
          value={stats?.totalPatients ?? 0}
          icon={UsersIcon}
          color="bg-green-500"
        />
        <StatCard
          title="Total Appointments"
          value={stats?.totalAppointments ?? 0}
          icon={CalendarDaysIcon}
          color="bg-purple-500"
        />
        <StatCard
          title="Pending"
          value={stats?.statusCounts?.Pending ?? 0}
          icon={ClockIcon}
          color="bg-yellow-500"
        />
      </div>

      {/* Status breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Confirmed', value: stats?.statusCounts?.Confirmed ?? 0, color: 'text-green-600 bg-green-50' },
          { label: 'Pending', value: stats?.statusCounts?.Pending ?? 0, color: 'text-yellow-600 bg-yellow-50' },
          { label: 'Cancelled', value: stats?.statusCounts?.Cancelled ?? 0, color: 'text-red-600 bg-red-50' },
        ].map(({ label, value, color }) => (
          <div key={label} className={`rounded-xl p-4 ${color}`}>
            <p className="text-sm font-medium">{label} Appointments</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
          </div>
        ))}
      </div>

      {/* Recent appointments */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Appointments</h2>
        {stats?.recentAppointments?.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">No appointments yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 px-3 text-gray-500 font-medium">Patient</th>
                  <th className="text-left py-2 px-3 text-gray-500 font-medium">Doctor</th>
                  <th className="text-left py-2 px-3 text-gray-500 font-medium">Date</th>
                  <th className="text-left py-2 px-3 text-gray-500 font-medium">Time</th>
                  <th className="text-left py-2 px-3 text-gray-500 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recentAppointments?.map((apt) => (
                  <tr key={apt._id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-3 font-medium">{apt.patient?.name}</td>
                    <td className="py-3 px-3 text-gray-600">{apt.doctor?.name}</td>
                    <td className="py-3 px-3 text-gray-600">{apt.date}</td>
                    <td className="py-3 px-3 text-gray-600">{apt.time}</td>
                    <td className="py-3 px-3">
                      <StatusBadge status={apt.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
