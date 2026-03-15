import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { Dashboard } from './pages/Dashboard';
import { Students } from './pages/Students';
import { Attendance } from './pages/Attendance';
import { Academics } from './pages/Academics';
import { Exams } from './pages/Exams';
import { Fees } from './pages/Fees';
import { Staff } from './pages/Staff';
import { Transport } from './pages/Transport';
import { FontPreview } from './pages/FontPreview';
import { Notices } from './pages/Notices';
import { Timetable } from './pages/Timetable';
import { Homework } from './pages/Homework';
import { Syllabus } from './pages/Syllabus';
import { Leaves } from './pages/Leaves';
import { TransportAllocation } from './pages/TransportAllocation';

// Placeholder generic component for pages
function PlaceholderPage({ title }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 h-full flex flex-col items-center justify-center text-center">
      <h2 className="text-2xl font-bold text-navy-800 mb-2">{title} Module</h2>
      <p className="text-slate-500">This module is currently under construction.</p>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="students" element={<Students />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="academics" element={<Academics />} />
          <Route path="exams" element={<Exams />} />
          <Route path="fees" element={<Fees />} />
          <Route path="staff" element={<Staff />} />
          <Route path="transport" element={<Transport />} />
          <Route path="notices" element={<Notices />} />
          <Route path="timetable" element={<Timetable />} />
          <Route path="homework" element={<Homework />} />
          <Route path="syllabus" element={<Syllabus />} />
          <Route path="leaves" element={<Leaves />} />
          <Route path="transport-allocation" element={<TransportAllocation />} />
          <Route path="fonts" element={<FontPreview />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
