import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User, BookOpen, Plus, Edit, Trash2, X } from 'lucide-react';
import { timetableApi, classesApi } from '../services/api';

export function Timetable() {
  const [activeTab, setActiveTab] = useState('view');
  const [timetables, setTimetables] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedTimetable, setSelectedTimetable] = useState(null);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [timetableData, classesData] = await Promise.all([
        timetableApi.getAll(),
        classesApi.getAll()
      ]);
      setTimetables(timetableData);
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
    if (window.confirm('Are you sure you want to delete this timetable entry?')) {
      try {
        await timetableApi.delete(id);
        setTimetables(timetables.filter(t => t.id !== id));
      } catch (err) {
        alert('Failed to delete timetable entry');
      }
    }
  };

  const filteredTimetables = timetables.filter(t => {
    if (selectedClass && t.classId !== parseInt(selectedClass)) return false;
    if (selectedSection && t.sectionId !== parseInt(selectedSection)) return false;
    return true;
  });

  const groupedByDay = days.map(day => ({
    day,
    periods: filteredTimetables
      .filter(t => t.dayOfWeek === days.indexOf(day) + 1)
      .sort((a, b) => a.periodNumber - b.periodNumber)
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-navy-900">Class Timetable</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Manage class schedules and period timings</p>
        </div>

        <div className="flex bg-slate-200/50 p-1.5 rounded-xl border border-slate-200/50 backdrop-blur-sm">
          <button
            onClick={() => setActiveTab('view')}
            className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'view' ? 'bg-white shadow-sm text-navy-900' : 'text-slate-500 hover:text-navy-600'}`}
          >
            View Timetable
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'create' ? 'bg-white shadow-sm text-navy-900' : 'text-slate-500 hover:text-navy-600'}`}
          >
            Add Entry
          </button>
        </div>
      </div>

      {activeTab === 'view' ? (
        <>
          <div className="card">
            <div className="p-5 border-b border-slate-100 bg-white flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-navy-600" />
                <h2 className="text-lg font-bold text-navy-900">Weekly Schedule</h2>
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
                <span className="ml-3 text-slate-600">Loading timetable...</span>
              </div>
            ) : error ? (
              <div className="text-center py-12 text-red-600">{error}</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-5">
                {groupedByDay.map(({ day, periods }) => (
                  <div key={day} className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="bg-navy-50 px-4 py-3 border-b border-slate-200">
                      <h3 className="font-bold text-navy-900">{day}</h3>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {periods.length === 0 ? (
                        <div className="p-4 text-center text-slate-400 text-sm">No periods</div>
                      ) : (
                        periods.map(period => (
                          <div key={period.id} className="p-3 hover:bg-slate-50">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <BookOpen className="h-4 w-4 text-saffron-500" />
                                  <span className="font-semibold text-navy-900">{period.subject}</span>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-slate-500">
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3.5 w-3.5" />
                                    {period.startTime} - {period.endTime}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <MapPin className="h-3.5 w-3.5" />
                                    {period.roomNumber}
                                  </div>
                                </div>
                                {period.teacherName && (
                                  <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                                    <User className="h-3.5 w-3.5" />
                                    {period.teacherName}
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col gap-1">
                                <button
                                  onClick={() => { setSelectedTimetable(period); setShowModal(true); }}
                                  className="p-1 text-navy-600 hover:bg-navy-50 rounded"
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDelete(period.id)}
                                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <CreateTimetableForm
          classes={classes}
          onSuccess={() => { setActiveTab('view'); loadData(); }}
          onCancel={() => setActiveTab('view')}
        />
      )}

      {showModal && selectedTimetable && (
        <EditTimetableModal
          timetable={selectedTimetable}
          classes={classes}
          onClose={() => setShowModal(false)}
          onUpdate={() => { setShowModal(false); loadData(); }}
        />
      )}
    </div>
  );
}

function CreateTimetableForm({ classes, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    classId: '',
    sectionId: '',
    dayOfWeek: '1',
    periodNumber: '1',
    subject: '',
    teacherName: '',
    roomNumber: '',
    startTime: '08:00',
    endTime: '09:00'
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.classId || !formData.sectionId || !formData.subject) {
      setError('Please fill all required fields');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await timetableApi.create({
        ...formData,
        classId: parseInt(formData.classId),
        sectionId: parseInt(formData.sectionId),
        dayOfWeek: parseInt(formData.dayOfWeek),
        periodNumber: parseInt(formData.periodNumber)
      });
      onSuccess();
    } catch (err) {
      setError('Failed to create timetable entry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedClass = classes.find(c => c.id === parseInt(formData.classId));

  return (
    <div className="card">
      <div className="p-6 border-b border-slate-100">
        <h2 className="text-xl font-display font-bold text-navy-900">Add Timetable Entry</h2>
        <p className="text-sm text-slate-500 mt-1">Schedule a class period</p>
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
            <label className="block text-sm font-medium text-slate-700 mb-1">Day *</label>
            <select
              value={formData.dayOfWeek}
              onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white"
              required
            >
              <option value="1">Monday</option>
              <option value="2">Tuesday</option>
              <option value="3">Wednesday</option>
              <option value="4">Thursday</option>
              <option value="5">Friday</option>
              <option value="6">Saturday</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Period Number *</label>
            <select
              value={formData.periodNumber}
              onChange={(e) => setFormData({ ...formData, periodNumber: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white"
              required
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                <option key={n} value={n}>Period {n}</option>
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
            <label className="block text-sm font-medium text-slate-700 mb-1">Teacher Name</label>
            <input
              type="text"
              value={formData.teacherName}
              onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md"
              placeholder="e.g. Mr. Sharma"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Room Number</label>
            <input
              type="text"
              value={formData.roomNumber}
              onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md"
              placeholder="e.g. Room 101"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Start Time *</label>
            <input
              type="time"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">End Time *</label>
            <input
              type="time"
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md"
              required
            />
          </div>
        </div>

        <div className="flex justify-end pt-6 border-t border-slate-100 gap-3">
          <button type="button" onClick={onCancel} className="btn btn-outline">
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="btn btn-accent">
            {submitting ? 'Saving...' : 'Save Entry'}
          </button>
        </div>
      </form>
    </div>
  );
}

function EditTimetableModal({ timetable, classes, onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    classId: timetable.classId,
    sectionId: timetable.sectionId,
    dayOfWeek: timetable.dayOfWeek,
    periodNumber: timetable.periodNumber,
    subject: timetable.subject,
    teacherName: timetable.teacherName || '',
    roomNumber: timetable.roomNumber || '',
    startTime: timetable.startTime,
    endTime: timetable.endTime
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await timetableApi.update(timetable.id, formData);
      onUpdate();
    } catch (err) {
      alert('Failed to update timetable entry');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-3 right-3 text-slate-400 hover:text-slate-600">
          <X className="h-5 w-5" />
        </button>

        <div className="p-6 border-b border-slate-100 sticky top-0 bg-white">
          <h2 className="text-xl font-display font-bold text-navy-900">Edit Timetable Entry</h2>
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
              <label className="block text-sm font-medium text-slate-700 mb-1">Day</label>
              <select
                value={formData.dayOfWeek}
                onChange={(e) => setFormData({ ...formData, dayOfWeek: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white"
              >
                {[1, 2, 3, 4, 5, 6].map(n => (
                  <option key={n} value={n}>{['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][n - 1]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Period</label>
              <select
                value={formData.periodNumber}
                onChange={(e) => setFormData({ ...formData, periodNumber: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                  <option key={n} value={n}>Period {n}</option>
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
              <label className="block text-sm font-medium text-slate-700 mb-1">Teacher</label>
              <input
                type="text"
                value={formData.teacherName}
                onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Room</label>
              <input
                type="text"
                value={formData.roomNumber}
                onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Start Time</label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">End Time</label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md"
              />
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
