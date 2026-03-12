import { useState, useEffect } from 'react';
import { Search, IndianRupee, Printer, AlertCircle, X, Check, Loader } from 'lucide-react';
import { feesApi, studentsApi } from '../services/api';

export function Fees() {
  const [activeTab, setActiveTab] = useState('collection');
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const feesData = await feesApi.getAll();
      setFees(feesData);
    } catch (error) {
      console.error('Failed to load fees data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReceivePayment = async (fee) => {
    try {
      await feesApi.update(fee.id, { isPaid: true });
      alert('Payment received successfully!');
      loadData();
    } catch (error) {
      alert('Failed to update payment');
    }
  };

  const filteredFees = fees.filter(fee => {
    const matchesSearch = !searchTerm || 
      fee.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fee.student.id.toString().includes(searchTerm);
    
    if (filterStatus === 'paid') return matchesSearch && fee.isPaid;
    if (filterStatus === 'pending') return matchesSearch && !fee.isPaid;
    return matchesSearch;
  });

  const generateReceipt = (fee) => {
    setSelectedReceipt({
      receiptNo: `RCP-2025-${String(fee.id).padStart(4, '0')}`,
      date: new Date().toLocaleDateString('en-IN'),
      studentName: fee.student.name,
      admNo: fee.student.id,
      classSec: `${fee.student.class?.name} - ${fee.student.section?.name}`,
      particulars: [{ name: 'Tuition Fee', amount: fee.amount }],
      total: fee.amount,
      mode: 'Cash/UPI',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-navy-900">Fee Management</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Track collections, dues, and generate receipts</p>
        </div>

        <div className="flex bg-slate-200/50 p-1.5 rounded-xl border border-slate-200/50 backdrop-blur-sm">
          <button
            onClick={() => setActiveTab('collection')}
            className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-all flex items-center ${activeTab === 'collection' ? 'bg-white shadow-sm text-navy-900' : 'text-slate-500 hover:text-navy-600'}`}
          >
            <IndianRupee className="h-4 w-4 mr-2" /> Fee Collection
          </button>
          <button
            onClick={() => setActiveTab('dues')}
            className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-all flex items-center ${activeTab === 'dues' ? 'bg-white shadow-sm text-navy-900' : 'text-slate-500 hover:text-navy-600'}`}
          >
            <AlertCircle className="h-4 w-4 mr-2" /> Outstanding Dues
          </button>
        </div>
      </div>

      {activeTab === 'collection' && (
        <div className="card">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-white">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search student by ID or Name..."
                className="w-full pl-11 !rounded-xl !bg-slate-50 !border-slate-200"
              />
            </div>
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="!py-2 !px-4 !rounded-xl !bg-slate-50 !border-slate-200 !w-auto"
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="h-8 w-8 animate-spin text-navy-600" />
              </div>
            ) : filteredFees.length === 0 ? (
              <div className="text-center py-12 text-slate-500">No fee records found</div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Student Details</th>
                    <th>Class</th>
                    <th>Status</th>
                    <th className="text-right">Amount</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFees.map((fee) => (
                    <tr key={fee.id}>
                      <td>
                        <div className="font-semibold text-navy-900">{fee.student.name}</div>
                        <div className="text-xs text-slate-500 font-medium mt-0.5">ID: {fee.student.id}</div>
                      </td>
                      <td><span className="font-medium">{fee.student.class?.name}-{fee.student.section?.name}</span></td>
                      <td>
                        {fee.isPaid ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-green-50 text-xs font-bold text-green-700 border border-green-200">
                            <Check className="w-3.5 h-3.5 mr-1" /> Paid
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-amber-50 text-xs font-bold text-amber-700 border border-amber-200">Pending</span>
                        )}
                        <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-1.5">
                          Due: {new Date(fee.dueDate).toLocaleDateString('en-IN')}
                        </div>
                      </td>
                      <td className="font-display text-lg font-bold text-right text-navy-900">₹{fee.amount.toLocaleString('en-IN')}</td>
                      <td className="text-right">
                        {!fee.isPaid ? (
                          <button onClick={() => handleReceivePayment(fee)} className="btn btn-accent !px-4 !py-1.5 !text-xs whitespace-nowrap ml-auto">Receive Pay</button>
                        ) : (
                          <button onClick={() => generateReceipt(fee)} className="btn btn-outline !px-4 !py-1.5 !text-xs whitespace-nowrap flex items-center ml-auto">
                            <Printer className="w-3 h-3 mr-1" /> Receipt
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {activeTab === 'dues' && <OutstandingDues />}

      {selectedReceipt && <ReceiptModal receipt={selectedReceipt} onClose={() => setSelectedReceipt(null)} />}
    </div>
  );
}

function OutstandingDues() {
  const [outstanding, setOutstanding] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    feesApi.getOutstanding().then(setOutstanding).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div className="card">
      <div className="p-5 border-b border-slate-100 bg-white"><h2 className="text-lg font-bold text-navy-900">Outstanding Dues Summary</h2></div>
      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12"><Loader className="h-8 w-8 animate-spin text-navy-600" /></div>
        ) : outstanding.length === 0 ? (
          <div className="text-center py-12 text-slate-500">No outstanding dues</div>
        ) : (
          <table>
            <thead>
              <tr><th>Student</th><th>Class</th><th className="text-right">Total Due</th><th className="text-right">Pending Records</th></tr>
            </thead>
            <tbody>
              {outstanding.map((item, idx) => (
                <tr key={idx}>
                  <td><div className="font-semibold text-navy-900">{item.student.name}</div><div className="text-xs text-slate-500">ID: {item.student.id}</div></td>
                  <td>{item.student.class?.name}-{item.student.section?.name}</td>
                  <td className="text-right font-bold text-red-600">₹{item.totalDue.toLocaleString('en-IN')}</td>
                  <td className="text-right">{item.pendingCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function ReceiptModal({ receipt, onClose }) {
  return (
    <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 z-10"><X className="h-5 w-5" /></button>
        <div className="p-8 border-4 border-slate-100 m-2 relative bg-white">
          <div className="text-center relative z-10">
            <h2 className="text-xl font-bold text-navy-900 uppercase">VidyaERP Public School</h2>
            <p className="text-xs text-slate-600">Sector 14, New Delhi - 110001, India</p>
            <div className="inline-block border border-navy-900 px-3 py-1 mt-3 mb-4"><h3 className="text-sm font-bold tracking-widest text-navy-900 uppercase">FEE RECEIPT</h3></div>
          </div>
          <div className="flex justify-between text-xs mb-4">
            <div className="space-y-1">
              <p><span className="font-semibold text-slate-600">Receipt No:</span> {receipt.receiptNo}</p>
              <p><span className="font-semibold text-slate-600">Adm No:</span> {receipt.admNo}</p>
              <p><span className="font-semibold text-slate-600">Student:</span> <span className="font-bold text-navy-900">{receipt.studentName}</span></p>
              <p><span className="font-semibold text-slate-600">Class:</span> {receipt.classSec}</p>
            </div>
            <div className="space-y-1 text-right">
              <p><span className="font-semibold text-slate-600">Date:</span> {receipt.date}</p>
              <p><span className="font-semibold text-slate-600">Payment Mode:</span> {receipt.mode}</p>
            </div>
          </div>
          <table className="w-full text-sm border-collapse mb-4 relative z-10">
            <thead>
              <tr className="border-y border-navy-900 text-left">
                <th className="py-2 pl-2">S.No.</th>
                <th className="py-2">Particulars</th>
                <th className="py-2 pr-2 text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {receipt.particulars.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-2 pl-2 text-slate-500">{idx + 1}</td>
                  <td className="py-2 font-medium">{item.name}</td>
                  <td className="py-2 pr-2 text-right">{item.amount.toLocaleString('en-IN')}.00</td>
                </tr>
              ))}
              <tr className="border-t-2 border-slate-800">
                <td colSpan="2" className="py-3 text-right font-bold text-navy-900 uppercase">Total Amount:</td>
                <td className="py-3 pr-2 text-right font-bold text-navy-900">₹{receipt.total.toLocaleString('en-IN')}.00</td>
              </tr>
            </tbody>
          </table>
          <div className="flex justify-between items-end mt-12 mb-4">
            <div className="text-xs text-slate-500">*This is a computer-generated receipt.</div>
            <div className="text-center">
              <div className="border-t border-slate-600 w-32 pt-1 font-semibold text-xs text-slate-700">Cashier / Clerk</div>
            </div>
          </div>
        </div>
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-100">Close</button>
          <button className="flex items-center px-6 py-2 bg-saffron-500 text-white rounded-lg text-sm font-medium hover:bg-saffron-600"><Printer className="h-4 w-4 mr-2" /> Print PDF</button>
        </div>
      </div>
    </div>
  );
}
