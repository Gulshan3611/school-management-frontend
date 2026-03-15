import { useState, useEffect } from 'react';
import { BusFront, MapPin, User, IndianRupee, Edit, Trash2, Plus, X, TrendingUp } from 'lucide-react';
import { transportAllocationApi, transportApi, studentsApi } from '../services/api';

export function TransportAllocation() {
  const [activeTab, setActiveTab] = useState('list');
  const [allocations, setAllocations] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedAllocation, setSelectedAllocation] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [allocData, vehiclesData, studentsData, statsData] = await Promise.all([
        transportAllocationApi.getAll(),
        transportApi.getAll(),
        studentsApi.getAll(),
        transportAllocationApi.getStats()
      ]);
      setAllocations(allocData);
      setVehicles(vehiclesData);
      setStudents(studentsData);
      setStats(statsData);
      setError(null);
    } catch (err) {
      setError('Failed to load data. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this allocation?')) {
      try {
        await transportAllocationApi.delete(id);
        setAllocations(allocations.filter(a => a.id !== id));
      } catch (err) {
        alert('Failed to delete allocation');
      }
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-slate-100 text-slate-800',
      pending: 'bg-yellow-100 text-yellow-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-navy-900">Transport Allocation</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Manage student transport assignments</p>
        </div>

        <div className="flex bg-slate-200/50 p-1.5 rounded-xl border border-slate-200/50 backdrop-blur-sm">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'list' ? 'bg-white shadow-sm text-navy-900' : 'text-slate-500 hover:text-navy-600'}`}
          >
            All Allocations
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'create' ? 'bg-white shadow-sm text-navy-900' : 'text-slate-500 hover:text-navy-600'}`}
          >
            New Allocation
          </button>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card p-4">
            <div className="text-sm text-slate-500 mb-1">Total Allocations</div>
            <div className="text-2xl font-bold text-navy-900">{stats.total || 0}</div>
          </div>
          <div className="card p-4">
            <div className="text-sm text-slate-500 mb-1">Active</div>
            <div className="text-2xl font-bold text-green-600">{stats.active || 0}</div>
          </div>
          <div className="card p-4">
            <div className="text-sm text-slate-500 mb-1">Vehicles Used</div>
            <div className="text-2xl font-bold text-blue-600">{stats.vehiclesUsed || 0}</div>
          </div>
          <div className="card p-4">
            <div className="text-sm text-slate-500 mb-1">Monthly Revenue</div>
            <div className="text-2xl font-bold text-saffron-600">₹{stats.monthlyRevenue || 0}</div>
          </div>
        </div>
      )}

      {activeTab === 'list' ? (
        <div className="card">
          <div className="p-5 border-b border-slate-100 bg-white flex items-center gap-2">
            <BusFront className="h-5 w-5 text-navy-600" />
            <h2 className="text-lg font-bold text-navy-900">Transport Allocations</h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin h-8 w-8 text-navy-600 border-4 border-navy-200 border-t-transparent rounded-full" />
              <span className="ml-3 text-slate-600">Loading allocations...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-600">{error}</div>
          ) : allocations.length === 0 ? (
            <div className="text-center py-12 text-slate-500">No transport allocations found</div>
          ) : (
            <div className="overflow-x-auto">
              <table>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Vehicle</th>
                    <th>Pickup Point</th>
                    <th>Drop Point</th>
                    <th>Monthly Fee</th>
                    <th>Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allocations.map((allocation) => (
                    <tr key={allocation.id}>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-saffron-100 text-saffron-600 flex items-center justify-center text-xs font-bold">
                            {allocation.student?.name?.charAt(0) || 'S'}
                          </div>
                          <span className="font-medium">{allocation.student?.name}</span>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <BusFront className="h-4 w-4 text-slate-400" />
                          <span>{allocation.vehicle?.vehicleNo}</span>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin className="h-3.5 w-3.5 text-slate-400" />
                          {allocation.pickupPoint}
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin className="h-3.5 w-3.5 text-slate-400" />
                          {allocation.dropPoint}
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-1 text-sm font-medium">
                          <IndianRupee className="h-3.5 w-3.5 text-slate-400" />
                          {allocation.monthlyFee}
                        </div>
                      </td>
                      <td>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(allocation.status)}`}>
                          {allocation.status}
                        </span>
                      </td>
                      <td className="text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => { setSelectedAllocation(allocation); setShowModal(true); }}
                            className="p-2 text-navy-600 hover:bg-navy-50 rounded-lg transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(allocation.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <CreateAllocationForm
          vehicles={vehicles}
          students={students}
          onSuccess={() => { setActiveTab('list'); loadData(); }}
          onCancel={() => setActiveTab('list')}
        />
      )}

      {showModal && selectedAllocation && (
        <EditAllocationModal
          allocation={selectedAllocation}
          vehicles={vehicles}
          students={students}
          onClose={() => setShowModal(false)}
          onUpdate={() => { setShowModal(false); loadData(); }}
        />
      )}
    </div>
  );
}

function CreateAllocationForm({ vehicles, students, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    studentId: '',
    vehicleId: '',
    pickupPoint: '',
    dropPoint: '',
    monthlyFee: '',
    status: 'active'
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.studentId || !formData.vehicleId || !formData.pickupPoint || !formData.dropPoint) {
      setError('Please fill all required fields');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await transportAllocationApi.create({
        ...formData,
        studentId: parseInt(formData.studentId),
        vehicleId: parseInt(formData.vehicleId),
        monthlyFee: parseFloat(formData.monthlyFee)
      });
      onSuccess();
    } catch (err) {
      setError('Failed to create allocation. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card">
      <div className="p-6 border-b border-slate-100">
        <h2 className="text-xl font-display font-bold text-navy-900">New Transport Allocation</h2>
        <p className="text-sm text-slate-500 mt-1">Assign transport to a student</p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Student *</label>
            <select
              value={formData.studentId}
              onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white"
              required
            >
              <option value="">Select Student</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.name} (Class {s.class?.name})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Vehicle *</label>
            <select
              value={formData.vehicleId}
              onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white"
              required
            >
              <option value="">Select Vehicle</option>
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>{v.vehicleNo} - {v.route}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Pickup Point *</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                value={formData.pickupPoint}
                onChange={(e) => setFormData({ ...formData, pickupPoint: e.target.value })}
                className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md"
                placeholder="Enter pickup location"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Drop Point *</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                value={formData.dropPoint}
                onChange={(e) => setFormData({ ...formData, dropPoint: e.target.value })}
                className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md"
                placeholder="Enter drop location"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Monthly Fee (₹) *</label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="number"
                value={formData.monthlyFee}
                onChange={(e) => setFormData({ ...formData, monthlyFee: e.target.value })}
                className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md"
                placeholder="0"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-6 border-t border-slate-100 gap-3">
          <button type="button" onClick={onCancel} className="btn btn-outline">
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="btn btn-accent">
            {submitting ? 'Creating...' : 'Create Allocation'}
          </button>
        </div>
      </form>
    </div>
  );
}

function EditAllocationModal({ allocation, vehicles, students, onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    studentId: allocation.studentId,
    vehicleId: allocation.vehicleId,
    pickupPoint: allocation.pickupPoint,
    dropPoint: allocation.dropPoint,
    monthlyFee: allocation.monthlyFee,
    status: allocation.status
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await transportAllocationApi.update(allocation.id, formData);
      onUpdate();
    } catch (err) {
      alert('Failed to update allocation');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-slate-400 hover:text-slate-600">
          <X className="h-5 w-5" />
        </button>

        <div className="p-6 border-b border-slate-100">
          <h2 className="text-xl font-display font-bold text-navy-900">Edit Allocation</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Student</label>
              <select
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white"
              >
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.name} (Class {s.class?.name})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Vehicle</label>
              <select
                value={formData.vehicleId}
                onChange={(e) => setFormData({ ...formData, vehicleId: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white"
              >
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>{v.vehicleNo} - {v.route}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Pickup Point</label>
              <input
                type="text"
                value={formData.pickupPoint}
                onChange={(e) => setFormData({ ...formData, pickupPoint: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Drop Point</label>
              <input
                type="text"
                value={formData.dropPoint}
                onChange={(e) => setFormData({ ...formData, dropPoint: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Monthly Fee</label>
              <input
                type="number"
                value={formData.monthlyFee}
                onChange={(e) => setFormData({ ...formData, monthlyFee: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="btn btn-outline">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-accent">
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
