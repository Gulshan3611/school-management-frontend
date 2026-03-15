import { useState, useEffect } from 'react';
import { BookOpen, Calendar, Clock, Edit, Trash2, Plus, X, Filter } from 'lucide-react';
import { homeworkApi, classesApi } from '../services/api';

export function Homework() {
  const [activeTab, setActiveTab] = useState('list');
  const [homework, setHomework] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedHomework, setSelectedHomework] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [hwData, classesData] = await Promise.all([
        homeworkApi.getAll(),
        classesApi.getAll()
      ]);
      setHomework(hwData);
      setClasses(classesData);
      setError(null);
    } catch (err) {
      setError('Failed to load data. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this homework?')) {
      try {
        await homeworkApi.delete(id);
        setHomework(homework.filter(h => h.id !== id));
      } catch (err) {
        alert('Failed to delete homework');
      }
    }
  };

  const filteredHomework = homework.filter(h => {
    if (selectedClass && h.classId !== parseInt(selectedClass)) return false;
    if (selectedSection && h.sectionId !== parseInt(selectedSection)) return false;
    return true;
  });

  const getStatusBadge = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      overdue: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-navy-900">Homework Assignments</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Manage and track homework assignments</p>
        </div>

        <div className="flex bg-slate-200/50 p-1.5 rounded-xl border border-slate-200/50 backdrop-blur-sm">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'list' ? 'bg-white shadow-sm text-navy-900' : 'text-slate-500 hover:text-navy-600'}`}
          >
            All Homework
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'create' ? 'bg-white shadow-sm text-navy-900' : 'text-slate-500 hover:text-navy-600'}`}
          >
            Assign Homework
          </button>
        </div>
      </div>

      {activeTab === 'list' ? (
        <div className="card">
          <div className="p-5 border-b border-slate-100 bg-white flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-navy-600" />
              <h2 className="text-lg font-bold text-navy-900">Homework List</h2>
            </div>
            <div className="flex gap-3 ml-auto">
              <select
                value={selectedClass}
                onChange={(e) => { setSelectedClass(e.target.value); setSelectedSection(''); }}
                className="!py-2 !px-4 !rounded-xl !bg-slate-50 !border-slate-200 !w-auto"
              >
                <option value="">All Classes</option>
                {classes.map(cls => (
                  <option key={cls.id} value={cls.id}>{cls.name}</option>
                ))}
              </select>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="!py-2 !px-4 !rounded-xl !bg-slate-50 !border-slate-200 !w-auto"
                disabled={!selectedClass}
              >
                <option value="">All Sections</option>
                {selectedClass && classes.find(c => c.id === parseInt(selectedClass))?.sections.map(sec => (
                  <option key={sec.id} value={sec.id}>{sec.name}</option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin h-8 w-8 text-navy-600 border-4 border-navy-200 border-t-transparent rounded-full" />
              <span className="ml-3 text-slate-600">Loading homework...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-600">{error}</div>
          ) : filteredHomework.length === 0 ? (
            <div className="text-center py-12 text-slate-500">No homework assignments found</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredHomework.map((hw) => (
                <div key={hw.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-semibold text-navy-900">{hw.subject}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(hw.status || 'active')}`}>
                          {hw.status || 'active'}
                        </span>
                      </div>
                      <h3 className="font-medium text-slate-800 mb-1">{hw.title}</h3>
                      <p className="text-slate-600 text-sm mb-2">{hw.description}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          Due: {new Date(hw.dueDate).toLocaleDateString('en-IN')}
                        </div>
                        <div className="flex items-center gap-1">
                          <BookOpen className="h-3.5 w-3.5" />
                          {hw.class?.name} - {hw.section?.name}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setSelectedHomework(hw); setShowModal(true); }}
                        className="p-2 text-navy-600 hover:bg-navy-50 rounded-lg transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(hw.id)}
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
        <CreateHomeworkForm
          classes={classes}
          onSuccess={() => { setActiveTab('list'); loadData(); }}
          onCancel={() => setActiveTab('list')}
        />
      )}

      {showModal && selectedHomework && (
        <EditHomeworkModal
          homework={selectedHomework}
          classes={classes}
          onClose={() => setShowModal(false)}
          onUpdate={() => { setShowModal(false); loadData(); }}
        />
      )}
    </div>
  );
}

function CreateHomeworkForm({ classes, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    classId: '',
    sectionId: '',
    subject: '',
    title: '',
    description: '',
    dueDate: '',
    assignedBy: 1,
    status: 'active'
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.classId || !formData.sectionId || !formData.subject || !formData.title) {
      setError('Please fill all required fields');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await homeworkApi.create({
        ...formData,
        classId: parseInt(formData.classId),
        sectionId: parseInt(formData.sectionId)
      });
      onSuccess();
    } catch (err) {
      setError('Failed to assign homework. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedClass = classes.find(c => c.id === parseInt(formData.classId));

  return (
    <div className="card">
      <div className="p-6 border-b border-slate-100">
        <h2 className="text-xl font-display font-bold text-navy-900">Assign Homework</h2>
        <p className="text-sm text-slate-500 mt-1">Create a new homework assignment</p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Class *</label>
            <select
              value={formData.classId}
              onChange={(e) => setFormData({ ...formData, classId: e.target.value, sectionId: '' })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white"
              required
            >
              <option value="">Select Class</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Section *</label>
            <select
              value={formData.sectionId}
              onChange={(e) => setFormData({ ...formData, sectionId: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white"
              disabled={!formData.classId}
              required
            >
              <option value="">Select Section</option>
              {selectedClass?.sections.map(sec => (
                <option key={sec.id} value={sec.id}>{sec.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Subject *</label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md"
              placeholder="e.g. Mathematics"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Due Date *</label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-md"
            placeholder="e.g. Quadratic Equations"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Description *</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-md"
            rows="4"
            placeholder="Describe the homework assignment..."
            required
          />
        </div>

        <div className="flex justify-end pt-6 border-t border-slate-100 gap-3">
          <button type="button" onClick={onCancel} className="btn btn-outline">
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="btn btn-accent">
            {submitting ? 'Assigning...' : 'Assign Homework'}
          </button>
        </div>
      </form>
    </div>
  );
}

function EditHomeworkModal({ homework, classes, onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    classId: homework.classId,
    sectionId: homework.sectionId,
    subject: homework.subject,
    title: homework.title,
    description: homework.description,
    dueDate: homework.dueDate,
    status: homework.status || 'active'
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await homeworkApi.update(homework.id, formData);
      onUpdate();
    } catch (err) {
      alert('Failed to update homework');
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
          <h2 className="text-xl font-display font-bold text-navy-900">Edit Homework</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Class</label>
              <select
                value={formData.classId}
                onChange={(e) => setFormData({ ...formData, classId: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white"
              >
                {classes.map(cls => (
                  <option key={cls.id} value={cls.id}>{cls.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Section</label>
              <select
                value={formData.sectionId}
                onChange={(e) => setFormData({ ...formData, sectionId: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white"
              >
                {classes.find(c => c.id === formData.classId)?.sections.map(sec => (
                  <option key={sec.id} value={sec.id}>{sec.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md"
              rows="4"
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
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
            </select>
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
