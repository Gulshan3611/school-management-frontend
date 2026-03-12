import { useState, useEffect } from 'react';
import { Calendar, CheckCircle, XCircle, Clock, AlertTriangle, Loader } from 'lucide-react';
import { attendanceApi, studentsApi, classesApi } from '../services/api';

export function Attendance() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({ present: 0, absent: 0, leave: 0 });

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    if (selectedClass && selectedSection) {
      loadStudents();
    }
  }, [selectedClass, selectedSection, date]);

  const loadClasses = async () => {
    try {
      const data = await classesApi.getAll();
      setClasses(data);
    } catch (error) {
      console.error('Failed to load classes:', error);
    }
  };

  const loadStudents = async () => {
    try {
      setLoading(true);
      const [studentsData, attendanceData] = await Promise.all([
        studentsApi.getByClassAndSection(selectedClass, selectedSection),
        attendanceApi.getAll({ date, classId: selectedClass, sectionId: selectedSection })
      ]);
      
      setStudents(studentsData);
      
      // Map existing attendance
      const attendanceMap = {};
      attendanceData.forEach(record => {
        attendanceMap[record.studentId] = record.status;
      });
      setAttendance(attendanceMap);

      // Calculate stats
      const present = attendanceData.filter(a => a.status === 'present').length;
      const absent = attendanceData.filter(a => a.status === 'absent').length;
      const leave = attendanceData.filter(a => a.status === 'leave').length;
      setStats({ present, absent, leave });
    } catch (error) {
      console.error('Failed to load students:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAttendance = (studentId, status) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const records = students.map(student => ({
        date,
        studentId: student.id,
        status: attendance[student.id] || 'absent'
      }));
      
      await attendanceApi.markBulk(records);
      alert('Attendance saved successfully!');
      loadStudents();
    } catch (error) {
      alert('Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-navy-900">Attendance Register</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Daily class-wise marking and reports</p>
        </div>

        <div className="flex gap-3">
          <button className="btn btn-outline">
            View Monthly Report
          </button>
          <button className="btn btn-accent flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2" /> Send SMS Alerts
          </button>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex flex-wrap gap-4 items-end mb-6 pb-6 border-b border-slate-100">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-32 px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-navy-500"
            >
              <option value="">Select Class</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Section</label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-32 px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-navy-500"
              disabled={!selectedClass}
            >
              <option value="">Select Section</option>
              {selectedClass && classes.find(c => c.id === parseInt(selectedClass))?.sections.map(sec => (
                <option key={sec.id} value={sec.id}>{sec.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-40 !px-3 !py-2 !rounded-lg !bg-slate-50 !border-slate-200"
            />
          </div>
          {students.length > 0 && (
            <div className="ml-auto flex items-center gap-4 text-sm font-medium border border-slate-200 p-2 rounded-lg bg-slate-50">
              <div className="flex items-center text-green-600"><CheckCircle className="h-4 w-4 mr-1" /> {stats.present} Present</div>
              <div className="flex items-center text-red-500"><XCircle className="h-4 w-4 mr-1" /> {stats.absent} Absent</div>
              <div className="flex items-center text-amber-500"><Clock className="h-4 w-4 mr-1" /> {stats.leave} Leave</div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="h-8 w-8 animate-spin text-navy-600" />
            <span className="ml-3 text-slate-600">Loading students...</span>
          </div>
        ) : !selectedClass || !selectedSection ? (
          <div className="text-center py-12 text-slate-500">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-slate-300" />
            <p>Please select a class and section to mark attendance</p>
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-12 text-slate-500">No students found in this class-section</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table>
                <thead>
                  <tr>
                    <th className="w-16">Roll</th>
                    <th>Student Name</th>
                    <th className="text-center">Mark Status</th>
                    <th className="text-right">Remarks (if any)</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
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
                      <td>
                        <div className="flex items-center justify-center">
                          <div className="inline-flex bg-slate-100/80 p-1 rounded-lg border border-slate-200/60">
                            <button
                              onClick={() => markAttendance(student.id, 'present')}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 ${attendance[student.id] === 'present' ? 'bg-white text-green-600 shadow-sm ring-1 ring-slate-200/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                              title="Present"
                            >
                              <CheckCircle className="h-3.5 w-3.5" /> P
                            </button>
                            <button
                              onClick={() => markAttendance(student.id, 'absent')}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 ${attendance[student.id] === 'absent' ? 'bg-white text-red-600 shadow-sm ring-1 ring-slate-200/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                              title="Absent"
                            >
                              <XCircle className="h-3.5 w-3.5" /> A
                            </button>
                            <button
                              onClick={() => markAttendance(student.id, 'leave')}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 ${attendance[student.id] === 'leave' ? 'bg-white text-amber-600 shadow-sm ring-1 ring-slate-200/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                              title="On Leave"
                            >
                              <Clock className="h-3.5 w-3.5" /> L
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="text-right">
                        <input type="text" placeholder="Optional remark..." className="!w-full !max-w-[200px] !text-sm !px-3 !py-1.5 !rounded-lg !bg-slate-50 !border-slate-200" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex justify-end">
              <button 
                onClick={handleSave} 
                disabled={saving}
                className="btn btn-primary"
              >
                {saving ? 'Saving...' : 'Save Attendance'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
