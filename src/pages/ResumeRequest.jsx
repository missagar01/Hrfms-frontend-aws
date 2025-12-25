import React, { useMemo, useState, useEffect } from 'react';
import { Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { createRequest } from '../api/requestApi';
import { getDepartments } from '../api/employeeApi';
import { useAuth } from '../context/AuthContext';

const initialForm = {
  person_name: '',
  employee_code: '',

  // (keeping your extra fields as-is)
  type_of_travel: '',
  reason_for_travel: '',
  no_of_person: 1,
  from_date: '',
  to_date: '',
  departure_date: '',

  requester_name: '',
  requester_designation: '',
  requester_department: '',

  request_for: '',
  request_quantity: '',
  experience: '',
  education: '',
  remarks: '',
  request_status: 'Open',
};

const ResumeRequest = () => {
  const { user, token } = useAuth();

  const defaultEmployeeCode = user?.employee_code || '';
  const defaultPersonName = user?.employee_name || '';
  const defaultDesignation = user?.designation || '';

  const [form, setForm] = useState(() => ({
    ...initialForm,
    employee_code: defaultEmployeeCode,
    person_name: defaultPersonName,
    requester_name: defaultPersonName,
    requester_designation: defaultDesignation,
  }));

  const [submitting, setSubmitting] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);

  // ✅ keep form in sync if user loads later (AuthProvider async init)
  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      employee_code: prev.employee_code || defaultEmployeeCode,
      person_name: prev.person_name || defaultPersonName,
      requester_name: prev.requester_name || defaultPersonName,
      requester_designation: prev.requester_designation || defaultDesignation,
    }));
  }, [defaultEmployeeCode, defaultPersonName, defaultDesignation]);

  const employeeCodeValue = useMemo(
    () => form.employee_code || defaultEmployeeCode,
    [form.employee_code, defaultEmployeeCode]
  );

  const requesterNameValue = useMemo(
    () => form.requester_name || defaultPersonName,
    [form.requester_name, defaultPersonName]
  );

  const designationValue = useMemo(
    () => form.requester_designation || defaultDesignation,
    [form.requester_designation, defaultDesignation]
  );

  useEffect(() => {
    const fetchDepartments = async () => {
      setLoadingDepartments(true);
      try {
        const response = await getDepartments();
        if (response?.success && Array.isArray(response.data)) {
          setDepartments(response.data);
        } else {
          toast.error('Departments response invalid');
        }
      } catch (error) {
        console.error('Failed to fetch departments:', error);
        toast.error('Failed to load departments');
      } finally {
        setLoadingDepartments(false);
      }
    };
    fetchDepartments();
  }, []);

  const handleChange = (event) => {
    const { name, value, type } = event.target;

    // optional numeric conversion (safe)
    const nextValue =
      type === 'number' ? (value === '' ? '' : Number(value)) : value;

    setForm((prev) => ({
      ...prev,
      [name]: nextValue,

      // ✅ if requester_name changes, keep person_name also in sync (if backend uses it)
      ...(name === 'requester_name' ? { person_name: nextValue } : {}),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!token) {
      toast.error('Please login again to submit request.');
      return;
    }

    // Build payload with only provided values (remove empty strings)
    const buildPayload = () => {
      const payload = {};
      
      // Add fields only if they have values
      if (employeeCodeValue) payload.employee_code = employeeCodeValue;
      if (requesterNameValue) payload.requester_name = requesterNameValue;
      if (designationValue) payload.requester_designation = designationValue;
      if (form.requester_department) payload.requester_department = form.requester_department;
      if (form.request_for) payload.request_for = form.request_for;
      if (form.experience) payload.experience = form.experience;
      if (form.education) payload.education = form.education;
      if (form.remarks) payload.remarks = form.remarks;
      
      // Handle numeric fields - only include if they have valid values
      if (form.request_quantity !== '' && form.request_quantity !== null && form.request_quantity !== undefined) {
        payload.request_quantity = Number(form.request_quantity);
      }
      
      // Handle dates - only include if they have values
      if (form.from_date) payload.from_date = form.from_date;
      if (form.to_date) payload.to_date = form.to_date;
      if (form.departure_date) payload.departure_date = form.departure_date;
      
      // Handle other optional fields
      if (form.type_of_travel) payload.type_of_travel = form.type_of_travel;
      if (form.reason_for_travel) payload.reason_for_travel = form.reason_for_travel;
      if (form.no_of_person !== '' && form.no_of_person !== null && form.no_of_person !== undefined) {
        payload.no_of_person = Number(form.no_of_person);
      }
      
      // Ensure person_name is populated
      payload.person_name = form.person_name || requesterNameValue || employeeCodeValue;
      
      // Set default status if not provided
      payload.request_status = form.request_status || 'Open';
      
      return payload;
    };

    setSubmitting(true);
    try {
      const payload = buildPayload();

      const response = await createRequest(payload, token);

      if (!response?.success) {
        console.error('createRequest failed:', response);
        toast.error(response?.message || 'Failed to create request');
        return;
      }

      toast.success('Request submitted successfully!');

      setForm({
        ...initialForm,
        employee_code: defaultEmployeeCode,
        person_name: defaultPersonName,
        requester_name: defaultPersonName,
        requester_designation: defaultDesignation,
      });
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          'Failed to create request'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-6 sm:py-10">
      <div className="mx-auto w-full max-w-none space-y-6 px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-white p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Resume Request
              </h1>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl bg-white p-6 sm:p-8 shadow-xl">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="text-sm font-medium text-gray-700" htmlFor="employee_code">
                Employee Code
              </label>
              <input
                id="employee_code"
                name="employee_code"
                value={employeeCodeValue}
                onChange={handleChange}
                className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="S00001"
                readOnly={Boolean(defaultEmployeeCode)}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700" htmlFor="requester_name">
                Requester Name
              </label>
              <input
                id="requester_name"
                name="requester_name"
                value={requesterNameValue}
                onChange={handleChange}
                className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="Anita Verma"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700" htmlFor="requester_designation">
                Requester Designation
              </label>
              <input
                id="requester_designation"
                name="requester_designation"
                value={designationValue}
                onChange={handleChange}
                className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="Manager"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700" htmlFor="requester_department">
                Requester Department
              </label>
              <select
                id="requester_department"
                name="requester_department"
                value={form.requester_department}
                onChange={handleChange}
                disabled={loadingDepartments}
                className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">
                  {loadingDepartments ? 'Loading...' : 'Select Department'}
                </option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700" htmlFor="request_for">
                Request For
              </label>
              <input
                id="request_for"
                name="request_for"
                value={form.request_for}
                onChange={handleChange}
                className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="Laptop"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700" htmlFor="request_quantity">
                Request Quantity
              </label>
              <input
                id="request_quantity"
                name="request_quantity"
                type="number"
                min="1"
                value={form.request_quantity}
                onChange={handleChange}
                className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700" htmlFor="experience">
                Experience
              </label>
              <input
                id="experience"
                name="experience"
                value={form.experience}
                onChange={handleChange}
                className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="5 years"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700" htmlFor="education">
                Education
              </label>
              <input
                id="education"
                name="education"
                value={form.education}
                onChange={handleChange}
                className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="B.Tech"
              />
            </div>

            <div className="md:col-span-2 lg:col-span-3">
              <label className="text-sm font-medium text-gray-700" htmlFor="remarks">
                Remarks
              </label>
              <textarea
                id="remarks"
                name="remarks"
                value={form.remarks}
                onChange={handleChange}
                rows={3}
                className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="Urgent"
              />
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="submit"
              disabled={submitting || loadingDepartments}
              className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <Send size={16} className="mr-2" />
              {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResumeRequest;
