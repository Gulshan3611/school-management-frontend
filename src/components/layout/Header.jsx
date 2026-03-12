import { User, Bell, Search, Globe } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 shadow-sm sticky top-0 z-10 w-full">
      <div className="flex items-center space-x-4 flex-1">
        <h2 className="text-xl font-bold text-navy-800 hidden sm:block">
          Welcome to VidyaERP
        </h2>
        <div className="relative max-w-md w-full ml-4 hidden md:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-md leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-navy-500 focus:ring-1 focus:ring-navy-500 sm:text-sm transition-colors"
            placeholder="Search students, staff, fees..."
          />
        </div>
      </div>

      <div className="flex items-center space-x-6">
        <div className="flex items-center border border-slate-200 rounded-md px-3 py-1.5 shadow-sm bg-slate-50">
          <Globe className="h-4 w-4 text-slate-500 mr-2" />
          <select className="bg-transparent text-sm font-medium text-slate-700 focus:outline-none cursor-pointer">
            <option>English Medium</option>
            <option>Hindi Medium</option>
          </select>
        </div>

        <div className="flex items-center border border-slate-200 rounded-md px-3 py-1.5 shadow-sm bg-slate-50">
          <select className="bg-transparent text-sm font-medium text-slate-700 focus:outline-none cursor-pointer">
            <option>Session: 2025-26</option>
            <option>Session: 2024-25</option>
          </select>
        </div>

        <button className="relative text-slate-500 hover:text-navy-600 transition-colors">
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-saffron-500 text-[10px] text-white font-bold ring-2 ring-white">
            3
          </span>
          <Bell className="h-6 w-6" />
        </button>

        <div className="h-8 w-8 rounded-full bg-navy-100 flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-navy-500 hover:ring-offset-2 transition-all">
          <User className="h-5 w-5 text-navy-600" />
        </div>
      </div>
    </header>
  );
}
