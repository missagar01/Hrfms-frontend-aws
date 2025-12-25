import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  TrendingUp,
  UserPlus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getDashboardStats } from '../api/dashboardApi';

const STATUS_COLORS = ['#10B981', '#EF4444', '#3B82F6', '#6366F1', '#F59E0B'];

const Dashboard = () => {
  const { token } = useAuth();
  const [summary, setSummary] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    resignedEmployees: 0,
    leftThisMonth: 0
  });
  const [statusDistribution, setStatusDistribution] = useState([]);
  const [monthlyHiringData, setMonthlyHiringData] = useState([]);
  const [designationData, setDesignationData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await getDashboardStats(token);
        if (!isMounted) return;

        const payload = response?.data ?? {};
        const summaryPayload = payload.summary ?? {};

        setSummary({
          totalEmployees: summaryPayload.totalEmployees ?? 0,
          activeEmployees: summaryPayload.activeEmployees ?? 0,
          resignedEmployees: summaryPayload.resignedEmployees ?? 0,
          leftThisMonth: summaryPayload.leftThisMonth ?? 0
        });

        setStatusDistribution(Array.isArray(payload.statusDistribution) ? payload.statusDistribution : []);
        setMonthlyHiringData(Array.isArray(payload.monthlyHiringVsAttrition) ? payload.monthlyHiringVsAttrition : []);
        setDesignationData(Array.isArray(payload.designationCounts) ? payload.designationCounts : []);
      } catch (loadError) {
        if (!isMounted) return;
        setError(loadError.message || 'Failed to load dashboard data');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const summaryCards = [
    {
      label: 'Total Employees',
      value: summary.totalEmployees,
      icon: Users,
      gradient: 'linear-gradient(135deg, #E0F2FE 0%, #EFF6FF 100%)',
      iconBg: 'bg-blue-200 text-blue-600'
    },
    {
      label: 'Active Employees',
      value: summary.activeEmployees,
      icon: UserCheck,
      gradient: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
      iconBg: 'bg-emerald-200 text-emerald-600'
    },
    {
      label: 'On Resigned',
      value: summary.resignedEmployees,
      icon: Clock,
      gradient: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
      iconBg: 'bg-amber-200 text-amber-600'
    },
    {
      label: 'Left This Month',
      value: summary.leftThisMonth,
      icon: UserX,
      gradient: 'linear-gradient(135deg, #FDF2F8 0%, #FCE7F3 100%)',
      iconBg: 'bg-rose-200 text-rose-600'
    }
  ];

  const pieData = statusDistribution.length
    ? statusDistribution.map((entry, index) => ({
        name: entry.label,
        value: entry.value,
        color: STATUS_COLORS[index % STATUS_COLORS.length]
      }))
    : [
        { name: 'Active', value: summary.activeEmployees, color: '#10B981' },
        { name: 'Resigned', value: summary.resignedEmployees, color: '#EF4444' }
      ];

  return (
    <div className="space-y-6 page-content p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">HR Dashboard</h1>
      </div>

      {loading && (
        <p className="text-sm text-gray-500">Loading dashboard data…</p>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryCards.map(({ label, value, icon: Icon, gradient, iconBg }) => (
          <div
            key={label}
            className="rounded-xl shadow-lg border p-6 flex items-start border-white/60"
            style={{ backgroundImage: gradient }}
          >
            <div
              className={`${iconBg} rounded-full p-3 mr-4 w-12 h-12 flex items-center justify-center`}
            >
              <Icon size={24} className="text-current" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">{label}</p>
              <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg border p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
            <Users size={20} className="mr-2" />
            Employee Status Distribution
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ color: '#374151' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
            <TrendingUp size={20} className="mr-2" />
            Monthly Hiring vs Attrition
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyHiringData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                <XAxis dataKey="month" stroke="#374151" />
                <YAxis stroke="#374151" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    color: '#374151'
                  }}
                />
                <Legend wrapperStyle={{ color: '#374151' }} />
                <Bar dataKey="hired" name="Hired" fill="#10B981" />
                <Bar dataKey="left" name="Left" fill="#EF4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg border p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
          <UserPlus size={20} className="mr-2" />
          Designation-wise Employee Count
        </h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={designationData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
              <XAxis dataKey="designation" stroke="#374151" />
              <YAxis stroke="#374151" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  color: '#374151'
                }}
              />
              <Bar dataKey="employees" name="Employees">
                {designationData.map((entry, index) => (
                  <Cell
                    key={`designation-${index}`}
                    fill={
                      index % 3 === 0
                        ? '#EF4444'
                        : index % 3 === 1
                        ? '#10B981'
                        : '#3B82F6'
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
