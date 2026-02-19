import React, { useMemo } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Users,
  FileText as LeaveIcon,
  User as ProfileIcon,
  LogOut as LogOutIcon,
  X,
  User,
  ChevronDown,
  ChevronUp,
  NotebookPen,
  BadgeDollarSign,
  UserPlus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';


const Sidebar = ({ isOpen = false, onClose }) => {
  const { user, logout, pageAccess } = useAuth();
  const navigate = useNavigate();
  const closeSidebar = () => onClose?.();

  const isAdmin = (user?.role || '').toLowerCase() === 'admin' || user?.Admin === 'Yes';

  // Normalize page_access to array format
  const normalizePageAccess = (pageAccess) => {
    if (!pageAccess) return [];

    // If it's already an array, return it
    if (Array.isArray(pageAccess)) {
      return pageAccess.map(route => route.trim());
    }

    // If it's a string, try to parse as JSON first
    if (typeof pageAccess === 'string') {
      try {
        const parsed = JSON.parse(pageAccess);
        if (Array.isArray(parsed)) {
          return parsed.map(route => route.trim());
        }
      } catch {
        // If JSON parsing fails, treat as comma-separated string
        const cleaned = pageAccess
          .replace(/^\s*\[|\]\s*$/g, '')
          .replace(/^['"]|['"]$/g, '');
        return cleaned
          .split(',')
          .map(route => route.trim().replace(/^['"]|['"]$/g, ''))
          .filter(Boolean);
      }
    }

    return [];
  };

  // Check if a route is allowed for employee
  const isRouteAllowed = (route) => {
    if (isAdmin) return true; // Admin can access all routes

    const allowedRoutes = normalizePageAccess(pageAccess);
    if (allowedRoutes.length === 0) return false; // No page_access means no access

    // Normalize the route to check (ensure it starts with /)
    const normalizedRoute = route.startsWith('/') ? route : `/${route}`;

    // Check if route matches any allowed route (exact match)
    return allowedRoutes.some(allowedRoute => {
      // Normalize allowed route (ensure it starts with /)
      const normalizedAllowed = allowedRoute.startsWith('/') ? allowedRoute : `/${allowedRoute}`;

      // Exact match
      return normalizedRoute === normalizedAllowed;
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  // Define menu items - moved to top to avoid hoisting issues
  const adminMenuItems = useMemo(() => [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/employee-create', icon: UserPlus, label: 'Employee' },
    { path: '/leave-approvals', icon: LeaveIcon, label: 'Leave Approvals' },
    { path: '/commercial-head-approval', icon: LeaveIcon, label: 'Commercial Head' },
    { path: '/resume-list', icon: BadgeDollarSign, label: 'MainPower List' },
  ], []);

  const employeeMenuItems = useMemo(() => [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/my-profile', icon: ProfileIcon, label: 'My Profile' },
    { path: '/resume-request', icon: BadgeDollarSign, label: 'MainPower Request' },
    { path: '/requests', icon: NotebookPen, label: 'Travel Request' },
    { path: '/resumes', icon: FileText, label: 'Candidate Resume' },
    { path: '/resume-form', icon: FileText, label: 'Resume Upload' },
    { path: '/tickets', icon: BadgeDollarSign, label: 'Tickets' },
    { path: '/travel-status', icon: BadgeDollarSign, label: 'Travel Status' },
    { path: '/leave-request', icon: LeaveIcon, label: 'Leave Request' },
    { path: '/plant-visitor', icon: LeaveIcon, label: 'Plant Visitor' },
    { path: '/plant-visitorlist', icon: LeaveIcon, label: 'Plant Visitor List' },
    { path: '/leave-approvals', icon: LeaveIcon, label: 'Leave Approvals' },
    { path: '/commercial-head-approval', icon: LeaveIcon, label: 'Commercial Head' },
    { path: '/leave-hr-approvals', icon: LeaveIcon, label: 'HR Approvals' },
  ], []);



  // Filter menu items based on role and page_access
  const menuItems = useMemo(() => {
    // My Profile is always available to everyone and should be at the top
    const myProfileItem = { path: '/my-profile', icon: ProfileIcon, label: 'My Profile' };

    if (isAdmin) {
      // Admin sees all admin and employee menu items (remove duplicates by path)
      const allItems = [...adminMenuItems, ...employeeMenuItems];
      const uniqueItems = [];
      const seenPaths = new Set();

      // Always include My Profile at the top
      uniqueItems.push(myProfileItem);
      seenPaths.add('/my-profile');

      for (const item of allItems) {
        if (!seenPaths.has(item.path)) {
          seenPaths.add(item.path);
          uniqueItems.push(item);
        }
      }

      return uniqueItems;
    }

    // For employees, show My Profile plus accessible pages.
    const allowedRoutes = normalizePageAccess(pageAccess);
    const seenPaths = new Set();
    const filteredItems = [];

    // Always include My Profile first
    filteredItems.push(myProfileItem);
    seenPaths.add('/my-profile');

    const shouldSkipFiltering = allowedRoutes.length === 0;
    employeeMenuItems.forEach((item) => {
      if (item.path === '/my-profile') return;
      if (!shouldSkipFiltering) {
        const normalizedRoute = item.path.startsWith('/') ? item.path : `/${item.path}`;
        const isAllowed = allowedRoutes.some((allowedRoute) => {
          const normalizedAllowed = allowedRoute.startsWith('/') ? allowedRoute : `/${allowedRoute}`;
          return normalizedRoute === normalizedAllowed;
        });
        if (!isAllowed) {
          return;
        }
      }

      if (!seenPaths.has(item.path)) {
        seenPaths.add(item.path);
        filteredItems.push(item);
      }
    });

    return filteredItems;
  }, [isAdmin, adminMenuItems, employeeMenuItems, pageAccess]);

  const SidebarContent = ({ onClose, isCollapsed = false }) => (
    <div className={`flex flex-col h-full ${isCollapsed ? 'w-16' : 'w-64'} bg-indigo-900 text-white`}>
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-indigo-800">
        {!isCollapsed && (
          <h1 className="text-xl font-bold flex items-center gap-2 text-white">
            <Users size={24} />
            <span>HR FMS</span>
            {user?.role === 'employee' && (
              <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded">Employee</span>
            )}
          </h1>
        )}
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
          >
            <span className="sr-only">Close sidebar</span>
            <X className="h-6 w-6" />
          </button>
        )}
      </div>

      {/* Menu */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto scrollbar-hide">
        {menuItems.map((item) => {
          if (item.type === 'dropdown') {
            return (
              <div key={item.label}>
                <button
                  onClick={item.toggle}
                  className={`flex items-center justify-between w-full py-2.5 px-4 rounded-lg transition-colors ${item.isOpen
                    ? 'bg-indigo-800 text-white'
                    : 'text-indigo-100 hover:bg-indigo-800 hover:text-white'
                    }`}
                >
                  <div className="flex items-center">
                    <item.icon className={isCollapsed ? 'mx-auto' : 'mr-3'} size={20} />
                    {!isCollapsed && <span>{item.label}</span>}
                  </div>
                  {!isCollapsed && (item.isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
                </button>

                {item.isOpen && !isCollapsed && (
                  <div className="ml-6 mt-1 space-y-1">
                    {item.items.map((subItem) => (
                      <NavLink
                        key={subItem.path}
                        to={subItem.path}
                        className={({ isActive }) =>
                          `flex items-center py-2 px-4 rounded-lg transition-colors ${isActive
                            ? 'bg-indigo-700 text-white'
                            : 'text-indigo-100 hover:bg-indigo-800 hover:text-white'
                          }`
                        }
                        onClick={onClose}
                      >
                        <span>{subItem.label}</span>
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center py-2.5 px-4 rounded-lg transition-colors ${isActive
                  ? 'bg-indigo-800 text-white'
                  : 'text-indigo-100 hover:bg-indigo-800 hover:text-white'
                }`
              }
              onClick={onClose}
            >
              <item.icon className={isCollapsed ? 'mx-auto' : 'mr-3'} size={20} />
              {!isCollapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer - Always visible */}
      <div className="p-4 border-t border-white border-opacity-20">
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex items-center space-x-2 cursor-pointer">
            <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center">
              <User size={20} className="text-indigo-600" />
            </div>
            {/* Show user info in mobile view regardless of collapsed state */}
            <div className={`${isCollapsed ? 'hidden' : 'block'} md:block`}>
              <p className="text-sm font-medium text-white">{user?.user_name || user?.employee_name || user?.Name || user?.Username || 'Guest'}</p>
              <p className="text-xs text-white">{isAdmin ? 'Administrator' : 'Employee'}</p>

            </div>
          </div>
        </div>
        <button
          onClick={() => {
            handleLogout();
            onClose?.();
          }}
          className="flex items-center py-2.5 px-4 rounded-lg text-white opacity-80 hover:bg-white hover:bg-opacity-10 hover:opacity-100 cursor-pointer transition-colors w-full"
        >
          <LogOutIcon className={isCollapsed ? 'mx-auto' : 'mr-3'} size={20} />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar - full width on desktop */}
      <div className="hidden lg:block fixed left-0 top-0 h-full">
        <SidebarContent />
      </div>

      {/* Tablet Sidebar - collapsible */}
      <div className={`hidden md:block lg:hidden fixed inset-0 z-40 transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div
          className="fixed inset-0 bg-black bg-opacity-50"
          onClick={closeSidebar}
        />
        <div className={`fixed left-0 top-0 h-full z-50 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}>
          <SidebarContent onClose={closeSidebar} />
        </div>
      </div>

      {/* Mobile Sidebar - collapsible */}
      <div className={`md:hidden fixed inset-0 z-40 transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div
          className="fixed inset-0 bg-black bg-opacity-50"
          onClick={closeSidebar}
        />
        <div className={`fixed left-0 top-0 h-full z-50 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}>
          <SidebarContent onClose={closeSidebar} />
        </div>
      </div>

    </>
  );
};

export default Sidebar;


