import { useState, useEffect } from 'react';
import { BusIcon, MapPin, Users, Plus, Loader } from 'lucide-react';
import { transportApi } from '../services/api';

export function Transport() {
  const [activeTab, setActiveTab] = useState('routes');
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const data = await transportApi.getAll();
      setVehicles(data);
    } catch (error) {
      console.error('Failed to load vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Transport & Fleet Management</h1>
          <p className="text-sm text-slate-500 font-medium">Manage bus routes, tracking, and student assignments</p>
        </div>
        <div className="flex bg-slate-200/50 p-1.5 rounded-xl border border-slate-200/50 backdrop-blur-sm">
          <button onClick={() => setActiveTab('routes')} className={`px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center ${activeTab === 'routes' ? 'bg-white shadow-sm text-navy-800' : 'text-slate-500 hover:text-navy-600'}`}><MapPin className="h-4 w-4 mr-2" /> Route Management</button>
          <button onClick={() => setActiveTab('allocation')} className={`px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center ${activeTab === 'allocation' ? 'bg-white shadow-sm text-navy-800' : 'text-slate-500 hover:text-navy-600'}`}><Users className="h-4 w-4 mr-2" /> Student Allocation</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex items-center">
          <div className="h-12 w-12 rounded-full flex items-center justify-center bg-blue-100 text-blue-600 mr-4"><BusIcon className="h-6 w-6" /></div>
          <div><div className="text-sm font-medium text-slate-500">Total Buses</div><div className="text-xl font-bold text-navy-900">{vehicles.length} Active</div></div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex items-center">
          <div className="h-12 w-12 rounded-full flex items-center justify-center bg-green-100 text-green-600 mr-4"><Users className="h-6 w-6" /></div>
          <div><div className="text-sm font-medium text-slate-500">Total Capacity</div><div className="text-xl font-bold text-navy-900">{vehicles.reduce((sum, v) => sum + v.capacity, 0)} seats</div></div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex items-center">
          <div className="h-12 w-12 rounded-full flex items-center justify-center bg-amber-100 text-amber-600 mr-4"><BusIcon className="h-6 w-6" /></div>
          <div><div className="text-sm font-medium text-slate-500">Routes</div><div className="text-xl font-bold text-navy-900">{vehicles.length} Routes</div></div>
        </div>
      </div>

      {activeTab === 'routes' && <RouteManagement vehicles={vehicles} loading={loading} />}
      {activeTab === 'allocation' && <StudentAllocation />}
    </div>
  );
}

function RouteManagement({ vehicles, loading }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
        <h2 className="text-lg font-bold text-navy-800">Active Routes</h2>
        <button className="flex items-center px-4 py-2 bg-navy-800 text-white rounded-lg text-sm font-medium hover:bg-navy-900 transition-colors shadow-sm"><Plus className="h-4 w-4 mr-2" /> Add New Route</button>
      </div>
      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12"><Loader className="h-8 w-8 animate-spin text-navy-600" /></div>
        ) : vehicles.length === 0 ? (
          <div className="text-center py-12 text-slate-500">No vehicles found</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Vehicle No</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Route</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Capacity</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {vehicles.map((vehicle) => (
                <tr key={vehicle.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4">
                    <span className="inline-block px-2 py-1 bg-amber-100 border border-amber-300 rounded font-bold text-amber-900 text-xs uppercase tracking-widest">{vehicle.vehicleNo}</span>
                  </td>
                  <td className="p-4">
                    <div className="text-sm font-bold text-navy-900">{vehicle.route}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm font-medium text-slate-600">{vehicle.capacity} seats</div>
                  </td>
                  <td className="p-4 text-sm text-right">
                    <button className="text-navy-600 hover:text-navy-900 font-medium mr-3 text-xs">Edit</button>
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

function StudentAllocation() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col items-center justify-center text-center min-h-[300px]">
      <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-500 mb-4"><Users className="h-8 w-8" /></div>
      <h2 className="text-xl font-bold text-navy-900 mb-2">Student Allocation Planner</h2>
      <p className="text-slate-500 max-w-md mb-6">Assign students to specific routes and stops during admission.</p>
      <button className="px-6 py-2 bg-navy-800 text-white font-medium rounded-lg text-sm hover:bg-navy-900 transition-colors shadow-sm">View Enrolled Students</button>
    </div>
  );
}
