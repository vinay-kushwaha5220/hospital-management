import React, { useEffect, useState } from 'react';
import API from '../api/axios';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { PlusIcon, PencilIcon, TrashIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

const emptyForm = { patient: '', doctor: '', date: '', time: '', notes: '', status: 'Pending' };

const StatusBadge = ({ status }) => {
  const cls = {
    Pending: 'badge-pending',
    Confirmed: 'badge-confirmed',
    Cancelled: 'badge-cancelled',
  };
  return <span className={cls[status] || 'badge-pending'}>{status}</span>;
};

const Appointments = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [myPatientProfile, setMyPatientProfile] = useState(null); // for patient role
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editApt, setEditApt] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // Filters
  const [filterDate, setFilterDate] = useState('');
  const [filterDoctor, setFilterDoctor] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const fetchAll = async () => {
    try {
      const params = {};
      if (filterDate) params.date = filterDate;
      if (filterDoctor) params.doctor = filterDoctor;
      if (filterStatus) params.status = filterStatus;

      const [aptRes, docRes] = await Promise.all([
        API.get('/appointments', { params }),
        API.get('/doctors'),
      ]);

      setDoctors(docRes.data);

      if (isAdmin) {
        const patRes = await API.get('/patients');
        setPatients(patRes.data);
        setAppointments(aptRes.data);
      } else {
        // Patient role — use patientId from stored user object
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        const pid = storedUser.patientId;

        if (pid) {
          setMyPatientProfile({ _id: pid, name: storedUser.name });
          const filtered = aptRes.data.filter((apt) => apt.patient?._id === pid);
          setAppointments(filtered);
        } else {
          // Fallback: try to find by userId from patients list
          const patRes = await API.get('/patients');
          const myProfile = patRes.data.find((p) => p.userId === storedUser._id || p.email === storedUser.email);
          setMyPatientProfile(myProfile || null);
          const filtered = myProfile
            ? aptRes.data.filter((apt) => apt.patient?._id === myProfile._id)
            : [];
          setAppointments(filtered);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [filterDate, filterDoctor, filterStatus]);

  const openAdd = () => {
    setEditApt(null);
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    setForm({
      ...emptyForm,
      patient: myPatientProfile?._id || storedUser.patientId || '',
    });
    setModalOpen(true);
  };

  const openEdit = (apt) => {
    setEditApt(apt);
    setForm({
      patient: apt.patient?._id || '',
      doctor: apt.doctor?._id || '',
      date: apt.date,
      time: apt.time,
      notes: apt.notes || '',
      status: apt.status,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Patient role validation
    if (!isAdmin && !myPatientProfile) {
      toast.error(
        'Your patient profile is not set up yet. Please ask admin to add you as a patient first.',
        { duration: 5000 }
      );
      return;
    }

    setSaving(true);
    try {
      if (editApt) {
        const { data } = await API.put(`/appointments/${editApt._id}`, form);
        setAppointments(appointments.map((a) => (a._id === data._id ? data : a)));
        toast.success('Appointment updated');
      } else {
        const { data } = await API.post('/appointments', form);
        setAppointments([data, ...appointments]);
        toast.success('Appointment booked successfully!');
      }
      setModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await API.delete(`/appointments/${deleteId}`);
      setAppointments(appointments.filter((a) => a._id !== deleteId));
      toast.success('Appointment deleted');
    } catch {
      toast.error('Failed to delete');
    } finally {
      setDeleteId(null);
    }
  };

  const clearFilters = () => {
    setFilterDate('');
    setFilterDoctor('');
    setFilterStatus('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-500 text-sm mt-1">{appointments.length} appointments</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-4 h-4" />
          Book Appointment
        </button>
      </div>

      {/* Patient role — no profile warning */}
      {!isAdmin && !myPatientProfile && !loading && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
          <span className="text-yellow-500 text-xl">⚠️</span>
          <div>
            <p className="text-sm font-medium text-yellow-800">Patient profile not found</p>
            <p className="text-xs text-yellow-600 mt-0.5">
              Your patient profile hasn't been created yet. Please contact the admin to add your profile, then you can book appointments.
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card">
        <div className="flex items-center gap-2 mb-3">
          <FunnelIcon className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filters</span>
          {(filterDate || filterDoctor || filterStatus) && (
            <button onClick={clearFilters} className="ml-auto text-xs text-blue-600 hover:underline">
              Clear all
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Date</label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="input-field text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Doctor</label>
            <select
              value={filterDoctor}
              onChange={(e) => setFilterDoctor(e.target.value)}
              className="input-field text-sm"
            >
              <option value="">All Doctors</option>
              {doctors.map((d) => (
                <option key={d._id} value={d._id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input-field text-sm"
            >
              <option value="">All Status</option>
              <option>Pending</option>
              <option>Confirmed</option>
              <option>Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg">No appointments found</p>
            <p className="text-sm mt-1">Click "Book Appointment" to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Patient</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Doctor</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Date</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Time</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Status</th>
                  <th className="text-right py-3 px-4 text-gray-500 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((apt) => (
                  <tr key={apt._id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">{apt.patient?.name}</td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-gray-900">{apt.doctor?.name}</p>
                        <p className="text-xs text-gray-400">{apt.doctor?.specialization}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{apt.date}</td>
                    <td className="py-3 px-4 text-gray-600">{apt.time}</td>
                    <td className="py-3 px-4"><StatusBadge status={apt.status} /></td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        {/* Admin quick confirm/cancel buttons */}
                        {isAdmin && apt.status === 'Pending' && (
                          <>
                            <button
                              onClick={async () => {
                                try {
                                  const { data } = await API.put(`/appointments/${apt._id}`, { status: 'Confirmed' });
                                  setAppointments(appointments.map((a) => a._id === data._id ? data : a));
                                  toast.success('Appointment confirmed');
                                } catch { toast.error('Failed'); }
                              }}
                              className="px-2 py-1 text-xs bg-green-100 text-green-700 hover:bg-green-200 rounded-lg font-medium transition-colors"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={async () => {
                                try {
                                  const { data } = await API.put(`/appointments/${apt._id}`, { status: 'Cancelled' });
                                  setAppointments(appointments.map((a) => a._id === data._id ? data : a));
                                  toast.success('Appointment cancelled');
                                } catch { toast.error('Failed'); }
                              }}
                              className="px-2 py-1 text-xs bg-red-100 text-red-700 hover:bg-red-200 rounded-lg font-medium transition-colors"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => openEdit(apt)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => setDeleteId(apt._id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Book/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editApt ? 'Edit Appointment' : 'Book Appointment'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Patient field — admin sees dropdown, patient sees their own name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Patient</label>
            {isAdmin ? (
              <select
                value={form.patient}
                onChange={(e) => setForm({ ...form, patient: e.target.value })}
                className="input-field"
                required
              >
                <option value="">Select patient</option>
                {patients.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} — {p.phone}
                  </option>
                ))}
              </select>
            ) : (
              <div className="input-field bg-gray-50 text-gray-700 flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span className="font-medium">
                  {myPatientProfile ? myPatientProfile.name : (
                    <span className="text-red-500 text-sm">Profile not found — contact admin</span>
                  )}
                </span>
              </div>
            )}
          </div>

          {/* Doctor dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Doctor</label>
            {doctors.length === 0 ? (
              <div className="input-field bg-gray-50 text-gray-400 text-sm">
                No doctors available — admin needs to add doctors first
              </div>
            ) : (
              <select
                value={form.doctor}
                onChange={(e) => setForm({ ...form, doctor: e.target.value })}
                className="input-field"
                required
              >
                <option value="">Select doctor</option>
                {doctors.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name} — {d.specialization}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="input-field"
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
              <input
                type="time"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
                className="input-field"
                required
              />
            </div>
          </div>

          {/* Status — only admin or edit mode */}
          {(isAdmin || editApt) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="input-field"
              >
                <option>Pending</option>
                <option>Confirmed</option>
                <option>Cancelled</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes <span className="text-gray-400">(optional)</span>
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="input-field resize-none"
              rows={3}
              placeholder="Symptoms, reason for visit..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || (!isAdmin && !myPatientProfile) || doctors.length === 0}
              className="btn-primary flex-1"
            >
              {saving ? 'Saving...' : editApt ? 'Update' : 'Book Appointment'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Appointment"
        message="Are you sure you want to delete this appointment?"
      />
    </div>
  );
};

export default Appointments;
