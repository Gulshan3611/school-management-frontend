import { useState, useEffect } from 'react';
import { FileText, Save, Award, Loader } from 'lucide-react';
import { examsApi, classesApi, studentsApi } from '../services/api';

export function Exams() {
  const [activeTab, setActiveTab] = useState('schedule');
  const [exams, setExams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);

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
    } finally {
      setLoading(false);
    }
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
          >Exam Schedule</button>
          <button
            onClick={() => setActiveTab('marks')}
            className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'marks' ? 'bg-white shadow-sm text-navy-900' : 'text-slate-500 hover:text-navy-600'}`}
          >Marks Entry</button>
        </div>
      </div>

      {activeTab === 'schedule' && (
        <ExamSchedule exams={exams} classes={classes} loading={loading} />
      )}
      {activeTab === 'marks' && (
        <MarksEntry exams={exams} classes={classes} loading={loading} />
      )}
    </div>
  );
}

function ExamSchedule({ exams, classes, loading }) {
  return (
    <div className="card">
      <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white">
        <h2 className="text-lg font-bold text-navy-900">Exam Schedule</h2>
        <button className="btn btn-primary flex items-center"><FileText className="h-4 w-4 mr-2" /> Add New Exam</button>
      </div>
      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12"><Loader className="h-8 w-8 animate-spin text-navy-600" /></div>
        ) : exams.length === 0 ? (
          <div className="text-center py-12 text-slate-500">No exams scheduled</div>
        ) : (
          <table>
            <thead>
              <tr><th>Exam Name</th><th>Class</th><th>Date</th><th className="text-right">Students</th></tr>
            </thead>
            <tbody>
              {exams.map((exam) => (
                <tr key={exam.id}>
                  <td className="font-semibold text-navy-900">{exam.name}</td>
                  <td>{exam.class?.name}</td>
                  <td>{new Date(exam.date).toLocaleDateString('en-IN')}</td>
                  <td className="text-right">{exam.results?.length || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function MarksEntry({ exams, classes }) {
  const [selectedExam, setSelectedExam] = useState('');
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (selectedExam) {
      examsApi.getResults(selectedExam).then(setResults).catch(console.error);
    }
  }, [selectedExam]);

  return (
    <div className="card">
      <div className="p-5 border-b border-slate-100 flex flex-wrap gap-4 items-center bg-white">
        <select value={selectedExam} onChange={(e) => setSelectedExam(e.target.value)} className="!py-2 !px-4 !rounded-xl !bg-slate-50 !border-slate-200">
          <option value="">Select Exam</option>
          {exams.map(exam => <option key={exam.id} value={exam.id}>{exam.name}</option>)}
        </select>
        <button className="btn btn-primary flex items-center ml-auto"><Save className="h-4 w-4 mr-2" /> Save Marks</button>
      </div>
      {selectedExam && (
        <div className="p-8 text-center text-slate-500">
          <Award className="h-16 w-16 mx-auto mb-4 text-slate-300" />
          <p>Enter marks for {results.length} students. Results will appear here.</p>
        </div>
      )}
    </div>
  );
}
