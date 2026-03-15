import { useState, useEffect } from 'react';
import { BookOpen, Calendar, TrendingUp, Edit, Trash2, Plus, X } from 'lucide-react';
import { syllabusApi, classesApi } from '../services/api';

export function Syllabus() {
  const [activeTab, setActiveTab] = useState('list');
  const [syllabus, setSyllabus] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [syllabusData, classesData] = await Promise.all([
        syllabusApi.getAll(),
        classesApi.getAll()
      ]);
      setSyllabus(syllabusData);
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
    if (window.confirm('Are you sure you want to delete this topic?')) {
      try {
        await syllabusApi.delete(id);
        setSyllabus(syllabus.filter(s => s.id !== id));
      } catch (err) {
        alert('Failed to delete topic');
      }
    }
  };

  const filteredSyllabus = syllabus.filter(s => {
    if (selectedClass && s.classId !== parseInt(selectedClass)) return false;
    if (selectedSection && s.sectionId !== parseInt(selectedSection)) return false;
    return true;
  });

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-navy-900">Syllabus Tracker</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Track chapter coverage and progress</p>
        </div>

        <div className="flex bg-slate-200/50 p-1.5 rounded-xl border border-slate-200/50 backdrop-blur-sm">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'list' ? 'bg-white shadow-sm text-navy-900' : 'text-slate-500 hover:text-navy-600'}`}
          >
            All Topics
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'create' ? 'bg-white shadow-sm text-navy-900' : 'text-slate-500 hover:text-navy-600'}`}
          >
            Add Topic
          </button>
        </div>
      </div>

      {activeTab === 'list' ? (
        <>
          <div className="card mb-6">
            <div className="p-5 border-b border-slate-100 bg-white flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-navy-600" />
                <h2 className="text-lg font-bold text-navy-900">Syllabus Topics</h2>
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
                <span className="ml-3 text-slate-600">Loading syllabus...</span>
              </div>
            ) : error ? (
              <div className="text-center py-12 text-red-600">{error}</div>
            ) : filteredSyllabus.length === 0 ? (
              <div className="text-center py-12 text-slate-500">No syllabus topics found</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredSyllabus.map((topic) => (
                  <div key={topic.id} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-semibold text-navy-900">{topic.subject}</span>
                          <span className="text-xs text-slate-500">{topic.class?.name} - {topic.section?.name}</span>
                        </div>
                        <h3 className="font-medium text-slate-800 mb-1">{topic.chapter}</h3>
                        {topic.description && (
                          <p className="text-slate-600 text-sm mb-2">{topic.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-slate-500 mb-2">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {topic.startDate ? new Date(topic.startDate).toLocaleDateString('en-IN') : '-'} to {topic.endDate ? new Date(topic.endDate).toLocaleDateString('en-IN') : '-'}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-slate-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${getProgressColor(topic.progress)}`}
                              style={{ width: `${topic.progress}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-slate-700">{topic.progress}%</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setSelectedTopic(topic); setShowModal(true); }}
                          className="p-2 text-navy-600 hover:bg-navy-50 rounded-lg transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(topic.id)}
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
        </>
      ) : (
        <CreateSyllabusForm
          classes={classes}
          onSuccess={() => { setActiveTab('list'); loadData(); }}
          onCancel={() => setActiveTab('list')}
        />
      )}

      {showModal && selectedTopic && (
        <EditSyllabusModal
          topic={selectedTopic}
          classes={classes}
          onClose={() => setShowModal(false)}
          onUpdate={() => { setShowModal(false); loadData(); }}
        />
      )}
    </div>
  );
}

function CreateSyllabusForm({ classes, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    classId: '',
    sectionId: '',
    subject: '',
    chapter: '',
    description: '',
    progress: 0,
    startDate: '',
    endDate: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.classId || !formData.sectionId || !formData.subject || !formData.chapter) {
      setError('Please fill all required fields');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await syllabusApi.create({
        ...formData,
        classId: parseInt(formData.classId),
        sectionId: parseInt(formData.sectionId),
        progress: parseInt(formData.progress)
      });
      onSuccess();
    } catch (err) {
      setError('Failed to add topic. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedClass = classes.find(c => c.id === parseInt(formData.classId));

  return (
    <div className="card">
      <div className="p-6 border-b border-slate-100">
        <h2 className="text-xl font-display font-bold text-navy-900">Add Syllabus Topic</h2>
        <p className="text-sm text-slate-500 mt-1">Track a new chapter or topic</p>
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
            <label className="block text-sm font-medium text-slate-700 mb-1">Progress (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.progress}
              onChange={(e) => setFormData({ ...formData, progress: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md"
            />
          </div>

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
          <label className="block text-sm font-medium text-slate-700 mb-1">Chapter *</label>
          <input
            type="text"
            value={formData.chapter}
            onChange={(e) => setFormData({ ...formData, chapter: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-md"
            placeholder="e.g. Real Numbers"
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
            placeholder="Describe the topic..."
          />
        </div>

        <div className="flex justify-end pt-6 border-t border-slate-100 gap-3">
          <button type="button" onClick={onCancel} className="btn btn-outline">
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="btn btn-accent">
            {submitting ? 'Adding...' : 'Add Topic'}
          </button>
        </div>
      </form>
    </div>
  );
}

function EditSyllabusModal({ topic, classes, onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    classId: topic.classId,
    sectionId: topic.sectionId,
    subject: topic.subject,
    chapter: topic.chapter,
    description: topic.description || '',
    progress: topic.progress,
    startDate: topic.startDate,
    endDate: topic.endDate
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await syllabusApi.update(topic.id, formData);
      onUpdate();
    } catch (err) {
      alert('Failed to update topic');
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
          <h2 className="text-xl font-display font-bold text-navy-900">Edit Topic</h2>
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
              <label className="block text-sm font-medium text-slate-700 mb-1">Progress (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.progress}
                onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md"
              />
            </div>
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
            <label className="block text-sm font-medium text-slate-700 mb-1">Chapter</label>
            <input
              type="text"
              value={formData.chapter}
              onChange={(e) => setFormData({ ...formData, chapter: e.target.value })}
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
