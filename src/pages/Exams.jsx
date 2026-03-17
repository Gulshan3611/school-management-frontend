import { useState, useEffect } from 'react';
import { FileText, Save, Award, Plus, Edit2, Trash2, X, Calendar, Users } from 'lucide-react';
import { examsApi, classesApi, studentsApi } from '../services/api';

export function Exams() {
  const [activeTab, setActiveTab] = useState('schedule');
  const [exams, setExams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showExamModal, setShowExamModal] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [examToDelete, setExamToDelete] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [examsData, classesData] = await Promise.all([
        examsApi.getAll(),
        classesApi.getAll()
      ]);
      setExams(examsData);
      setClasses(classesData);
    } catch (error) {
      console.error('Failed to load exams:', error);
      alert('Failed to load exams data');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (exam) => {
    setEditingExam(exam);
    setShowExamModal(true);
  };

  const handleDeleteClick = (exam) => {
    setExamToDelete(exam);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await examsApi.delete(examToDelete.id);
      setExams(exams.filter(e => e.id !== examToDelete.id));
      setShowDeleteConfirm(false);
      setExamToDelete(null);
      alert('Exam deleted successfully!');
    } catch (error) {
      alert('Failed to delete exam');
    }
  };

  const handleExamSuccess = () => {
    setShowExamModal(false);
    setEditingExam(null);
    loadData();
    alert(editingExam ? 'Exam updated successfully!' : 'Exam created successfully!');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-navy-900">Examinations & Results</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Manage marks entry, grading, and report cards</p>
        </div>
        <div className="flex bg-slate-200/50 p-1.5 rounded-xl border border-slate-200/50 backdrop-blur-sm">
          <button
            onClick={() => setActiveTab('schedule')}
            className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'schedule' ? 'bg-white shadow-sm text-navy-900' : 'text-slate-500 hover:text-navy-600'}`}
          >
            Exam Schedule
          </button>
          <button
            onClick={() => setActiveTab('marks')}
            className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'marks' ? 'bg-white shadow-sm text-navy-900' : 'text-slate-500 hover:text-navy-600'}`}
          >
            Marks Entry
          </button>
        </div>
      </div>

      {activeTab === 'schedule' && (
        <ExamSchedule 
          exams={exams} 
          classes={classes} 
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          onAddNew={() => {
            setEditingExam(null);
            setShowExamModal(true);
          }}
        />
      )}
      {activeTab === 'marks' && (
        <MarksEntry exams={exams} classes={classes} loading={loading} />
      )}

      {/* Exam Create/Edit Modal */}
      {showExamModal && (
        <ExamForm
          exam={editingExam}
          classes={classes}
          onClose={() => {
            setShowExamModal(false);
            setEditingExam(null);
          }}
          onSuccess={handleExamSuccess}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-bold text-navy-900 mb-2">Delete Exam</h3>
              <p className="text-slate-600 mb-6">
                Are you sure you want to delete "{examToDelete?.name}"? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setExamToDelete(null);
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

function ExamSchedule({ exams, classes, loading, onEdit, onDelete, onAddNew }) {
  const getClassName = (classId) => {
    const cls = classes.find(c => c.id === classId);
    return cls ? cls.name : '-';
  };

  return (
    <div className="card">
      <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white">
        <h2 className="text-lg font-bold text-navy-900">Exam Schedule</h2>
        <button 
          className="btn btn-primary flex items-center"
          onClick={onAddNew}
        >
          <Plus className="h-4 w-4 mr-2" /> Add New Exam
        </button>
      </div>
      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="h-8 w-8 animate-spin text-navy-600" />
          </div>
        ) : exams.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <Calendar className="h-16 w-16 mx-auto mb-4 text-slate-300" />
            <p>No exams scheduled</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Exam Name</th>
                <th>Class</th>
                <th>Date</th>
                <th className="text-center">Results</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {exams.map((exam) => (
                <tr key={exam.id}>
                  <td className="font-semibold text-navy-900">{exam.name}</td>
                  <td>{getClassName(exam.classId)}</td>
                  <td>{new Date(exam.date).toLocaleDateString('en-IN')}</td>
                  <td className="text-center">
                    <span className="text-sm font-medium text-slate-600">
                      {exam.results?.length || 0} students
                    </span>
                  </td>
                  <td className="text-right">
                    <button
                      onClick={() => onEdit(exam)}
                      className="text-blue-600 hover:text-blue-800 font-semibold mr-3 text-sm inline-flex items-center"
                    >
                      <Edit2 className="h-3.5 w-3.5 mr-1" /> Edit
                    </button>
                    <button
                      onClick={() => onDelete(exam)}
                      className="text-red-600 hover:text-red-800 font-semibold text-sm inline-flex items-center"
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

function ExamForm({ exam, classes, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: exam?.name || '',
    date: exam?.date ? exam.date.split('T')[0] : '',
    classId: exam?.classId || ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.date || !formData.classId) {
      setError('Please fill all required fields');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      if (exam) {
        await examsApi.update(exam.id, formData);
      } else {
        await examsApi.create(formData);
      }
      onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to save exam');
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
            {exam ? 'Edit Exam' : 'Create New Exam'}
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
              Exam Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500"
              placeholder="e.g. Half-Yearly Examination"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Date *
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Class *
            </label>
            <select
              value={formData.classId}
              onChange={(e) => setFormData({...formData, classId: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500 bg-white"
              required
            >
              <option value="">Select Class</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={onClose} className="btn btn-outline">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-accent">
              {submitting ? 'Saving...' : (exam ? 'Update Exam' : 'Create Exam')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function MarksEntry({ exams, classes }) {
  const [selectedExam, setSelectedExam] = useState('');
  const [results, setResults] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [marksData, setMarksData] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (selectedExam) {
      examsApi.getResults(selectedExam)
        .then(setResults)
        .catch(console.error);
    }
  }, [selectedExam]);

  const handleMarksChange = (studentId, value) => {
    setMarksData(prev => ({
      ...prev,
      [studentId]: value
    }));
  };

  const handleSaveMarks = async () => {
    try {
      setSaving(true);
      const promises = Object.entries(marksData).map(([studentId, marks]) => {
        const existingResult = results.find(r => r.studentId === parseInt(studentId));
        if (existingResult) {
          return examsApi.updateResult(existingResult.id, { marks: parseInt(marks) });
        } else {
          return examsApi.addResult(selectedExam, {
            studentId: parseInt(studentId),
            subject: selectedSubject,
            marks: parseInt(marks),
            maxMarks: 100
          });
        }
      });
      await Promise.all(promises);
      alert('Marks saved successfully!');
      setMarksData({});
      // Reload results
      examsApi.getResults(selectedExam).then(setResults);
    } catch (error) {
      alert('Failed to save marks');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card">
      <div className="p-5 border-b border-slate-100 flex flex-wrap gap-4 items-center bg-white">
        <select 
          value={selectedExam} 
          onChange={(e) => setSelectedExam(e.target.value)} 
          className="!py-2 !px-4 !rounded-xl !bg-slate-50 !border-slate-200"
        >
          <option value="">Select Exam</option>
          {exams.map(exam => (
            <option key={exam.id} value={exam.id}>{exam.name}</option>
          ))}
        </select>
        
        <input
          type="text"
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          placeholder="Subject name"
          className="!py-2 !px-4 !rounded-xl !bg-slate-50 !border-slate-200 !w-48"
        />
        
        <button 
          className="btn btn-primary flex items-center ml-auto"
          onClick={handleSaveMarks}
          disabled={!selectedExam || !selectedSubject || saving}
        >
          <Save className="h-4 w-4 mr-2" /> {saving ? 'Saving...' : 'Save Marks'}
        </button>
      </div>
      
      {selectedExam && selectedSubject ? (
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Class</th>
                <th>Marks (out of 100)</th>
                <th>Existing Result</th>
              </tr>
            </thead>
            <tbody>
              {results.length > 0 ? (
                results.map((result) => (
                  <tr key={result.id}>
                    <td>{result.student?.name || 'Unknown'}</td>
                    <td>{result.student?.class?.name || '-'}</td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={marksData[result.studentId] || result.marks}
                        onChange={(e) => handleMarksChange(result.studentId, e.target.value)}
                        className="w-24 px-2 py-1 border border-slate-300 rounded"
                      />
                    </td>
                    <td>
                      <span className="text-green-600 text-sm">✓ Recorded</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-8 text-slate-500">
                    <Award className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                    <p>No results yet. Enter marks for students below.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-8 text-center text-slate-500">
          <Award className="h-16 w-16 mx-auto mb-4 text-slate-300" />
          <p>Select an exam and subject to enter marks</p>
        </div>
      )}
    </div>
  );
}

// Loader component for consistency
function Loader({ className }) {
  return (
    <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );
}
