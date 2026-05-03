import React, { useEffect, useState } from 'react';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await API.get('/appointments/doctor/stats');
      setStats(data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (appointmentId) => {
    try {
      await API.put(`/appointments/${appointmentId}`, { status: 'Confirmed' });
      toast.success('Appointment confirmed!');
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to confirm');
    }
  };

  const handleReschedule = async (appointmentId, newTime) => {
    try {
      await API.put(`/appointments/${appointmentId}`, { time: newTime });
      toast.success('Time updated!');
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome, Dr. {user?.name}</h1>
        <p className="text-gray-500 mt-1">Here's your overview for today</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Patients Treated</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.totalPatients || 0}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Today's Appointments</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {stats?.todayAppointments?.length || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📅</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending Confirmations</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.pendingCount || 0}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">⏳</span>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Appointments */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Today's Appointments</h2>
        </div>
        <div className="p-6">
          {stats?.todayAppointments?.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No appointments for today</p>
          ) : (
            <div className="space-y-4">
              {stats?.todayAppointments?.map((apt) => (
                <div
                  key={apt._id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{apt.patient?.name}</h3>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            apt.status === 'Confirmed'
                              ? 'bg-green-100 text-green-700'
                              : apt.status === 'Pending'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {apt.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                        <p>
                          <span className="font-medium">Time:</span> {apt.time}
                        </p>
                        <p>
                          <span className="font-medium">Phone:</span> {apt.patient?.phone || 'N/A'}
                        </p>
                        <p>
                          <span className="font-medium">Age:</span> {apt.patient?.age || 'N/A'}
                        </p>
                        <p>
                          <span className="font-medium">Gender:</span> {apt.patient?.gender || 'N/A'}
                        </p>
                      </div>
                      {apt.symptoms && (
                        <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                          <span className="font-medium text-gray-700">Symptoms:</span>{' '}
                          <span className="text-gray-600">{apt.symptoms}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      {apt.status === 'Pending' && (
                        <button
                          onClick={() => handleConfirm(apt._id)}
                          className="px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700"
                        >
                          Confirm
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
