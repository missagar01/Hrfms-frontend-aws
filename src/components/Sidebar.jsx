import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Globe,
  Search,
  Phone,
  UserCheck,
  UserX,
  UserMinus,
  AlarmClockCheck,
  Users,
  Calendar,
  DollarSign,
  FileText as LeaveIcon,
  User as ProfileIcon,
  Clock,
  LogOut as LogOutIcon,
  X,
  User,
  Menu,
  ChevronDown,
  ChevronUp,
  NotebookPen,
  Book,
  BadgeDollarSign,
  BookPlus,
  UserPlus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [attendanceOpen, setAttendanceOpen] = useState(false);

  const isAdmin = (user?.role || '').toLowerCase() === 'admin' || user?.Admin === 'Yes';

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });

  };

  const adminMenuItemsBase = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/employee-create', icon: UserPlus, label: 'Employee' },
    { path: '/leave-approvals', icon: LeaveIcon, label: 'Leave Approvals' },
    { path: '/resume-list', icon: BadgeDollarSign, label: 'MainPower List' },
  ];

  const allowedTicketCodes = ['S09191', 'S03835'];
  const canSeeTickets = allowedTicketCodes.includes(user?.employee_code || '');
  const resumeCreatorCodes = ['S09191'];
  const canCreateResume = resumeCreatorCodes.includes(user?.employee_code || '');
  const approverEmployeeCodes = [
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
  ];
  const canApproveLeaves = approverEmployeeCodes.includes(user?.employee_code || '');
  const hrEmployeeCodes = ['S08046', 'S09103'];
  const canApproveHrLeaves = hrEmployeeCodes.includes(user?.employee_code || '');
  const adminMenuItems = canApproveHrLeaves
    ? [...adminMenuItemsBase, { path: '/leave-hr-approvals', icon: LeaveIcon, label: 'HR Approvals' }]
    : adminMenuItemsBase;

  const employeeMenuItems = [
    // { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/my-profile', icon: ProfileIcon, label: 'My Profile' },
    // { path: '/my-attendance', icon: Clock, label: 'My Attendance' },
    { path: '/resume-request', icon: BadgeDollarSign, label: 'MainPower Request' },
    { path: '/requests', icon: NotebookPen, label: 'Travel Form' },
    ...(canCreateResume ? [{ path: '/resume-create', icon: FileText, label: 'Resume' }] : []),
    ...(canSeeTickets
      ? [
          { path: '/tickets', icon: BadgeDollarSign, label: 'Tickets' },
          { path: '/travel-status', icon: BadgeDollarSign, label: 'Travel Status' },
          { path: '/resume', icon: BadgeDollarSign, label: 'MainPower Request' },
          { path: '/resume-list', icon: BadgeDollarSign, label: 'Resume List' },
          { path: '/condidate-list', icon: BadgeDollarSign, label: 'Interviwer List' },
          { path: '/condidate-select', icon: BadgeDollarSign, label: 'Selected Condidate' },
        ]
      : []),
    { path: '/leave-request', icon: LeaveIcon, label: 'Leave Request' },
    ...(canApproveLeaves ? [{ path: '/leave-approvals', icon: LeaveIcon, label: 'Leave Approvals' }] : []),
    ...(canApproveHrLeaves ? [{ path: '/leave-hr-approvals', icon: LeaveIcon, label: 'HR Approvals' }] : []),
    // { path: '/my-salary', icon: DollarSign, label: 'My Salary' },
    // { path: '/company-calendar', icon: Calendar, label: 'Company Calendar' },
  ];

  const menuItems = isAdmin ? adminMenuItems : employeeMenuItems;

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
              <p className="text-sm font-medium text-white">{user?.employee_name || user?.Name || user?.Username || 'Guest'}</p>
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
      {/* Mobile menu button - visible only on mobile */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-indigo-900 text-white rounded-md shadow-md"
        onClick={() => setIsOpen(true)}
      >
        <Menu size={24} />
      </button>

      {/* Tablet menu button - visible on tablet (hidden on mobile and desktop) */}
      <button
        className="hidden md:block lg:hidden fixed top-4 left-4 z-50 p-2 bg-indigo-900 text-white rounded-md shadow-md"
        onClick={() => setIsOpen(true)}
      >
        <Menu size={24} />
      </button>

      {/* Desktop Sidebar - full width on desktop */}
      <div className="hidden lg:block fixed left-0 top-0 h-full">
        <SidebarContent />
      </div>

      {/* Tablet Sidebar - collapsible */}
      <div className={`hidden md:block lg:hidden fixed inset-0 z-40 transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div
          className="fixed inset-0 bg-black bg-opacity-50"
          onClick={() => setIsOpen(false)}
        />
        <div className={`fixed left-0 top-0 h-full z-50 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}>
          <SidebarContent />
        </div>
      </div>

      {/* Mobile Sidebar - collapsible */}
      <div className={`md:hidden fixed inset-0 z-40 transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div
          className="fixed inset-0 bg-black bg-opacity-50"
          onClick={() => setIsOpen(false)}
        />
        <div className={`fixed left-0 top-0 h-full z-50 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}>
          <SidebarContent />
        </div>
      </div>

      {/* Add padding to main content when sidebar is open on desktop */}
      <div className="lg:pl-64"></div>
    </>
  );
};

export default Sidebar;
