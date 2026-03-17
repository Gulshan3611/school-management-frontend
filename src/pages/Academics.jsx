import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, BookOpen, PenTool, Plus, Loader, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { classesApi } from '../services/api';

const timetableData = [
  { time: '08:00 - 08:45', period: '1st', mon: 'Maths', tue: 'Science', wed: 'English', thu: 'Hindi', fri: 'Maths' },
  { time: '08:45 - 09:30', period: '2nd', mon: 'Science', tue: 'SST', wed: 'Maths', thu: 'Science', fri: 'English' },
  { time: '09:30 - 10:15', period: '3rd', mon: 'Hindi', tue: 'English', wed: 'SST', thu: 'Maths', fri: 'SST' },
  { time: '10:15 - 10:45', period: 'Recess', isBreak: true, label: 'LUNCH BREAK' },
  { time: '10:45 - 11:30', period: '4th', mon: 'English', tue: 'Maths', wed: 'Science', thu: 'SST', fri: 'Hindi' },
  { time: '11:30 - 12:15', period: '5th', mon: 'SST', tue: 'Hindi', wed: 'Computer', thu: 'Drawing', fri: 'PT / Games' },
  { time: '12:15 - 13:00', period: '6th', mon: 'Computer', tue: 'Music', wed: 'PT / Games', thu: 'Computer', fri: 'Science' },
];

export function Academics() {
  const [activeTab, setActiveTab] = useState('timetable');
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      setLoading(true);
      const data = await classesApi.getAll();
      setClasses(data);
    } catch (error) {
      console.error('Failed to load classes:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-navy-900">Academics Hub</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Timetable, syllabus tracking, and homework</p>
        </div>
        <div className="flex bg-slate-200/50 p-1.5 rounded-xl border border-slate-200/50 backdrop-blur-sm">
          <button 
            onClick={() => setActiveTab('timetable')} 
            className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-all flex items-center ${activeTab === 'timetable' ? 'bg-white shadow-sm text-navy-900' : 'text-slate-500 hover:text-navy-600'}`}
          >
            <CalendarIcon className="h-4 w-4 mr-2" /> Timetable
          </button>
          <Link to="/homework">
            <button 
              className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-all flex items-center ${activeTab === 'homework' ? 'bg-white shadow-sm text-navy-900' : 'text-slate-500 hover:text-navy-600'}`}
            >
              <PenTool className="h-4 w-4 mr-2" /> Homework
            </button>
          </Link>
          <Link to="/syllabus">
            <button 
              className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-all flex items-center ${activeTab === 'syllabus' ? 'bg-white shadow-sm text-navy-900' : 'text-slate-500 hover:text-navy-600'}`}
            >
              <BookOpen className="h-4 w-4 mr-2" /> Syllabus
            </button>
          </Link>
        </div>
      </div>

      {activeTab === 'timetable' && <Timetable classes={classes} loading={loading} />}
      {activeTab === 'homework' && (
        <RedirectCard 
          title="Daily Homework Log"
          description="Record assignments subject-wise and track submission status."
          link="/homework"
          buttonText="Go to Homework Page"
          icon={PenTool}
          iconColor="text-blue-500 bg-blue-100"
        />
      )}
      {activeTab === 'syllabus' && (
        <RedirectCard 
          title="Syllabus Tracker"
          description="Track chapter completion status against the academic calendar."
          link="/syllabus"
          buttonText="Go to Syllabus Page"
          icon={BookOpen}
          iconColor="text-purple-500 bg-purple-100"
        />
      )}
    </div>
  );
}

function RedirectCard({ title, description, link, buttonText, icon: Icon, iconColor }) {
  return (
    <div className="card p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
      <div className={`h-20 w-20 rounded-2xl flex items-center justify-center mb-6 mx-auto ${iconColor}`}>
        <Icon className="h-10 w-10" />
      </div>
      <h2 className="text-2xl font-display font-bold text-navy-900 mb-3">{title}</h2>
      <p className="text-slate-500 max-w-md mb-8 text-base">{description}</p>
      <Link to={link}>
        <button className="btn btn-primary btn-lg px-8 py-3 text-base flex items-center">
          <ExternalLink className="h-5 w-5 mr-2" /> {buttonText}
        </button>
      </Link>
    </div>
  );
}

function Timetable({ classes, loading }) {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');

  return (
    <div className="card">
      <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white">
        <div className="flex gap-4">
          <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="!py-2 !px-4 !rounded-xl !bg-slate-50 !border-slate-200">
            <option value="">Select Class</option>
            {classes.map(cls => <option key={cls.id} value={cls.id}>{cls.name}</option>)}
          </select>
          <select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)} disabled={!selectedClass} className="!py-2 !px-4 !rounded-xl !bg-slate-50 !border-slate-200">
            <option value="">Select Section</option>
            {selectedClass && classes.find(c => c.id === parseInt(selectedClass))?.sections.map(sec => <option key={sec.id} value={sec.id}>{sec.name}</option>)}
          </select>
        </div>
        <Link to="/timetable">
          <button className="btn btn-accent flex items-center">
            <PenTool className="h-4 w-4 mr-2" /> Edit Timetable
          </button>
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr className="bg-navy-900 border-navy-800">
              <th className="!bg-navy-900 !text-white !font-semibold !border-r !border-navy-800 w-24">Period</th>
              <th className="!bg-navy-900 !text-white !font-semibold !border-r !border-navy-800 w-32">Timing</th>
              <th className="!bg-navy-900 !text-white !font-semibold !border-r !border-navy-800 text-center">Monday</th>
              <th className="!bg-navy-900 !text-white !font-semibold !border-r !border-navy-800 text-center">Tuesday</th>
              <th className="!bg-navy-900 !text-white !font-semibold !border-r !border-navy-800 text-center">Wednesday</th>
              <th className="!bg-navy-900 !text-white !font-semibold !border-r !border-navy-800 text-center">Thursday</th>
              <th className="!bg-navy-900 !text-white !font-semibold text-center">Friday</th>
            </tr>
          </thead>
          <tbody>
            {timetableData.map((row, idx) => (
              <tr key={idx} className={row.isBreak ? 'bg-amber-50/50' : ''}>
                <td className="font-bold text-slate-700 bg-slate-50 border-r border-slate-200 text-center">{row.period}</td>
                <td className="text-xs font-medium text-slate-500 border-r border-slate-200 text-center">{row.time}</td>
                {row.isBreak ? (
                  <td colSpan="5" className="text-sm font-bold text-amber-600 tracking-[0.5em] uppercase border-l-0 text-center py-4">{row.label}</td>
                ) : (
                  <>
                    <td className="text-sm font-medium text-navy-800 border-r border-slate-100 text-center">{row.mon}</td>
                    <td className="text-sm font-medium text-navy-800 border-r border-slate-100 text-center">{row.tue}</td>
                    <td className="text-sm font-medium text-navy-800 border-r border-slate-100 text-center">{row.wed}</td>
                    <td className="text-sm font-medium text-navy-800 border-r border-slate-100 text-center">{row.thu}</td>
                    <td className={`text-sm font-medium text-center ${row.fri === 'PT / Games' ? 'text-green-600' : 'text-navy-800'}`}>{row.fri}</td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
