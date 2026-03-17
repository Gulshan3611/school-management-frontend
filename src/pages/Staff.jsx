import { useState, useEffect } from 'react';
import { Users, FileText, CheckCircle, X, Loader, Plus, Edit2, Trash2 } from 'lucide-react';
import { staffApi } from '../services/api';

export function Staff() {
  const [activeTab, setActiveTab] = useState('directory');
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState(null);

  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = async () => {
    try {
      setLoading(true);
      const data = await staffApi.getAll();
      setStaff(data);
    } catch (error) {
      console.error('Failed to load staff:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (member) => {
    setEditingStaff(member);
    setShowModal(true);
  };

  const handleDeleteClick = (member) => {
    setStaffToDelete(member);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await staffApi.delete(staffToDelete.id);
      setStaff(staff.filter(s => s.id !== staffToDelete.id));
      setShowDeleteConfirm(false);
      setStaffToDelete(null);
      alert('Staff member deleted successfully!');
    } catch (error) {
      alert('Failed to delete staff member');
    }
  };

  const handleStaffSuccess = () => {
    setShowModal(false);
    setEditingStaff(null);
    loadStaff();
    alert(editingStaff ? 'Staff updated successfully!' : 'Staff member added successfully!');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-navy-900">Staff & HR Management</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Manage teacher profiles, leave approvals, and payroll</p>
        </div>
        <div className="flex bg-slate-200/50 p-1.5 rounded-xl border border-slate-200/50 backdrop-blur-sm">
          <button
            onClick={() => setActiveTab('directory')}
            className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-all flex items-center ${activeTab === 'directory' ? 'bg-white shadow-sm text-navy-900' : 'text-slate-500 hover:text-navy-600'}`}
          >
            <Users className="h-4 w-4 mr-2" /> Staff Directory
          </button>
          <button
            onClick={() => setActiveTab('leaves')}
            className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-all flex items-center ${activeTab === 'leaves' ? 'bg-white shadow-sm text-navy-900' : 'text-slate-500 hover:text-navy-600'}`}
          >
            <CheckCircle className="h-4 w-4 mr-2" /> Leave Requests
          </button>
        </div>
      </div>

      {activeTab === 'directory' && (
        <div className="card">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white">
            <h2 className="text-lg font-bold text-navy-900">Staff Directory</h2>
            <button
              onClick={() => {
                setEditingStaff(null);
                setShowModal(true);
              }}
              className="btn btn-primary flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" /> Add Staff
            </button>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="h-8 w-8 animate-spin text-navy-600" />
              </div>
            ) : staff.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Users className="h-16 w-16 mx-auto mb-4 text-slate-300" />
                <p>No staff members found</p>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Designation</th>
                    <th>Department</th>
                    <th className="text-right">Salary</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {staff.map((member) => (
                    <tr key={member.id}>
                      <td>
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-navy-100 text-navy-600 flex items-center justify-center mr-3 font-display font-bold text-sm">
                            {member.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-navy-900">{member.name}</div>
                            <div className="text-xs text-slate-500 font-medium">{member.empId}</div>
                          </div>
                        </div>
                      </td>
                      <td><span className="font-medium">{member.role}</span></td>
                      <td className="text-slate-500">{member.department}</td>
                      <td className="text-right font-bold text-navy-900">₹{member.salary.toLocaleString('en-IN')}</td>
                      <td className="text-right">
                        <button
                          onClick={() => handleEdit(member)}
                          className="text-blue-600 hover:text-blue-800 font-semibold mr-3 text-sm inline-flex items-center"
                        >
                          <Edit2 className="h-3.5 w-3.5 mr-1" /> Edit
                        </button>
                        <button
                          onClick={() => generatePayslip(member)}
                          className="text-navy-600 hover:text-navy-800 font-semibold mr-3 text-sm inline-flex items-center"
                        >
                          <FileText className="h-3.5 w-3.5 mr-1" /> Payslip
                        </button>
                        <button
                          onClick={() => handleDeleteClick(member)}
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
      )}

      {activeTab === 'leaves' && (
        <div className="card p-12 flex flex-col items-center justify-center text-center">
          <div className="h-20 w-20 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-500 mb-6 mx-auto">
            <CheckCircle className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-display font-bold text-navy-900 mb-3">Leave Management</h2>
          <p className="text-slate-500 max-w-md mb-8">
            Approve or reject leave requests from staff members.
          </p>
          <button
            onClick={() => setActiveTab('directory')}
            className="btn btn-primary"
          >
            Go to Staff Directory
          </button>
        </div>
      )}

      {/* Staff Form Modal */}
      {showModal && (
        <StaffForm
          staff={editingStaff}
          onClose={() => {
            setShowModal(false);
            setEditingStaff(null);
          }}
          onSuccess={handleStaffSuccess}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-bold text-navy-900 mb-2">Delete Staff Member</h3>
              <p className="text-slate-600 mb-6">
                Are you sure you want to delete "{staffToDelete?.name}"? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setStaffToDelete(null);
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

      {selectedPayslip && <PayslipModal payslip={selectedPayslip} onClose={() => setSelectedPayslip(null)} />}
    </div>
  );
}

// Staff Form Component
function StaffForm({ staff, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    empId: staff?.empId || '',
    name: staff?.name || '',
    role: staff?.role || '',
    department: staff?.department || '',
    salary: staff?.salary || ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.empId || !formData.salary) {
      setError('Please fill all required fields');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      if (staff) {
        await staffApi.update(staff.id, {
          ...formData,
          salary: parseFloat(formData.salary)
        });
      } else {
        await staffApi.create({
          ...formData,
          salary: parseFloat(formData.salary)
        });
      }
      onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to save staff member');
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
            {staff ? 'Edit Staff Member' : 'Add New Staff Member'}
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
              Employee ID *
            </label>
            <input
              type="text"
              value={formData.empId}
              onChange={(e) => setFormData({...formData, empId: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500"
              placeholder="e.g. EMP-001"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500"
              placeholder="e.g. Rajesh Kumar"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Designation/Role *
            </label>
            <input
              type="text"
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500"
              placeholder="e.g. TGT English"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Department
            </label>
            <input
              type="text"
              value={formData.department}
              onChange={(e) => setFormData({...formData, department: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500"
              placeholder="e.g. English"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Salary (₹) *
            </label>
            <input
              type="number"
              value={formData.salary}
              onChange={(e) => setFormData({...formData, salary: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500"
              placeholder="e.g. 45000"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={onClose} className="btn btn-outline">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-accent">
              {submitting ? 'Saving...' : (staff ? 'Update Staff' : 'Add Staff')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Payslip Modal (existing functionality)
function PayslipModal({ payslip, onClose }) {
  const basic = payslip.salary * 0.5;
  const da = payslip.salary * 0.2;
  const hra = payslip.salary * 0.2;
  const ta = payslip.salary * 0.1;
  const pf = basic * 0.12;
  const pt = 200;
  const netPay = payslip.salary - (pf + pt);

  return (
    <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 z-10">
          <X className="h-5 w-5" />
        </button>
        <div className="p-8 border border-slate-200 m-6 rounded bg-white">
          <div className="text-center mb-6 pb-6 border-b-2 border-slate-300">
            <h2 className="text-2xl font-bold text-navy-900 uppercase">VidyaERP Public School</h2>
            <h3 className="text-lg font-bold text-navy-800 uppercase mt-4 mb-1">SALARY SLIP</h3>
            <p className="text-sm font-bold text-slate-500">For the Month of {payslip.month || 'March 2026'}</p>
          </div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm mb-6">
            <div><span className="font-semibold text-slate-600 inline-block w-28">Employee Name:</span><span className="font-bold text-navy-900">{payslip.name}</span></div>
            <div><span className="font-semibold text-slate-600 inline-block w-28">Employee Code:</span><span className="font-bold text-navy-900">{payslip.empId}</span></div>
            <div><span className="font-semibold text-slate-600 inline-block w-28">Designation:</span><span className="font-bold text-navy-900">{payslip.role}</span></div>
          </div>
          <div className="flex flex-col sm:flex-row gap-6 mb-8">
            <div className="flex-1 w-full border border-slate-300 rounded overflow-hidden">
              <div className="bg-slate-100 p-2 border-b border-slate-300"><h4 className="font-bold text-navy-900 text-sm text-center">EARNINGS</h4></div>
              <ul className="text-sm divide-y divide-slate-100">
                <li className="flex justify-between p-2"><span className="text-slate-600">Basic Pay</span><span className="font-medium">₹{basic.toLocaleString('en-IN')}</span></li>
                <li className="flex justify-between p-2"><span className="text-slate-600">DA</span><span className="font-medium">₹{da.toLocaleString('en-IN')}</span></li>
                <li className="flex justify-between p-2"><span className="text-slate-600">HRA</span><span className="font-medium">₹{hra.toLocaleString('en-IN')}</span></li>
                <li className="flex justify-between p-2"><span className="text-slate-600">TA</span><span className="font-medium">₹{ta.toLocaleString('en-IN')}</span></li>
              </ul>
              <div className="bg-slate-50 p-2 border-t font-bold flex justify-between"><span>Gross:</span><span>₹{payslip.salary.toLocaleString('en-IN')}</span></div>
            </div>
            <div className="flex-1 w-full border border-slate-300 rounded overflow-hidden">
              <div className="bg-slate-100 p-2 border-b border-slate-300"><h4 className="font-bold text-navy-900 text-sm text-center">DEDUCTIONS</h4></div>
              <ul className="text-sm divide-y divide-slate-100">
                <li className="flex justify-between p-2"><span className="text-slate-600">PF</span><span className="font-medium">₹{pf.toLocaleString('en-IN')}</span></li>
                <li className="flex justify-between p-2"><span className="text-slate-600">PT</span><span className="font-medium">₹{pt.toLocaleString('en-IN')}</span></li>
              </ul>
              <div className="bg-slate-50 p-2 border-t font-bold flex justify-between"><span>Total:</span><span>₹{(pf + pt).toLocaleString('en-IN')}</span></div>
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 p-4 rounded text-center mb-16">
            <h4 className="font-bold text-green-800 uppercase text-sm mb-1">Net Payable Amount</h4>
            <div className="text-2xl font-bold text-green-900">₹{netPay.toLocaleString('en-IN')}</div>
          </div>
        </div>
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-100">Close</button>
        </div>
      </div>
    </div>
  );
}
