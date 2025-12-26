import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { createEmployee, getDepartments, getDesignations } from '../api/employeeApi';

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

const Signup = () => {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [loadingLists, setLoadingLists] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const loadLists = async () => {
      setLoadingLists(true);
      try {
        const [deptResponse, desigResponse] = await Promise.all([
          getDepartments(),
          getDesignations()
        ]);

        if (!isMounted) {
          return;
        }

        setDepartments(Array.isArray(deptResponse?.data) ? deptResponse.data : []);
        setDesignations(Array.isArray(desigResponse?.data) ? desigResponse.data : []);
      } catch (error) {
        if (isMounted) {
          toast.error(error?.message || 'Failed to load department/designation list');
        }
      } finally {
        if (isMounted) {
          setLoadingLists(false);
        }
      }
    };

    loadLists();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const response = await createEmployee(form);
      if (!response?.success) {
        toast.error(response?.message || 'Registration failed');
        return;
      }
      toast.success('Registration successful. Please login.');
      setForm(initialForm);
      navigate('/login', { replace: true });
    } catch (error) {
      toast.error(error?.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-white via-slate-50 to-indigo-50">
      <div className="w-full max-w-3xl rounded-2xl border border-white/60 bg-white/80 p-8 shadow-2xl backdrop-blur-xl">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center">
              <Users className="h-8 w-8 text-indigo-700" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-indigo-700">Create Account</h2>
          <p className="mt-2 text-sm text-indigo-700 opacity-80">
            Human Resource & File Management System
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-indigo-700" htmlFor="employee_code">Employee Code</label>
              <input
                id="employee_code"
                name="employee_code"
                value={form.employee_code}
                onChange={handleChange}
                required
                className="mt-2 w-full rounded-lg border border-indigo-200 bg-white/70 px-3 py-2 text-sm text-indigo-800 shadow-sm focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="EMP001"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-indigo-700" htmlFor="employee_name">Employee Name</label>
              <input
                id="employee_name"
                name="employee_name"
                value={form.employee_name}
                onChange={handleChange}
                required
                className="mt-2 w-full rounded-lg border border-indigo-200 bg-white/70 px-3 py-2 text-sm text-indigo-800 shadow-sm focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="Rupesh Sahu"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-indigo-700" htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                className="mt-2 w-full rounded-lg border border-indigo-200 bg-white/70 px-3 py-2 text-sm text-indigo-800 shadow-sm focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="rupesh@gmail.com"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-indigo-700" htmlFor="mobile_number">Mobile Number</label>
              <input
                id="mobile_number"
                name="mobile_number"
                value={form.mobile_number}
                onChange={handleChange}
                required
                className="mt-2 w-full rounded-lg border border-indigo-200 bg-white/70 px-3 py-2 text-sm text-indigo-800 shadow-sm focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="8103678174"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-indigo-700" htmlFor="department">Department</label>
              <input
                id="department"
                name="department"
                list="department-list"
                value={form.department}
                onChange={handleChange}
                required
                className="mt-2 w-full rounded-lg border border-indigo-200 bg-white/70 px-3 py-2 text-sm text-indigo-800 shadow-sm focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder={loadingLists ? 'Loading departments...' : 'Select department'}
              />
              <datalist id="department-list">
                {departments.map((item) => (
                  <option key={item} value={item} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="text-sm font-medium text-indigo-700" htmlFor="designation">Designation</label>
              <input
                id="designation"
                name="designation"
                list="designation-list"
                value={form.designation}
                onChange={handleChange}
                required
                className="mt-2 w-full rounded-lg border border-indigo-200 bg-white/70 px-3 py-2 text-sm text-indigo-800 shadow-sm focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder={loadingLists ? 'Loading designations...' : 'Select designation'}
              />
              <datalist id="designation-list">
                {designations.map((item) => (
                  <option key={item} value={item} />
                ))}
              </datalist>
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-indigo-700" htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                required
                className="mt-2 w-full rounded-lg border border-indigo-200 bg-white/70 px-3 py-2 text-sm text-indigo-800 shadow-sm focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="Create a password"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-indigo-600">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-indigo-700 underline">
                Login
              </Link>
            </p>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-indigo-700 px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-indigo-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? 'Submitting...' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
