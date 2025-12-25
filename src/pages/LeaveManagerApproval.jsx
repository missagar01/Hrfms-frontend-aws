import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { getLeaveRequests, updateLeaveRequest } from '../api/leaveRequestApi';
import { useAuth } from '../context/AuthContext';

const approverEmployeeCodes = new Set([
  'S00002',
  'S00016',
  'S00019',
  'S00037',
  'S00045',
  'S00116',
  'S00143',
  'S00151',
  'S00510',
  'S00658',
  'S04057',
  'S04631',
  'S05777',
  'S08132',
  'S08392',
  'S08495',
  'S08547',
  'S09505',
]);

const approverDepartmentOverrides = {
  S00002: [
    'CRUSHER',
    'SECURITY',
    'WORKSHOP',
    'STORE',
    'CRM',
    'TRANSPORT',
    'STRIP MILL ELECTRICAL',
    'ACCOUNTS',
    'PURCHASE',
    'INWARD',
    'WB',
    'SMS MAINTENANCE',
    'DISPATCH',
    'CCM ELECTRICAL',
    'PC',
    'HR',
    'AUTOMATION',
    'ADMIN',
  ],
  S00016: 'PIPE MILL PRODUCTION',
  S00019: 'PIPE MILL MAINTENANCE',
  S00037: 'PIPE MILL ELECTRICAL',
  S00045: 'PIPE MILL PRODUCTION',
  S00116: [
    'CRUSHER',
    'SECURITY',
    'WORKSHOP',
    'STORE',
    'CRM',
    'TRANSPORT',
    'STRIP MILL ELECTRICAL',
    'ACCOUNTS',
    'PURCHASE',
    'INWARD',
    'WB',
    'SMS MAINTENANCE',
    'DISPATCH',
    'CCM ELECTRICAL',
    'PC',
    'HR',
    'AUTOMATION',
    'PROJECT',
  ],
  S00143: 'MARKETING',
  S00151: 'PIPE MILL PRODUCTION',
  S00510: 'STRIP MILL ELECTRICAL',
  S00658: 'SMS MAINTENANCE',
  S04057: 'PIPE MILL PRODUCTION',
  S04631: 'STRIP MILL PRODUCTION',
  S05777: 'SMS ELECTRICAL',
  S08132: 'SMS PRODUCTION',
  S08392: 'CCM',
  S08547: 'LAB AND QUALITY CONTROL',
};

