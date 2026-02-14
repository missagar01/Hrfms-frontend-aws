import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle, Edit } from 'lucide-react';
import toast from 'react-hot-toast';
import { getLeaveRequests, updateLeaveRequest } from '../api/leaveRequestApi';
import { useAuth } from '../context/AuthContext';

const CommercialHeadApproval = () => {
    const { token, user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState([]);
    const [actionSelections, setActionSelections] = useState({});
    const [approvalModal, setApprovalModal] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);

    const normalizeValue = (value) =>
        (value || '')
            .toString()
            .trim()
            .toLowerCase()
            .replace(/\s+/g, ' ');

    const approverName = useMemo(
        () => user?.user_name || user?.employee_name || user?.Name || '',
        [user]
    );
    const approverDepartment = useMemo(
        () => user?.department || user?.Department || '',
        [user]
    );

    const isApproverAdmin = useMemo(() => {
        const dept = normalizeValue(approverDepartment);
        const role = normalizeValue(user?.role || user?.Role);
        // Allow Admin department, Admin role, or Commercial Head role to view all
        return dept === 'admin' || role === 'admin' || role.includes('commercial');
    }, [approverDepartment, user]);

    const effectiveDepartments = useMemo(() => {
        return approverDepartment ? [approverDepartment] : [];
    }, [approverDepartment]);

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

            // Filtering logic for Commercial Head
            const filtered = data.filter((item) => {
                // Must be approved by Manager first
                if (normalizeValue(item.approved_by_status) !== 'approved') {
                    return false;
                }

                // If admin, show all (except already finalized by Commercial Head)
                if (isApproverAdmin) {
                    const commercialStatus = normalizeValue(item.commercial_head_status);
                    return commercialStatus !== 'approved' && commercialStatus !== 'rejected';
                }

                const itemDept = normalizeValue(item.department);
                if (!itemDept || normalizedDepartments.size === 0) {
                    return false;
                }

                const commercialStatus = normalizeValue(item.commercial_head_status);
                if (commercialStatus === 'approved' || commercialStatus === 'rejected') {
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
    }, [token, effectiveDepartments, isApproverAdmin]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const formatDateForInput = (value) => {
        if (!value) {
            return '';
        }
        const parsed = new Date(value);
        if (Number.isNaN(parsed.getTime())) {
            return '';
        }
        // Use local date parts to avoid UTC timezone shifting
        const year = parsed.getFullYear();
        const month = String(parsed.getMonth() + 1).padStart(2, '0');
        const day = String(parsed.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const submitApproval = async ({ requestId, from_date, to_date }) => {
        if (!token) {
            toast.error('Please login again to approve.');
            return false;
        }
        const selectedStatus = actionSelections[requestId] || 'Approved';
        const approvalLabel = selectedStatus === 'Rejected' ? 'Rejected' : 'Approved';

        // For Commercial Head page, we update commercial_head_status
        const payload = {
            commercial_head_status: approvalLabel,
            // We don't necessarily want to update from/to date here unless the Commercial Head should be able to,
            // but keeping it consistent with the other page's UI for now.
            from_date: from_date || null,
            to_date: to_date || null,
        };

        try {
            const response = await updateLeaveRequest(requestId, payload, token);
            if (!response?.success) {
                toast.error(response?.message || 'Approval failed');
                return false;
            }
            toast.success(`Leave ${approvalLabel.toLowerCase()} successfully by Commercial Head.`);
            await fetchData();
            return true;
        } catch (error) {
            toast.error(error?.message || 'Approval failed');
            return false;
        }
    };

    const openApprovalModal = (item) => {
        if (!item) {
            return;
        }
        setApprovalModal({
            requestId: item.id,
            from_date: formatDateForInput(item.from_date),
            to_date: formatDateForInput(item.to_date),
        });
    };

    const closeApprovalModal = () => {
        setApprovalModal(null);
    };

    const handleModalFieldChange = (event) => {
        const { name, value } = event.target;
        setApprovalModal((prev) =>
            prev ? { ...prev, [name]: value } : prev
        );
    };

    const handleModalActionChange = (value) => {
        if (!approvalModal?.requestId) {
            return;
        }
        setActionSelections((prev) => ({
            ...prev,
            [approvalModal.requestId]: value,
        }));
    };

    const handleModalSubmit = async () => {
        if (!approvalModal?.requestId) {
            return;
        }
        setModalLoading(true);
        const success = await submitApproval(approvalModal);
        setModalLoading(false);
        if (success) {
            closeApprovalModal();
        }
    };

    return (
        <div className="min-h-screen py-6 sm:py-10">
            <div className="mx-auto w-full max-w-none space-y-6 px-4 sm:px-6 lg:px-8">
                <div className="rounded-2xl bg-white p-6 sm:p-8 shadow-xl">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600">Commercial Head Approval</p>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Approve Leave Requests</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            {isApproverAdmin ? 'Reviewing all pending leave requests.' : 'Reviewing pending leave requests for your department.'}
                        </p>
                    </div>
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
                                        <th className="sticky top-0 bg-gray-50 px-2 sm:px-4 py-3">Mobile</th>
                                        <th className="sticky top-0 bg-gray-50 px-2 sm:px-4 py-3">Created</th>
                                        <th className="sticky top-0 bg-gray-50 px-2 sm:px-4 py-3">HOD Status</th>
                                        <th className="sticky top-0 bg-gray-50 px-2 sm:px-4 py-3">CH Status</th>
                                        <th className="sticky top-0 bg-gray-50 px-2 sm:px-4 py-3 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {loading && (
                                        <tr>
                                            <td colSpan="10" className="px-4 py-8 text-center text-sm text-gray-500">
                                                Loading leave requests...
                                            </td>
                                        </tr>
                                    )}

                                    {!loading && items.length === 0 && (
                                        <tr>
                                            <td colSpan="10" className="px-4 py-8 text-center text-sm text-gray-500">
                                                No pending leave requests found for Commercial Head approval.
                                            </td>
                                        </tr>
                                    )}

                                    {!loading && items.map((item) => {
                                        const commercialStatus = (item.commercial_head_status || '').toLowerCase();
                                        const isFinalized = commercialStatus === 'approved' || commercialStatus === 'rejected';
                                        return (
                                            <tr key={item.id} className="hover:bg-gray-50">
                                                <td className="px-2 sm:px-4 py-3">
                                                    <div className="font-medium text-gray-900 break-words">{item.employee_name || item.user_name || '-'}</div>
                                                    <div className="text-xs text-gray-500 break-words">{item.designation || '-'}</div>
                                                </td>
                                                <td className="px-2 sm:px-4 py-3 break-words">{item.department || '-'}</td>
                                                <td className="px-2 sm:px-4 py-3 whitespace-nowrap">{item.from_date ? new Date(item.from_date).toLocaleDateString() : '-'}</td>
                                                <td className="px-2 sm:px-4 py-3 whitespace-nowrap">{item.to_date ? new Date(item.to_date).toLocaleDateString() : '-'}</td>
                                                <td className="px-2 sm:px-4 py-3 break-words max-w-xs">{item.reason || '-'}</td>
                                                <td className="px-2 sm:px-4 py-3 break-words max-w-xs">{item.mobilenumber || '-'}</td>
                                                <td className="px-2 sm:px-4 py-3 whitespace-nowrap text-xs text-gray-500">
                                                    {item.created_at ? new Date(item.created_at).toLocaleString('en-IN', {
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                        hour12: true
                                                    }) : '-'}
                                                </td>
                                                <td className="px-2 sm:px-4 py-3">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${normalizeValue(item.approved_by_status) === 'approved' ? 'bg-green-100 text-green-700' :
                                                        normalizeValue(item.approved_by_status) === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                        {item.approved_by_status || 'Pending'}
                                                    </span>
                                                </td>
                                                <td className="px-2 sm:px-4 py-3">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${commercialStatus === 'approved' ? 'bg-green-100 text-green-700' :
                                                        commercialStatus === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                        {item.commercial_head_status || 'Pending'}
                                                    </span>
                                                </td>
                                                <td className="px-2 sm:px-4 py-3">
                                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => openApprovalModal(item)}
                                                            disabled={isFinalized}
                                                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                                                        >
                                                            <Edit size={14} />
                                                            Approve
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
                {approvalModal && (
                    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 px-4 py-6">
                        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-lg font-semibold text-gray-900">Commercial Head Approval</p>
                                    <p className="text-sm text-gray-500">Update the leave duration before submitting.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={closeApprovalModal}
                                    className="text-gray-400 transition hover:text-gray-600"
                                >
                                    ✕
                                </button>
                            </div>
                            <div className="mt-4">
                                <label className="text-sm font-medium text-gray-700" htmlFor="modal_action">
                                    Action
                                </label>
                                <select
                                    id="modal_action"
                                    value={actionSelections[approvalModal.requestId] || 'Approved'}
                                    onChange={(event) => handleModalActionChange(event.target.value)}
                                    disabled={modalLoading}
                                    className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-700 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                >
                                    <option value="Approved">Approve</option>
                                    <option value="Rejected">Reject</option>
                                </select>
                            </div>
                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={closeApprovalModal}
                                    disabled={modalLoading}
                                    className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-gray-400 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleModalSubmit}
                                    disabled={modalLoading}
                                    className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {modalLoading ? 'Processing...' : 'Confirm'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommercialHeadApproval;
