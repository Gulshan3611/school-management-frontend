import { useState, useEffect } from 'react';
import { Search, Plus, Filter, Download, X, Loader } from 'lucide-react';
import { studentsApi, classesApi } from '../services/api';

export function Students() {
  const [activeTab, setActiveTab] = useState('directory');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [studentsData, classesData] = await Promise.all([
        studentsApi.getAll(),
        classesApi.getAll()
      ]);
      setStudents(studentsData);
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
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await studentsApi.delete(id);
        setStudents(students.filter(s => s.id !== id));
      } catch (err) {
        alert('Failed to delete student');
      }
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = !searchTerm || student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          student.rollNumber.toString().includes(searchTerm);
    const matchesClass = !selectedClass || student.classId === parseInt(selectedClass);
    const matchesSection = !selectedSection || student.sectionId === parseInt(selectedSection);
    return matchesSearch && matchesClass && matchesSection;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-navy-900">Student Management</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Manage admissions, details, and ID cards</p>
        </div>

        <div className="flex bg-slate-200/50 p-1.5 rounded-xl border border-slate-200/50 backdrop-blur-sm">
          <button
            onClick={() => setActiveTab('directory')}
            className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'directory' ? 'bg-white shadow-sm text-navy-900' : 'text-slate-500 hover:text-navy-600'}`}
          >
            Directory
          </button>
          <button
            onClick={() => setActiveTab('admission')}
            className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'admission' ? 'bg-white shadow-sm text-navy-900' : 'text-slate-500 hover:text-navy-600'}`}
          >
            New Admission
          </button>
        </div>
      </div>

      {activeTab === 'directory' ? (
        <div className="card">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-white">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, roll number..."
                className="w-full pl-11 !rounded-xl !bg-slate-50 !border-slate-200"
              />
            </div>

            <div className="flex gap-3 w-full sm:w-auto">
              <select 
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
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
              >
                <option value="">All Sections</option>
                {selectedClass && classes.find(c => c.id === parseInt(selectedClass))?.sections.map(sec => (
                  <option key={sec.id} value={sec.id}>{sec.name}</option>
                ))}
              </select>
              <button className="btn btn-primary whitespace-nowrap">
                <Filter className="h-4 w-4 mr-2" /> Filter
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="h-8 w-8 animate-spin text-navy-600" />
                <span className="ml-3 text-slate-600">Loading students...</span>
              </div>
            ) : error ? (
              <div className="text-center py-12 text-red-600">{error}</div>
            ) : filteredStudents.length === 0 ? (
              <div className="text-center py-12 text-slate-500">No students found</div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Roll No</th>
                    <th>Student Name</th>
                    <th>Class-Sec</th>
                    <th>DOB</th>
                    <th>Parent Contact</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr key={student.id}>
                      <td className="font-semibold text-navy-900">{student.rollNumber}</td>
                      <td>
                        <div className="flex items-center">
                          <div className="h-9 w-9 rounded-full bg-saffron-100 text-saffron-600 flex items-center justify-center mr-3 font-display font-bold text-sm">
                            {student.name.charAt(0)}
                          </div>
                          <span className="font-medium text-slate-900">{student.name}</span>
                        </div>
                      </td>
                      <td><span className="font-medium">{student.class?.name}-{student.section?.name}</span></td>
                      <td>{student.dob ? new Date(student.dob).toLocaleDateString('en-IN') : '-'}</td>
                      <td>{student.parentContact || '-'}</td>
                      <td className="text-right">
                        <button 
                          onClick={() => setSelectedStudent(student)}
                          className="text-navy-600 hover:text-navy-900 font-semibold mr-4 text-sm"
                        >
                          View
                        </button>
                        <button
                          onClick={() => setSelectedStudent(student)}
                          className="text-saffron-500 hover:text-saffron-600 font-semibold text-sm whitespace-nowrap"
                        >
                          Print ID
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      ) : (
        <AdmissionForm 
          classes={classes} 
          onSuccess={() => {
            setActiveTab('directory');
            loadData();
          }} 
          onCancel={() => setActiveTab('directory')} 
        />
      )}

      {/* ID Card Modal */}
      {selectedStudent && (
        <IDCardModal student={selectedStudent} onClose={() => setSelectedStudent(null)} />
      )}
    </div>
  );
}

