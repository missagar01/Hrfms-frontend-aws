import React, { useMemo, useState } from 'react';
import { Menu } from 'lucide-react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';

const routeMetadata = {
  '/': {
    title: 'Dashboard',
    subtitle: 'Overview of HR approvals, travel requests, and tickets',
  },
  '/resume-request': {
    title: 'MainPower Request',
    subtitle: 'Create a request for MainPower resources',
  },
  '/resume-list': {
    title: 'MainPower List',
    subtitle: 'Track requested manpower and approvals',
  },
  '/employee-create': {
    title: 'Employee',
    subtitle: 'Add or update employee records',
  },
  '/condidate-list': {
    title: 'Candidate Status',
    subtitle: 'Monitor open candidate pipelines',
  },
  '/condidate-select': {
    title: 'Selected Candidate',
    subtitle: 'Review the confirmed candidate',
  },
  '/requests': {
    title: 'Travel Form',
    subtitle: 'Submit and manage travel requests',
  },
  '/tickets': {
    title: 'Tickets',
    subtitle: 'Track issued travel tickets',
  },
  '/travel-status': {
    title: 'Travel Status',
    subtitle: 'See the current state of travel bookings',
  },
  '/resumes': {
    title: 'Resume',
    subtitle: 'Upload or edit resume content',
  },
  '/my-profile': {
    title: 'My Profile',
    subtitle: 'View and manage your personal information',
  },
  '/leave-request': {
    title: 'Leave Request',
    subtitle: 'Apply for leave or view pending approvals',
  },
  '/leave-approvals': {
    title: 'Leave Approvals',
    subtitle: 'Approve or reject team leave requests',
  },
  '/leave-hr-approvals': {
    title: 'HR Approvals',
    subtitle: 'Review HR escalated leave requests',
  },
  '/commercial-head-approval': {
    title: 'Commercial Head Approval',
    subtitle: 'Review pending leave requests for Commercial Head approval',
  },
  '/resume': {
    title: 'Resume',
    subtitle: 'Upload or edit resume content',
  },
  '/plant-visitor': {
    title: 'Plant Visitor',
    subtitle: 'Register plant visitors quickly',
  },
  '/plant-visitorlist': {
    title: 'Plant Visitor List',
    subtitle: 'Review scheduled and past plant visitors',
  },
};

const prettifyPath = (path) => {
  if (!path || path === '/') {
    return 'Dashboard';
  }
  const parts = path.split('/').filter(Boolean);
  const slug = parts.length ? parts[parts.length - 1] : 'dashboard';
  return slug
    .split(/[-_]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  const pageDetails = useMemo(() => {
    const normalized = location.pathname.replace(/\/+$/, '') || '/';
    const metadata = routeMetadata[normalized];
    if (metadata) {
      return metadata;
    }
    return {
      title: prettifyPath(normalized),
      subtitle: 'Manage HR and travel activities from one place',
    };
  }, [location.pathname]);

  const displayName = user?.employee_name || user?.Name || user?.Username || 'Guest';
  const displayRole = user?.role
    ? `${user.role.charAt(0).toUpperCase()}${user.role.slice(1)}`
    : 'Employee';

  return (
    <div className="relative flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden lg:pl-64">
        <div className="rounded-b-[20px] md:rounded-b-[32px] bg-white px-3 py-4 shadow-xl sm:px-6 md:px-8 border border-gray-200">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="flex items-center gap-3 md:gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden rounded-full border border-indigo-200 bg-indigo-50 p-2 text-indigo-600 shadow-sm transition hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                <span className="sr-only">Open sidebar</span>
                <Menu size={20} />
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] md:text-xs font-semibold uppercase tracking-[0.3em] md:tracking-[0.5em] text-indigo-500">HR FMS</p>
                <div className="flex items-center justify-between">
                  <h1 className="mt-1 text-xl font-semibold leading-tight text-gray-900 sm:text-2xl md:text-4xl truncate">
                    {pageDetails.title}
                  </h1>

                  {/* Mobile Profile Icon/User Info could go here if needed, but let's keep it simple for now */}
                  <div className="md:hidden flex flex-col items-end text-right text-gray-700 ml-2">
                    <span className="text-xs font-semibold truncate max-w-[100px]">{displayName}</span>
                  </div>
                </div>

                {pageDetails.subtitle && (
                  <p className="mt-1 text-xs md:text-sm text-gray-600 truncate">{pageDetails.subtitle}</p>
                )}
              </div>
            </div>

            <div className="hidden md:flex flex-col items-end text-right text-gray-700 ml-auto">
              <span className="text-sm font-semibold">{displayName}</span>
              <span className="text-xs uppercase tracking-[0.4em] text-indigo-500">{displayRole}</span>
            </div>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto px-4 pb-8 pt-6 sm:px-6">
          <div className="w-full">
            <Outlet />
          </div>
        </main>

        <footer className="bg-white bg-opacity-90 border-t border-gray-200 py-3 px-4 text-center text-xs text-gray-600 shadow-inner sm:px-6">
          Powered by{' '}
          <a
            href="https://www.botivate.in"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-indigo-600 underline"
          >
            Botivate
          </a>
        </footer>
      </div>
    </div>
  );
};

export default Layout;



