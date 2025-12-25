import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, User, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { loginEmployee } from '../api/employeeApi';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [employeeCode, setEmployeeCode] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await loginEmployee({
        employee_code: employeeCode,
        password,
      });

      if (!response?.success) {
        toast.error(response?.message || 'Login failed');
        return;
      }

      const { token, employee } = response.data || {};
      if (!token || !employee) {
        toast.error('Login response is missing required data');
        return;
      }

      login(employee, token);
      toast.success('Login successful!');
      const ticketOnlyCodes = ['S09191', 'S03835'];
      const loggedEmployeeCode = employee?.employee_code || '';
      navigate(ticketOnlyCodes.includes(loggedEmployeeCode) ? '/tickets' : '/', { replace: true });
    } catch (err) {
      toast.error(err?.message || 'Network error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-white via-slate-50 to-indigo-50">
      <div className="max-w-md w-full space-y-8 rounded-2xl border border-white/60 bg-white/80 p-8 shadow-2xl backdrop-blur-xl">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center">
              <Users className="h-8 w-8 text-indigo-700" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-indigo-700">HR FMS</h2>
          <p className="mt-2 text-sm text-indigo-700 opacity-80">
            Human Resource & File Management System
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="employeeCode" className="sr-only">Employee Code</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-indigo-700" />
                </div>
                <input
                  id="employeeCode"
                  name="employeeCode"
                  type="text"
                  required
                  value={employeeCode}
                  onChange={(e) => setEmployeeCode(e.target.value)}
                  className="appearance-none relative block w-full pl-10 pr-3 py-3 border-gray-500 border text-indigo-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-700 focus:border-white focus:z-10 sm:text-sm bg-white bg-opacity-10"
                  placeholder="Employee Code"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-indigo-700" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-500 text-indigo-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-700 focus:border-white focus:z-10 sm:text-sm bg-white bg-opacity-10"
                  placeholder="Password"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <button
              type="submit"
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-all duration-200 ${submitting ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              disabled={submitting}
            >
              {submitting ? (
                <div className="flex items-center">
                  <svg
                    className="animate-spin h-4 w-4 text-white mr-2"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Sign in....</span>
                </div>
              ) : 'Sign in'}
            </button>
            <div className="text-center text-sm text-indigo-600">
              <span>Don't have an account?</span>{' '}
              <Link to="/signup" className="font-semibold text-indigo-700 underline">
                Sign up
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
