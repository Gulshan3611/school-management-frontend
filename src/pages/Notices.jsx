import { useState, useEffect } from 'react';
import { Plus, Bell, AlertCircle, Info, Calendar, User, X, Edit, Trash2 } from 'lucide-react';
import { noticesApi } from '../services/api';

export function Notices() {
  const [activeTab, setActiveTab] = useState('list');
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadNotices();
  }, []);

  const loadNotices = async () => {
    try {
      setLoading(true);
      const data = await noticesApi.getAll();
      setNotices(data);
      setError(null);
    } catch (err) {
      setError('Failed to load notices. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this notice?')) {
      try {
        await noticesApi.delete(id);
        setNotices(notices.filter(n => n.id !== id));
      } catch (err) {
        alert('Failed to delete notice');
      }
    }
  };

  const getTargetAudienceBadge = (audience) => {
    const colors = {
      all: 'bg-blue-100 text-blue-800',
      students: 'bg-green-100 text-green-800',
      staff: 'bg-purple-100 text-purple-800',
      parents: 'bg-orange-100 text-orange-800'
    };
    return colors[audience] || 'bg-gray-100 text-gray-800';
  };

  const getIcon = (urgent) => {
    if (urgent) return <AlertCircle className="h-5 w-5 text-red-500" />;
    return <Info className="h-5 w-5 text-blue-500" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-navy-900">Notices & Announcements</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Manage school notices and urgent announcements</p>
        </div>

        <div className="flex bg-slate-200/50 p-1.5 rounded-xl border border-slate-200/50 backdrop-blur-sm">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'list' ? 'bg-white shadow-sm text-navy-900' : 'text-slate-500 hover:text-navy-600'}`}
          >
            All Notices
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'create' ? 'bg-white shadow-sm text-navy-900' : 'text-slate-500 hover:text-navy-600'}`}
          >
            New Notice
          </button>
        </div>
      </div>

      {activeTab === 'list' ? (
        <div className="card">
          <div className="p-5 border-b border-slate-100 bg-white">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-navy-600" />
              <h2 className="text-lg font-bold text-navy-900">Notice Board</h2>
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin h-8 w-8 text-navy-600 border-4 border-navy-200 border-t-transparent rounded-full" />
                <span className="ml-3 text-slate-600">Loading notices...</span>
              </div>
            ) : error ? (
              <div className="text-center py-12 text-red-600">{error}</div>
            ) : notices.length === 0 ? (
              <div className="text-center py-12 text-slate-500">No notices found</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {notices.map((notice) => (
                  <div key={notice.id} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">
                        {getIcon(notice.isUrgent)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-semibold text-navy-900">{notice.title}</h3>
                            <p className="text-slate-600 mt-1 text-sm">{notice.description}</p>
                            <div className="flex items-center gap-4 mt-3">
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getTargetAudienceBadge(notice.targetAudience)}`}>
                                {notice.targetAudience}
                              </span>
                              <div className="flex items-center text-xs text-slate-500">
                                <Calendar className="h-3.5 w-3.5 mr-1" />
                                {new Date(notice.date).toLocaleDateString('en-IN')}
                              </div>
                              {notice.postedBy && (
                                <div className="flex items-center text-xs text-slate-500">
                                  <User className="h-3.5 w-3.5 mr-1" />
                                  Posted by Admin
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setSelectedNotice(notice);
                                setShowModal(true);
                              }}
                              className="p-2 text-navy-600 hover:bg-navy-50 rounded-lg transition-colors"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(notice.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <CreateNoticeForm onSuccess={() => { setActiveTab('list'); loadNotices(); }} onCancel={() => setActiveTab('list')} />
      )}

      {showModal && selectedNotice && (
        <EditNoticeModal
          notice={selectedNotice}
          onClose={() => setShowModal(false)}
          onUpdate={() => { setShowModal(false); loadNotices(); }}
        />
      )}
    </div>
  );
}

function CreateNoticeForm({ onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetAudience: 'all',
    isUrgent: false,
    postedBy: 1
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      setError('Please fill all required fields');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await noticesApi.create({ ...formData, date: new Date().toISOString() });
      onSuccess();
    } catch (err) {
      setError('Failed to create notice. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card">
      <div className="p-6 border-b border-slate-100">
        <h2 className="text-xl font-display font-bold text-navy-900">Create New Notice</h2>
        <p className="text-sm text-slate-500 mt-1">Publish announcements for students, staff, or parents</p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500"
            placeholder="e.g. Annual Sports Day"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Description *</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500"
            rows="4"
            placeholder="Enter notice details..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Target Audience *</label>
          <select
            value={formData.targetAudience}
            onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500 bg-white"
          >
            <option value="all">All</option>
            <option value="students">Students</option>
            <option value="staff">Staff</option>
            <option value="parents">Parents</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isUrgent"
            checked={formData.isUrgent}
            onChange={(e) => setFormData({ ...formData, isUrgent: e.target.checked })}
            className="h-4 w-4 text-saffron-500 focus:ring-saffron-500 border-slate-300 rounded"
          />
          <label htmlFor="isUrgent" className="text-sm font-medium text-slate-700">Mark as Urgent</label>
        </div>

        <div className="flex justify-end pt-6 border-t border-slate-100 gap-3">
          <button type="button" onClick={onCancel} className="btn btn-outline">
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="btn btn-accent">
            {submitting ? 'Publishing...' : 'Publish Notice'}
          </button>
        </div>
      </form>
    </div>
  );
}

function EditNoticeModal({ notice, onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    title: notice.title,
    description: notice.description,
    targetAudience: notice.targetAudience,
    isUrgent: notice.isUrgent
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await noticesApi.update(notice.id, formData);
      onUpdate();
    } catch (err) {
      alert('Failed to update notice');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-slate-400 hover:text-slate-600"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-6 border-b border-slate-100">
          <h2 className="text-xl font-display font-bold text-navy-900">Edit Notice</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md"
              rows="4"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Target Audience</label>
            <select
              value={formData.targetAudience}
              onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white"
            >
              <option value="all">All</option>
              <option value="students">Students</option>
              <option value="staff">Staff</option>
              <option value="parents">Parents</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="editIsUrgent"
              checked={formData.isUrgent}
              onChange={(e) => setFormData({ ...formData, isUrgent: e.target.checked })}
              className="h-4 w-4 text-saffron-500 focus:ring-saffron-500 border-slate-300 rounded"
            />
            <label htmlFor="editIsUrgent" className="text-sm font-medium text-slate-700">Mark as Urgent</label>
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
