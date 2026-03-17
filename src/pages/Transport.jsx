import { useState, useEffect } from 'react';
import { BusIcon, MapPin, Users, Plus, Edit2, Trash2, X } from 'lucide-react';
import { transportApi } from '../services/api';

export function Transport() {
  const [activeTab, setActiveTab] = useState('routes');
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState(null);

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const data = await transportApi.getAll();
      setVehicles(data);
    } catch (error) {
      console.error('Failed to load vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setShowModal(true);
  };

  const handleDeleteClick = (vehicle) => {
    setVehicleToDelete(vehicle);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await transportApi.delete(vehicleToDelete.id);
      setVehicles(vehicles.filter(v => v.id !== vehicleToDelete.id));
      setShowDeleteConfirm(false);
      setVehicleToDelete(null);
      alert('Vehicle deleted successfully!');
    } catch (error) {
      alert('Failed to delete vehicle');
    }
  };

  const handleVehicleSuccess = () => {
    setShowModal(false);
    setEditingVehicle(null);
    loadVehicles();
    alert(editingVehicle ? 'Vehicle updated successfully!' : 'Vehicle added successfully!');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Transport & Fleet Management</h1>
          <p className="text-sm text-slate-500 font-medium">Manage bus routes, tracking, and student assignments</p>
        </div>
        <div className="flex bg-slate-200/50 p-1.5 rounded-xl border border-slate-200/50 backdrop-blur-sm">
          <button 
            onClick={() => setActiveTab('routes')} 
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center ${activeTab === 'routes' ? 'bg-white shadow-sm text-navy-800' : 'text-slate-500 hover:text-navy-600'}`}
          >
            <MapPin className="h-4 w-4 mr-2" /> Route Management
          </button>
          <button 
            onClick={() => setActiveTab('allocation')} 
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center ${activeTab === 'allocation' ? 'bg-white shadow-sm text-navy-800' : 'text-slate-500 hover:text-navy-600'}`}
          >
            <Users className="h-4 w-4 mr-2" /> Student Allocation
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex items-center">
          <div className="h-12 w-12 rounded-full flex items-center justify-center bg-blue-100 text-blue-600 mr-4">
            <BusIcon className="h-6 w-6" />
          </div>
          <div>
            <div className="text-sm font-medium text-slate-500">Total Buses</div>
            <div className="text-xl font-bold text-navy-900">{vehicles.length} Active</div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex items-center">
          <div className="h-12 w-12 rounded-full flex items-center justify-center bg-green-100 text-green-600 mr-4">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <div className="text-sm font-medium text-slate-500">Total Capacity</div>
            <div className="text-xl font-bold text-navy-900">{vehicles.reduce((sum, v) => sum + v.capacity, 0)} seats</div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex items-center">
          <div className="h-12 w-12 rounded-full flex items-center justify-center bg-amber-100 text-amber-600 mr-4">
            <BusIcon className="h-6 w-6" />
          </div>
          <div>
            <div className="text-sm font-medium text-slate-500">Routes</div>
            <div className="text-xl font-bold text-navy-900">{vehicles.length} Routes</div>
          </div>
        </div>
      </div>

      {activeTab === 'routes' && (
        <RouteManagement 
          vehicles={vehicles} 
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          onAddNew={() => {
            setEditingVehicle(null);
            setShowModal(true);
          }}
        />
      )}
      {activeTab === 'allocation' && <StudentAllocation />}

      {/* Vehicle Form Modal */}
      {showModal && (
        <VehicleForm
          vehicle={editingVehicle}
          onClose={() => {
            setShowModal(false);
            setEditingVehicle(null);
          }}
          onSuccess={handleVehicleSuccess}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-bold text-navy-900 mb-2">Delete Vehicle</h3>
              <p className="text-slate-600 mb-6">
                Are you sure you want to delete vehicle "{vehicleToDelete?.vehicleNo}"? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setVehicleToDelete(null);
                  }}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RouteManagement({ vehicles, loading, onEdit, onDelete, onAddNew }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
        <h2 className="text-lg font-bold text-navy-800">Active Routes</h2>
        <button 
          className="flex items-center px-4 py-2 bg-navy-800 text-white rounded-lg text-sm font-medium hover:bg-navy-900 transition-colors shadow-sm"
          onClick={onAddNew}
        >
          <Plus className="h-4 w-4 mr-2" /> Add New Route
        </button>
      </div>
      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="h-8 w-8 animate-spin text-navy-600" />
          </div>
        ) : vehicles.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <BusIcon className="h-16 w-16 mx-auto mb-4 text-slate-300" />
            <p>No vehicles found</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Vehicle No</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Route</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Capacity</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {vehicles.map((vehicle) => (
                <tr key={vehicle.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4">
                    <span className="inline-block px-2 py-1 bg-amber-100 border border-amber-300 rounded font-bold text-amber-900 text-xs uppercase tracking-widest">
                      {vehicle.vehicleNo}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="text-sm font-bold text-navy-900">{vehicle.route}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm font-medium text-slate-600">{vehicle.capacity} seats</div>
                  </td>
                  <td className="p-4 text-sm text-right">
                    <button 
                      onClick={() => onEdit(vehicle)}
                      className="text-blue-600 hover:text-blue-800 font-medium mr-3 text-xs inline-flex items-center"
                    >
                      <Edit2 className="h-3.5 w-3.5 mr-1" /> Edit
                    </button>
                    <button 
                      onClick={() => onDelete(vehicle)}
                      className="text-red-600 hover:text-red-800 font-medium text-xs inline-flex items-center"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function VehicleForm({ vehicle, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    vehicleNo: vehicle?.vehicleNo || '',
    route: vehicle?.route || '',
    capacity: vehicle?.capacity || ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.vehicleNo || !formData.route || !formData.capacity) {
      setError('Please fill all required fields');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      if (vehicle) {
        await transportApi.update(vehicle.id, {
          ...formData,
          capacity: parseInt(formData.capacity)
        });
      } else {
        await transportApi.create({
          ...formData,
          capacity: parseInt(formData.capacity)
        });
      }
      onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to save vehicle');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 z-10"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-6 border-b border-slate-100">
          <h2 className="text-xl font-display font-bold text-navy-900">
            {vehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Vehicle Number *
            </label>
            <input
              type="text"
              value={formData.vehicleNo}
              onChange={(e) => setFormData({...formData, vehicleNo: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500"
              placeholder="e.g. DL 1P C001"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Route Description *
            </label>
            <textarea
              value={formData.route}
              onChange={(e) => setFormData({...formData, route: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500"
              rows="3"
              placeholder="e.g. Dwarka Sector 14 to School via Sector 10"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Seating Capacity *
            </label>
            <input
              type="number"
              value={formData.capacity}
              onChange={(e) => setFormData({...formData, capacity: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500"
              placeholder="e.g. 35"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={onClose} className="btn btn-outline">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-accent">
              {submitting ? 'Saving...' : (vehicle ? 'Update Vehicle' : 'Add Vehicle')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function StudentAllocation() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col items-center justify-center text-center min-h-[300px]">
      <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-500 mb-4">
        <Users className="h-8 w-8" />
      </div>
      <h2 className="text-xl font-bold text-navy-900 mb-2">Student Allocation Planner</h2>
      <p className="text-slate-500 max-w-md mb-6">
        Assign students to specific routes and stops during admission.
      </p>
      <button className="px-6 py-2 bg-navy-800 text-white font-medium rounded-lg text-sm hover:bg-navy-900 transition-colors shadow-sm">
        View Enrolled Students
      </button>
    </div>
  );
}

// Loader component
function Loader({ className }) {
  return (
    <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );
}