// Admission Form Component
function AdmissionForm({ classes, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    rollNumber: '',
    classId: '',
    sectionId: '',
    dob: '',
    parentContact: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.rollNumber || !formData.classId || !formData.sectionId) {
      setError('Please fill all required fields');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await studentsApi.create(formData);
      onSuccess();
    } catch (err) {
      setError('Failed to create student. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedClass = classes.find(c => c.id === parseInt(formData.classId));

  return (
    <div className="card">
      <div className="p-6 border-b border-slate-100">
        <h2 className="text-xl font-display font-bold text-navy-900">New Admission Form</h2>
        <p className="text-sm text-slate-500 mt-1">Fill all mandatory fields (*) as per CBSE/State records</p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-10">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Student Details */}
        <div>
          <h3 className="text-xs font-bold text-saffron-500 uppercase tracking-widest mb-6 border-b border-slate-100 pb-2">1. Student Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                placeholder="e.g. Ramesh Kumar"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth *</label>
              <input
                type="date"
                value={formData.dob}
                onChange={(e) => setFormData({...formData, dob: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Roll Number *</label>
              <input
                type="number"
                value={formData.rollNumber}
                onChange={(e) => setFormData({...formData, rollNumber: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                placeholder="e.g. 1"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Parent Contact *</label>
              <input
                type="tel"
                value={formData.parentContact}
                onChange={(e) => setFormData({...formData, parentContact: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                placeholder="+91 9876543210"
                required
              />
            </div>
          </div>
        </div>

        {/* Academic Details */}
        <div>
          <h3 className="text-sm font-bold border-b border-slate-200 pb-2 mb-4 text-navy-700 uppercase tracking-wider">2. Academic Entry</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Admission Class *</label>
              <select
                value={formData.classId}
                onChange={(e) => setFormData({...formData, classId: e.target.value, sectionId: ''})}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent bg-white"
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
                onChange={(e) => setFormData({...formData, sectionId: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent bg-white"
                disabled={!formData.classId}
                required
              >
                <option value="">Select Section</option>
                {selectedClass?.sections.map(sec => (
                  <option key={sec.id} value={sec.id}>{sec.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-6 border-t border-slate-100 gap-3">
          <button type="button" onClick={onCancel} className="btn btn-outline">
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="btn btn-accent">
            {submitting ? 'Submitting...' : 'Submit Admission'}
          </button>
        </div>
      </form>
    </div>
  );
}

// ID Card Modal Component
function IDCardModal({ student, onClose }) {
  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-white hover:text-slate-200 z-10 bg-navy-900/50 rounded-full p-1"
        >
          <X className="h-5 w-5" />
        </button>

        {/* ID Card Design */}
        <div className="border border-slate-200 m-4 rounded-lg overflow-hidden bg-white shadow-sm relative">
          <div className="bg-navy-900 text-white text-center py-4 px-2">
            <h2 className="text-lg font-bold uppercase tracking-wider">VidyaERP Public School</h2>
            <p className="text-[10px] text-slate-300">Sector 14, New Delhi - 110001</p>
          </div>

          <div className="bg-saffron-500 h-1 w-full"></div>

          <div className="p-5 flex flex-col items-center">
            <div className="h-24 w-24 bg-slate-100 rounded-md border-2 border-slate-200 mb-4 flex items-center justify-center text-slate-400">
              Photo
            </div>

            <h3 className="text-xl font-bold text-navy-900 mb-1">{student.name}</h3>
            <p className="text-xs font-bold text-saffron-600 bg-saffron-50 px-3 py-1 rounded-full mb-4">
              Class {student.class?.name} - '{student.section?.name}'
            </p>

            <div className="w-full space-y-2 text-sm">
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-slate-500">Roll No:</span>
                <span className="font-medium text-slate-800">{student.rollNumber}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-slate-500">DOB:</span>
                <span className="font-medium text-slate-800">{student.dob ? new Date(student.dob).toLocaleDateString('en-IN') : '-'}</span>
              </div>
              <div className="flex justify-between pb-1">
                <span className="text-slate-500">Contact:</span>
                <span className="font-medium text-slate-800">{student.parentContact || '-'}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-2 text-center border-t border-slate-200 flex justify-between items-end px-4 h-16">
             <div>
               <div className="h-4 border-b border-slate-400 w-16 mb-1"></div>
               <p className="text-[9px] text-slate-500 font-medium">Principal Sign</p>
             </div>
             <div>
               <div className="h-4 border-b border-slate-400 w-16 mb-1"></div>
               <p className="text-[9px] text-slate-500 font-medium">Parent Sign</p>
             </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-center">
          <button className="flex items-center px-4 py-2 bg-saffron-500 text-white rounded-lg text-sm font-medium hover:bg-saffron-600 transition-colors">
            <Download className="h-4 w-4 mr-2" /> Download Print PDF
          </button>
        </div>
      </div>
    </div>
  );
}
