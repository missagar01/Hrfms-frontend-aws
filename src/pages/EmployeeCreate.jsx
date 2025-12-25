import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Pencil, Trash2, UserPlus } from 'lucide-react';
import { createEmployee, deleteEmployee, getEmployees, updateEmployee } from '../api/employeeApi';
import { useAuth } from '../context/AuthContext';

const initialForm = {
  employee_code: '',
  employee_name: '',
  email: '',
  mobile_number: '',
  department: '',
  designation: '',
  role: 'User',
  status: 'Active',
  password: '',
};

const EmployeeCreate = () => {
  const [form, setForm] = useState(initialForm);
  const [employees, setEmployees] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [tableError, setTableError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const { token, user } = useAuth();

  const isAdmin = (user?.role || '').toLowerCase() === 'admin' || user?.Admin === 'Yes';
  const isEditing = Boolean(editingId);

  const getEmployeeId = (employee) => employee?.id ?? employee?._id ?? employee?.employee_id;

  const fetchEmployees = async () => {
    if (!token) {
      return;
    }

    setTableLoading(true);
    setTableError('');
    try {
      const response = await getEmployees(token);
      const data = response?.data ?? [];
      setEmployees(Array.isArray(data) ? data : []);
    } catch (error) {
      setTableError(error?.message || 'Failed to load employees.');
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [token]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!token) {
      toast.error('Please login again before creating employees.');
      return;
    }

    if (!isAdmin) {
      toast.error('Only admin users can manage employees.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = { ...form };
      if (isEditing && !payload.password) {
        delete payload.password;
      }

      const response = isEditing
        ? await updateEmployee(editingId, payload, token)
        : await createEmployee(payload, token);

      if (!response?.success) {
        toast.error(response?.message || 'Failed to create employee');
        return;
      }

      toast.success(isEditing ? 'Employee updated successfully' : 'Employee created successfully');
      setForm(initialForm);
      setEditingId(null);
      setShowForm(false);
      fetchEmployees();
    } catch (error) {
      toast.error(error?.message || 'Failed to create employee');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (employee) => {
    const employeeId = getEmployeeId(employee);
    if (!employeeId) {
      toast.error('Employee ID not found.');
      return;
    }

    setEditingId(employeeId);
    setForm({
      employee_code: employee?.employee_code ?? '',
      employee_name: employee?.employee_name ?? '',
      email: employee?.email ?? '',
      mobile_number: employee?.mobile_number ?? '',
      department: employee?.department ?? '',
      designation: employee?.designation ?? '',
      role: employee?.role ?? 'User',
      status: employee?.status ?? 'Active',
      password: '',
    });
    setShowForm(true);
  };

  const handleDelete = async (employee) => {
    const employeeId = getEmployeeId(employee);
    if (!employeeId) {
      toast.error('Employee ID not found.');
      return;
    }

    if (!window.confirm('Delete this employee?')) {
      return;
    }

    try {
      const response = await deleteEmployee(employeeId, token);
      if (!response?.success) {
        toast.error(response?.message || 'Failed to delete employee');
        return;
      }
      toast.success('Employee deleted successfully');
      fetchEmployees();
    } catch (error) {
      toast.error(error?.message || 'Failed to delete employee');
    }
  };

  const handleReset = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  return (
    <div className="min-h-screen py-6 sm:py-10">
      <div className="mx-auto w-full max-w-none space-y-6 px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-white p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600">Employee</p>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Employee Management</h1>
              <p className="mt-1 text-sm text-gray-500">Create, update, and manage employee access.</p>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-2 text-indigo-700">
              <UserPlus size={18} />
              <span className="text-sm font-semibold">HR FMS</span>
            </div>
          </div>

          {!isAdmin && (
            <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              This section is only available for admin users.
            </div>
          )}

          {isAdmin && (
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-indigo-50 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-indigo-700">Add employee</p>
                <p className="text-xs text-indigo-500">Use the button to open the form.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowForm((prev) => !prev)}
                className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-700"
              >
                {showForm ? 'Hide Form' : 'Add Employee'}
              </button>
            </div>
          )}
        </div>

        {isAdmin && showForm && (
          <div className="rounded-2xl bg-white p-6 sm:p-8 shadow-xl">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{isEditing ? 'Edit Employee' : 'Create Employee'}</h2>
                <p className="text-sm text-gray-500">
                  {isEditing ? 'Update employee information and access.' : 'Add a new employee to the system.'}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-gray-700" htmlFor="employee_code">Employee Code</label>
                  <input
                    id="employee_code"
                    name="employee_code"
                    value={form.employee_code}
                    onChange={handleChange}
                    required
                    className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    placeholder="S01111"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700" htmlFor="employee_name">Employee Name</label>
                  <input
                    id="employee_name"
                    name="employee_name"
                    value={form.employee_name}
                    onChange={handleChange}
                    required
                    className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    placeholder="Rupesh Sahu"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700" htmlFor="email">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    placeholder="rupesh@gmail.com"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700" htmlFor="mobile_number">Mobile Number</label>
                  <input
                    id="mobile_number"
                    name="mobile_number"
                    value={form.mobile_number}
                    onChange={handleChange}
                    required
                    className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    placeholder="8103490174"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700" htmlFor="department">Department</label>
                  <input
                    id="department"
                    name="department"
                    value={form.department}
                    onChange={handleChange}
                    required
                    className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    placeholder="IT"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700" htmlFor="designation">Designation</label>
                  <input
                    id="designation"
                    name="designation"
                    value={form.designation}
                    onChange={handleChange}
                    required
                    className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    placeholder="Developer"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700" htmlFor="role">Role</label>
                  <select
                    id="role"
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  >
                    <option value="User">User</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700" htmlFor="status">Status</label>
                  <select
                    id="status"
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-700" htmlFor="password">
                    Password {isEditing ? '(leave blank to keep current)' : ''}
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    required={!isEditing}
                    className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    placeholder={isEditing ? 'Keep existing password' : 'Create a secure password'}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:border-gray-400"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submitting ? 'Saving...' : isEditing ? 'Update Employee' : 'Create Employee'}
                </button>
              </div>
            </form>
          </div>
        )}

        {isAdmin && (
          <div className="rounded-2xl bg-white p-4 sm:p-6 shadow-xl">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Employee List</h2>
                <p className="text-sm text-gray-500">Manage all active employees from here.</p>
              </div>
            </div>

            <div className="mt-4 overflow-hidden rounded-xl border border-gray-200">
              <div className="max-h-[60vh] overflow-auto">
                <table className="min-w-[900px] w-full text-left text-sm">
                  <thead className="sticky top-0 z-10 bg-gray-50 text-xs uppercase text-gray-500">
                    <tr>
                      <th className="px-4 py-3">Code</th>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Mobile</th>
                      <th className="px-4 py-3">Department</th>
                      <th className="px-4 py-3">Designation</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {tableLoading && (
                      <tr>
                        <td colSpan="9" className="px-4 py-8 text-center text-sm text-gray-500">
                          Loading employees...
                        </td>
                      </tr>
                    )}

                    {!tableLoading && tableError && (
                      <tr>
                        <td colSpan="9" className="px-4 py-8 text-center text-sm text-red-500">
                          {tableError}
                        </td>
                      </tr>
                    )}

                    {!tableLoading && !tableError && employees.length === 0 && (
                      <tr>
                        <td colSpan="9" className="px-4 py-8 text-center text-sm text-gray-500">
                          No employees found.
                        </td>
                      </tr>
                    )}

                    {!tableLoading && !tableError && employees.map((employee) => {
                      const employeeId = getEmployeeId(employee);
                      return (
                        <tr key={employeeId ?? employee?.employee_code} className="hover:bg-gray-50">
                          <td className="px-4 py-3">{employee?.employee_code || '-'}</td>
                          <td className="px-4 py-3">{employee?.employee_name || '-'}</td>
                          <td className="px-4 py-3">{employee?.email || '-'}</td>
                          <td className="px-4 py-3">{employee?.mobile_number || '-'}</td>
                          <td className="px-4 py-3">{employee?.department || '-'}</td>
                          <td className="px-4 py-3">{employee?.designation || '-'}</td>
                          <td className="px-4 py-3">{employee?.role || '-'}</td>
                          <td className="px-4 py-3">
                            <span className={`rounded-full px-2 py-1 text-xs font-semibold ${employee?.status === 'Active'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-gray-100 text-gray-600'
                              }`}>
                              {employee?.status || '-'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => handleEdit(employee)}
                                className="inline-flex items-center gap-1 rounded-lg border border-indigo-200 px-2.5 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-50"
                              >
                                <Pencil size={14} />
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(employee)}
                                className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                              >
                                <Trash2 size={14} />
                                Delete
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
        )}
      </div>
    </div>
  );
};

export default EmployeeCreate;
