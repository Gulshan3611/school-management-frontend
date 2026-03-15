import { useState, useEffect } from 'react';
import { Calendar, Clock, User, CheckCircle, XCircle, Edit, Trash2, Plus, X, FileText } from 'lucide-react';
import { leavesApi, staffApi } from '../services/api';

export function Leaves() {
  const [activeTab, setActiveTab] = useState('list');
  const [leaves, setLeaves] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [leavesData, staffData, statsData] = await Promise.all([
        leavesApi.getAll(),
        staffApi.getAll(),
        leavesApi.getStats()
      ]);
      setLeaves(leavesData);
      setStaff(staffData);
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
    if (window.confirm('Are you sure you want to delete this leave request?')) {
      try {
        await leavesApi.delete(id);
        setLeaves(leaves.filter(l => l.id !== id));
      } catch (err) {
        alert('Failed to delete leave request');
      }
    }
  };

  const handleApprove = async (id) => {
    try {
      await leavesApi.approve(id, 1);
      loadData();
    } catch (err) {
      alert('Failed to approve leave');
    }
  };

  const handleReject = async (id) => {
    try {
      await leavesApi.reject(id, 1);
      loadData();
    } catch (err) {
      alert('Failed to reject leave');
    }
  };

  const filteredLeaves = leaves.filter(l => {
    if (filterStatus !== 'all' && l.status !== filterStatus) return false;
    return true;
  });

  const getStatusBadge = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getLeaveTypeIcon = (type) => {
    const icons = {
      sick: <FileText className="h-4 w-4" />,
      casual: <Calendar className="h-4 w-4" />,
      earned: <Clock className="h-4 w-4" />,
      maternity: <User className="h-4 w-4" />,
      other: <FileText className="h-4 w-4" />
    };
    return icons[type] || <FileText className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-navy-900">Leave Management</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Manage staff leave requests</p>
        </div>

        <div className="flex bg-slate-200/50 p-1.5 rounded-xl border border-slate-200/50 backdrop-blur-sm">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'list' ? 'bg-white shadow-sm text-navy-900' : 'text-slate-500 hover:text-navy-600'}`}
          >
            All Requests
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'create' ? 'bg-white shadow-sm text-navy-900' : 'text-slate-500 hover:text-navy-600'}`}
          >
            New Request
          </button>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card p-4">
            <div className="text-sm text-slate-500 mb-1">Total Requests</div>
            <div className="text-2xl font-bold text-navy-900">{stats.total || 0}</div>
          </div>
          <div className="card p-4">
            <div className="text-sm text-slate-500 mb-1">Pending</div>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending || 0}</div>
          </div>
          <div className="card p-4">
            <div className="text-sm text-slate-500 mb-1">Approved</div>
            <div className="text-2xl font-bold text-green-600">{stats.approved || 0}</div>
          </div>
          <div className="card p-4">
            <div className="text-sm text-slate-500 mb-1">Rejected</div>
            <div className="text-2xl font-bold text-red-600">{stats.rejected || 0}</div>
          </div>
        </div>
      )}

      {activeTab === 'list' ? (
        <div className="card">
          <div className="p-5 border-b border-slate-100 bg-white flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-navy-600" />
              <h2 className="text-lg font-bold text-navy-900">Leave Requests</h2>
            </div>
            <div className="flex gap-2 ml-auto">
              {['all', 'pending', 'approved', 'rejected'].map(status => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${filterStatus === status ? 'bg-navy-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin h-8 w-8 text-navy-600 border-4 border-navy-200 border-t-transparent rounded-full" />
              <span className="ml-3 text-slate-600">Loading requests...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-600">{error}</div>
          ) : filteredLeaves.length === 0 ? (
            <div className="text-center py-12 text-slate-500">No leave requests found</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredLeaves.map((leave) => (
                <div key={leave.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="h-10 w-10 rounded-full bg-saffron-100 text-saffron-600 flex items-center justify-center font-bold">
                          {leave.staff?.name?.charAt(0) || 'S'}
                        </div>
                        <div>
                          <h3 className="font-semibold text-navy-900">{leave.staff?.name}</h3>
                          <p className="text-sm text-slate-500">{leave.staff?.role}</p>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(leave.status)}`}>
                          {leave.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-600 mb-2">
                        <div className="flex items-center gap-1">
                          {getLeaveTypeIcon(leave.leaveType)}
                          <span className="capitalize">{leave.leaveType} Leave</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(leave.startDate).toLocaleDateString('en-IN')} - {new Date(leave.endDate).toLocaleDateString('en-IN')}
                        </div>
                      </div>
                      <p className="text-slate-600 text-sm">{leave.reason}</p>
                      {leave.status === 'pending' && (
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => handleApprove(leave.id)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4" /> Approve
                          </button>
                          <button
                            onClick={() => handleReject(leave.id)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
                          >
                            <XCircle className="h-4 w-4" /> Reject
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setSelectedLeave(leave); setShowModal(true); }}
                        className="p-2 text-navy-600 hover:bg-navy-50 rounded-lg transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(leave.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <CreateLeaveForm
          staff={staff}
          onSuccess={() => { setActiveTab('list'); loadData(); }}
          onCancel={() => setActiveTab('list')}
        />
      )}

      {showModal && selectedLeave && (
        <EditLeaveModal
          leave={selectedLeave}
          onClose={() => setShowModal(false)}
          onUpdate={() => { setShowModal(false); loadData(); }}
        />
      )}
    </div>
  );
}

function CreateLeaveForm({ staff, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    staffId: '',
    leaveType: 'casual',
    startDate: '',
    endDate: '',
    reason: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.staffId || !formData.startDate || !formData.endDate || !formData.reason) {
      setError('Please fill all required fields');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await leavesApi.create({
        ...formData,
        staffId: parseInt(formData.staffId)
      });
      onSuccess();
    } catch (err) {
      setError('Failed to create leave request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card">
      <div className="p-6 border-b border-slate-100">
        <h2 className="text-xl font-display font-bold text-navy-900">New Leave Request</h2>
        <p className="text-sm text-slate-500 mt-1">Submit a leave application</p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Staff Member *</label>
          <select
            value={formData.staffId}
            onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white"
            required
          >
            <option value="">Select Staff</option>
            {staff.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Leave Type *</label>
          <select
            value={formData.leaveType}
            onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white"
          >
            <option value="casual">Casual Leave</option>
            <option value="sick">Sick Leave</option>
            <option value="earned">Earned Leave</option>
            <option value="maternity">Maternity Leave</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Start Date *</label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">End Date *</label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Reason *</label>
          <textarea
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-md"
            rows="4"
            placeholder="Enter reason for leave..."
            required
          />
        </div>

        <div className="flex justify-end pt-6 border-t border-slate-100 gap-3">
          <button type="button" onClick={onCancel} className="btn btn-outline">
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="btn btn-accent">
            {submitting ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      </form>
    </div>
  );
}

function EditLeaveModal({ leave, onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    staffId: leave.staffId,
    leaveType: leave.leaveType,
    startDate: leave.startDate,
    endDate: leave.endDate,
    reason: leave.reason
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await leavesApi.update(leave.id, formData);
      onUpdate();
    } catch (err) {
      alert('Failed to update leave request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-slate-400 hover:text-slate-600">
          <X className="h-5 w-5" />
        </button>

        <div className="p-6 border-b border-slate-100">
          <h2 className="text-xl font-display font-bold text-navy-900">Edit Leave Request</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Leave Type</label>
            <select
              value={formData.leaveType}
              onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white"
            >
              <option value="casual">Casual Leave</option>
              <option value="sick">Sick Leave</option>
              <option value="earned">Earned Leave</option>
              <option value="maternity">Maternity Leave</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Reason</label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md"
              rows="4"
            />
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
