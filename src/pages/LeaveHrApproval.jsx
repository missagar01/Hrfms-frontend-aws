import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { getLeaveRequestsByStatus, updateLeaveRequest } from '../api/leaveRequestApi';
import { useAuth } from '../context/AuthContext';

const hrEmployeeCodes = new Set(['S08046', 'S09103']);

const LeaveHrApproval = () => {
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);

  const employeeCode = useMemo(
    () => user?.employee_code || user?.employeeCode || '',
    [user]
  );

  const canApprove = hrEmployeeCodes.has(employeeCode);

  const fetchData = useCallback(async () => {
    if (!token) {
      setItems([]);
      return;
    }

    setLoading(true);
    try {
      const response = await getLeaveRequestsByStatus('Approved', token);
      const data = Array.isArray(response?.data) ? response.data : [];
      setItems(data);
    } catch (error) {
      toast.error(error?.message || 'Failed to load leave approvals.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleApprove = async (requestId) => {
    if (!token) {
      toast.error('Please login again to approve.');
      return;
    }
    if (!canApprove) {
      toast.error('You are not allowed to approve requests.');
      return;
    }

    try {
      const payload = {
        hr_approval: 'Approved',
        request_status: 'Approved',
        approval_hr: employeeCode || null,
      };
      const response = await updateLeaveRequest(requestId, payload, token);
      if (!response?.success) {
        toast.error(response?.message || 'HR approval failed');
        return;
      }
      toast.success('HR approval saved.');
      fetchData();
    } catch (error) {
      toast.error(error?.message || 'HR approval failed');
    }
  };

  return (
    <div className="min-h-screen py-6 sm:py-10">
      <div className="mx-auto w-full max-w-none space-y-6 px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-white p-6 sm:p-8 shadow-xl">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600">HR Approval</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">HR Leave Approvals</h1>
            <p className="mt-1 text-sm text-gray-500">Review approved requests and confirm HR approval.</p>
          </div>
          {!canApprove && (
            <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              You do not have access to this page.
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-white p-4 sm:p-6 shadow-xl">
          <div className="mt-2 overflow-hidden rounded-xl border border-gray-200">
            <div className="max-h-[65vh] overflow-x-auto overflow-y-auto">
              <table className="min-w-full w-full text-left text-sm">
                <thead className="sticky top-0 z-20 bg-gray-50 text-xs uppercase text-gray-500 shadow-sm">
                  <tr>
                    <th className="sticky top-0 bg-gray-50 px-2 sm:px-4 py-3">Employee</th>
                    <th className="sticky top-0 bg-gray-50 px-2 sm:px-4 py-3">Department</th>
                    <th className="sticky top-0 bg-gray-50 px-2 sm:px-4 py-3">From</th>
                    <th className="sticky top-0 bg-gray-50 px-2 sm:px-4 py-3">To</th>
                    <th className="sticky top-0 bg-gray-50 px-2 sm:px-4 py-3">Reason</th>
                    <th className="sticky top-0 bg-gray-50 px-2 sm:px-4 py-3">Mobile Number</th>
                    <th className="sticky top-0 bg-gray-50 px-2 sm:px-4 py-3">Urgent Mobile Number</th>
                    <th className="sticky top-0 bg-gray-50 px-2 sm:px-4 py-3">Approved By</th>
                    <th className="sticky top-0 bg-gray-50 px-2 sm:px-4 py-3">Request Status</th>
                    <th className="sticky top-0 bg-gray-50 px-2 sm:px-4 py-3">HR Approval</th>
                    <th className="sticky top-0 bg-gray-50 px-2 sm:px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading && (
                    <tr>
                      <td colSpan="9" className="px-4 py-8 text-center text-sm text-gray-500">
                        Loading approvals...
                      </td>
                    </tr>
                  )}

                  {!loading && items.length === 0 && (
                    <tr>
                      <td colSpan="9" className="px-4 py-8 text-center text-sm text-gray-500">
                        No approved leave requests found.
                      </td>
                    </tr>
                  )}

                  {!loading && items.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-2 sm:px-4 py-3">
                        <div className="font-medium text-gray-900 break-words">{item.employee_name || '-'}</div>
                        <div className="text-xs text-gray-500 break-words">{item.designation || '-'}</div>
                      </td>
                      <td className="px-2 sm:px-4 py-3 break-words">{item.department || '-'}</td>
                      <td className="px-2 sm:px-4 py-3 whitespace-nowrap">{item.from_date ? new Date(item.from_date).toLocaleDateString() : '-'}</td>
                      <td className="px-2 sm:px-4 py-3 whitespace-nowrap">{item.to_date ? new Date(item.to_date).toLocaleDateString() : '-'}</td>
                      <td className="px-2 sm:px-4 py-3 break-words max-w-xs">{item.reason || '-'}</td>
                        <td className="px-2 sm:px-4 py-3 break-words max-w-xs">{item.mobilenumber || '-'}</td>
                          <td className="px-2 sm:px-4 py-3 break-words max-w-xs">{item.urgent_mobilenumber || '-'}</td>
                      <td className="px-2 sm:px-4 py-3 break-words">{item.approved_by || '-'}</td>
                      <td className="px-2 sm:px-4 py-3">{item.hr_approval || '-'}</td>
                      <td className="px-2 sm:px-4 py-3">{item.hr_approval || '-'}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => handleApprove(item.id)}
                            disabled={!canApprove || (item.hr_approval || '').toLowerCase() === 'approved'}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <CheckCircle size={14} />
                            Approve
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveHrApproval;
