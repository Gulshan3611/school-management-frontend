import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  BookOpen,
  GraduationCap,
  IndianRupee,
  UserSquare,
  BusFront,
  Bell,
  Calendar,
  BookOpenCheck,
  FileCheck,
  FileClock,
  Route
} from 'lucide-react';
import { cn } from '../../lib/utils';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Students', path: '/students', icon: Users },
  { name: 'Attendance', path: '/attendance', icon: UserCheck },
  { name: 'Academics', path: '/academics', icon: BookOpen },
  { name: 'Exams & Results', path: '/exams', icon: GraduationCap },
  { name: 'Fee Management', path: '/fees', icon: IndianRupee },
  { name: 'Teachers & Staff', path: '/staff', icon: UserSquare },
  { name: 'Transport', path: '/transport', icon: BusFront },
  { name: 'Notices', path: '/notices', icon: Bell },
  { name: 'Timetable', path: '/timetable', icon: Calendar },
  { name: 'Homework', path: '/homework', icon: BookOpenCheck },
  { name: 'Syllabus', path: '/syllabus', icon: FileCheck },
  { name: 'Leave Management', path: '/leaves', icon: FileClock },
  { name: 'Transport Allocation', path: '/transport-allocation', icon: Route },
];

export function Sidebar() {
  return (
    <div className="flex flex-col w-64 h-screen bg-navy-900 text-white border-r-4 border-saffron-500 flex-shrink-0 relative">
      <div className="flex items-center justify-center h-20 border-b border-navy-700 mx-4">
        <h1 className="text-2xl font-display font-bold text-white tracking-wider uppercase">
          Vidya<span className="text-saffron-500">ERP</span>
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto py-6">
        <nav className="space-y-1 px-3">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors group',
                  isActive
                    ? 'bg-navy-800 text-saffron-500 border-l-4 border-saffron-500'
                    : 'text-slate-300 hover:bg-navy-800 hover:text-white border-l-4 border-transparent'
                )
              }
            >
              <item.icon className="mr-3 flex-shrink-0 h-5 w-5" aria-hidden="true" />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-navy-700 bg-navy-800/50">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-saffron-500 flex items-center justify-center text-white font-bold">
            AD
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-white">Admin Desk</p>
            <p className="text-xs text-slate-400">Delhi Public School</p>
          </div>
        </div>
      </div>
    </div>
  );
}
