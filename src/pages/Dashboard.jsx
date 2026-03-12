import { useState, useEffect } from 'react';
import { Users, UserCheck, BookOpen, GraduationCap, IndianRupee, BellRing, CalendarDays, Server, Loader } from 'lucide-react';
import { Link } from 'react-router-dom';
import { dashboardApi, healthCheck } from '../services/api';

function StatCard({ title, value, subtext, icon: Icon, colorClass, loading }) {
  return (
    <div className="card p-6 flex items-center transition-all hover:shadow-soft hover:-translate-y-1">
      <div className={`h-14 w-14 rounded-2xl flex items-center justify-center mr-5 ${colorClass}`}>
        <Icon className="h-7 w-7" />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        {loading ? (
          <div className="h-9 w-24 bg-slate-200 animate-pulse rounded"></div>
        ) : (
          <h3 className="text-3xl font-display font-bold text-navy-900 leading-none">{value}</h3>
        )}
        {subtext && <p className="text-xs text-slate-400 mt-2">{subtext}</p>}
      </div>
    </div>
  );
}

const quickLinks = [
  { name: 'Admit Student', path: '/students', icon: Users, color: 'text-blue-500 bg-blue-50' },
  { name: 'Mark Attendance', path: '/attendance', icon: UserCheck, color: 'text-green-500 bg-green-50' },
  { name: 'Update Fees', path: '/fees', icon: IndianRupee, color: 'text-amber-500 bg-amber-50' },
  { name: 'Exam Results', path: '/exams', icon: GraduationCap, color: 'text-indigo-500 bg-indigo-50' },
];

export function Dashboard() {
  const [backendStatus, setBackendStatus] = useState('Checking...');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkBackend();
    loadStats();
  }, []);

  const checkBackend = async () => {
    try {
      const response = await healthCheck();
      const data = await response.json();
      if (data.status === 'ok') setBackendStatus('Connected');
      else setBackendStatus('Error');
    } catch {
      setBackendStatus('Disconnected');
    }
  };

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await dashboardApi.getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-navy-900">Dashboard Overview</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Get a bird's eye view of the academic year</p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-3">
          <div className={`px-4 py-2 rounded-lg border font-bold text-sm flex items-center gap-2 ${
            backendStatus === 'Connected' ? 'bg-green-50 text-green-700 border-green-200' :
            backendStatus === 'Checking...' ? 'bg-slate-50 text-slate-500 border-slate-200' :
            'bg-red-50 text-red-700 border-red-200'
          }`}>
            <Server className="h-4 w-4" />
            Backend: {backendStatus}
          </div>
          <div className="px-4 py-2 bg-slate-100 rounded-lg border border-slate-200">
            <p className="text-sm font-bold text-navy-800">Academic Year <span className="text-saffron-500">2025-26</span></p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Students"
          value={stats ? stats.totalStudents.toLocaleString('en-IN') : '0'}
          icon={Users}
          colorClass="bg-blue-100 text-blue-600"
          loading={loading}
        />
        <StatCard
          title="Staff & Teachers"
          value={stats ? stats.totalTeachers : '0'}
          icon={BookOpen}
          colorClass="bg-purple-100 text-purple-600"
          loading={loading}
        />
        <StatCard
          title="Today's Attendance"
          value={`${stats?.attendanceToday || 0}%`}
          subtext="across all classes"
          icon={UserCheck}
          colorClass="bg-green-100 text-green-600"
          loading={loading}
        />
        <StatCard
          title="Fee Collection"
          value={`${stats?.feeCollection || 0}%`}
          subtext="of total"
          icon={IndianRupee}
          colorClass="bg-saffron-100 text-saffron-600"
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="card p-6 xl:col-span-2">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
            <h2 className="text-xl font-display font-bold text-navy-900 flex items-center">
              <div className="h-8 w-8 rounded-lg bg-saffron-100 text-saffron-600 flex items-center justify-center mr-3">
                <BellRing className="h-4 w-4" />
              </div>
              Notice Board & Circulars
            </h2>
            <button className="text-sm font-semibold text-saffron-500 hover:text-saffron-600 transition-colors">View All Archive</button>
          </div>
          <div className="space-y-1">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="h-8 w-8 animate-spin text-navy-600" />
              </div>
            ) : stats?.notices?.length > 0 ? (
              stats.notices.map((notice) => (
                <div key={notice.id} className="flex items-start p-4 hover:bg-slate-50 rounded-xl transition-colors group">
                  <div className={`h-2.5 w-2.5 mt-1.5 rounded-full mr-4 flex-shrink-0 ${notice.urgency === 'high' ? 'bg-red-500 shadow-sm shadow-red-200' : 'bg-blue-500 shadow-sm shadow-blue-200'}`} />
                  <div className="flex-1">
                    <h4 className="text-base font-semibold text-slate-800 group-hover:text-navy-900 transition-colors">{notice.title}</h4>
                    <p className="text-xs text-slate-500 mt-1.5 flex items-center">
                      <span className="font-medium text-slate-400 uppercase tracking-wider text-[10px] mr-2">Issued</span>
                      {notice.date}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-slate-500">No notices available</div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <div className="flex items-center mb-6 pb-4 border-b border-slate-100">
              <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mr-3">
                <CalendarDays className="h-4 w-4" />
              </div>
              <h2 className="text-xl font-display font-bold text-navy-900">
                Upcoming Calendar
              </h2>
            </div>
            <div className="space-y-2">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader className="h-6 w-6 animate-spin text-navy-600" />
                </div>
              ) : stats?.upcomingEvents?.length > 0 ? (
                stats.upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-center p-3 hover:bg-slate-50 rounded-xl transition-colors">
                    <div className="w-14 h-14 rounded-lg border border-slate-100 bg-white shadow-sm flex flex-col items-center justify-center mr-4 flex-shrink-0">
                      <span className="text-[10px] font-bold text-saffron-500 uppercase tracking-wider">{event.date.split(' ')[1]}</span>
                      <span className="text-xl font-display font-bold text-navy-900 leading-none mt-1">{event.date.split(' ')[0]}</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800 leading-snug">{event.title}</h4>
                      <p className="text-xs font-medium text-slate-400 mt-1 uppercase tracking-wider">{event.type}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500">No upcoming events</div>
              )}
            </div>
          </div>

          <div className="card p-6 bg-gradient-to-br from-navy-900 to-navy-800 text-white border-0 shadow-soft">
            <h3 className="text-lg font-display font-bold mb-4 text-white">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4 w-full">
              {quickLinks.map((link) => (
                <Link key={link.name} to={link.path} className="flex flex-col items-start p-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/5 transition-all text-left group">
                  <div className={`h-10 w-10 rounded-lg mb-3 flex items-center justify-center bg-white shadow-sm group-hover:scale-110 transition-transform ${link.color.split(' ')[0]}`}>
                    <link.icon className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-semibold text-white leading-tight">{link.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