const LeaveManagerApproval = () => {
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [actionSelections, setActionSelections] = useState({});

  const normalizeValue = (value) =>
    (value || '')
      .toString()
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ');

  const approverName = useMemo(
    () => user?.employee_name || user?.Name || '',
    [user]
  );
  const approverCode = useMemo(
    () => user?.employee_code || user?.employeeCode || '',
    [user]
  );
  const approverDepartment = useMemo(
    () => user?.department || user?.Department || '',
    [user]
  );
  const effectiveDepartments = useMemo(() => {
    const override = approverDepartmentOverrides[approverCode];
    if (Array.isArray(override)) {
      const merged = new Set(override);
      if (approverDepartment) {
        merged.add(approverDepartment);
      }
      return Array.from(merged);
    }
    if (override) {
      return [override];
    }
    return approverDepartment ? [approverDepartment] : [];
  }, [approverDepartment, approverCode]);

  const canApprove = approverEmployeeCodes.has(approverCode);

  const fetchData = useCallback(async () => {
    if (!token) {
      setItems([]);
      return;
    }

    setLoading(true);
    try {
      const response = await getLeaveRequests(token);
      const data = Array.isArray(response?.data) ? response.data : [];
      const normalizedDepartments = new Set(
        effectiveDepartments.map(normalizeValue).filter(Boolean)
      );
      
      // Use exact match only for department filtering
      const filtered = data.filter((item) => {
        const itemDept = normalizeValue(item.department);
        if (!itemDept || normalizedDepartments.size === 0) {
          return false;
        }
        // Exact match only - no partial matching
        return normalizedDepartments.has(itemDept);
      });
      
      setItems(filtered);
      setActionSelections((prev) => {
        const next = { ...prev };
        filtered.forEach((item) => {
          if (!next[item.id]) {
            next[item.id] = 'Approved';
          }
        });
        return next;
      });
    } catch (error) {
      toast.error(error?.message || 'Failed to load leave requests.');
    } finally {
      setLoading(false);
    }
  }, [token, effectiveDepartments]);

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
      const selectedStatus = actionSelections[requestId] || 'Approved';
      const approvalLabel = selectedStatus === 'Rejected' ? 'Rejected' : 'Approved';
      const payload = {
        approved_by: approverName || null,
        approved_by_status: approvalLabel,
      };
      const response = await updateLeaveRequest(requestId, payload, token);
      if (!response?.success) {
        toast.error(response?.message || 'Approval failed');
        return;
      }
      toast.success(`Leave ${approvalLabel.toLowerCase()} successfully.`);
      fetchData();
    } catch (error) {
      toast.error(error?.message || 'Approval failed');
    }
  };

  return (
    <div className="min-h-screen py-6 sm:py-10">
      <div className="mx-auto w-full max-w-none space-y-6 px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-white p-6 sm:p-8 shadow-xl">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600">Leave Approval</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Approve Leave Requests</h1>
            <p className="mt-1 text-sm text-gray-500">Approve pending leave requests for your department.</p>
          </div>
          {!canApprove && (
            <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              You do not have access to approve leave requests.
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
                    <th className="sticky top-0 bg-gray-50 px-2 sm:px-4 py-3">Status</th>
                    <th className="sticky top-0 bg-gray-50 px-2 sm:px-4 py-3">HR Approval</th>
                    <th className="sticky top-0 bg-gray-50 px-2 sm:px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading && (
                    <tr>
                      <td colSpan="8" className="px-4 py-8 text-center text-sm text-gray-500">
                        Loading leave requests...
                      </td>
                    </tr>
                  )}

                  {!loading && items.length === 0 && (
                    <tr>
                      <td colSpan="8" className="px-4 py-8 text-center text-sm text-gray-500">
                        No leave requests found.
                      </td>
                    </tr>
                  )}

                  {!loading && items.map((item) => {
                    const approvalStatus = (item.approved_by_status || '').toLowerCase();
                    const isFinalized = approvalStatus === 'approved' || approvalStatus === 'rejected';
                    return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-2 sm:px-4 py-3">
                        <div className="font-medium text-gray-900 break-words">{item.employee_name || '-'}</div>
                        <div className="text-xs text-gray-500 break-words">{item.designation || '-'}</div>
                      </td>
                      <td className="px-2 sm:px-4 py-3 break-words">{item.department || '-'}</td>
                      <td className="px-2 sm:px-4 py-3 whitespace-nowrap">{item.from_date ? new Date(item.from_date).toLocaleDateString() : '-'}</td>
                      <td className="px-2 sm:px-4 py-3 whitespace-nowrap">{item.to_date ? new Date(item.to_date).toLocaleDateString() : '-'}</td>
                      <td className="px-2 sm:px-4 py-3 break-words max-w-xs">{item.reason || '-'}</td>
                      <td className="px-2 sm:px-4 py-3">{item.approved_by_status || item.request_status || '-'}</td>
                      <td className="px-2 sm:px-4 py-3">{item.hr_approval || '-'}</td>
                      <td className="px-2 sm:px-4 py-3">
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2">
                          <select
                            value={actionSelections[item.id] || 'Approved'}
                            onChange={(event) =>
                              setActionSelections((prev) => ({
                                ...prev,
                                [item.id]: event.target.value,
                              }))
                            }
                            className="w-full sm:w-auto rounded-lg border border-gray-300 px-2 py-1.5 text-xs text-gray-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                            disabled={!canApprove || isFinalized}
                          >
                            <option value="Approved">Approve</option>
                            <option value="Rejected">Reject</option>
                          </select>
                          <button
                            type="button"
                            onClick={() => handleApprove(item.id)}
                            disabled={!canApprove || isFinalized}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <CheckCircle size={14} />
                            Submit
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveManagerApproval;
