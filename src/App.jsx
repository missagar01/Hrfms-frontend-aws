import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Leaving from './pages/Leaving';
import Employee from './pages/Employee';
import MyProfile from './pages/MyProfile';
import MyAttendance from './pages/MyAttendance';
import LeaveRequest from './pages/LeaveRequest';
import CompanyCalendar from './pages/CompanyCalendar';
import ProtectedRoute from './components/ProtectedRoute';
import LeaveManagement from './pages/LeaveManagement';
import LeaveManagerApproval from './pages/LeaveManagerApproval';
import LeaveHrApproval from './pages/LeaveHrApproval';
import EmployeeCreate from './pages/EmployeeCreate';
import RequestCreate from './pages/RequestCreate';
import TicketCreate from './pages/TicketCreate';
import TravelStatus from './pages/TravelStatus';
import ResumeCreate from './pages/ResumeCreate';
import ResumeRequest from './pages/ResumeRequest';
import ResumeList from './pages/ResumeList';
import CandidateStatus from './pages/CandidateStatusPage';
import SelectedCondidate from './pages/SelectedCondidate';
import { useAuth } from './context/AuthContext';

const RoleBasedHome = () => {
  const { user, isInitializing } = useAuth();

  if (isInitializing) {
    return null;
  }

  const isAdmin = (user?.role || '').toLowerCase() === 'admin' || user?.Admin === 'Yes';

  if (isAdmin) {
    return <Dashboard />;
  }

  return <Navigate to="/my-profile" replace />;
};

function App() {
  return (
    <div className="gradient-bg min-h-screen">
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<RoleBasedHome />} />
            <Route path="leaving" element={<Leaving />} />
            <Route path="employee" element={<Employee />} />
             <Route path="resume-request" element={<ResumeRequest />} />
             <Route path="resume-list" element={<ResumeList />} />
            <Route path="employee-create" element={<EmployeeCreate />} />
             <Route path="condidate-list" element={<CandidateStatus />} />
              <Route path="condidate-select" element={<SelectedCondidate />} />
            <Route path="requests" element={<RequestCreate />} />
            <Route path="tickets" element={<TicketCreate />} />
            <Route path="travel-status" element={<TravelStatus />} />
            <Route path="resumes" element={<ResumeCreate />} />
            <Route path="my-profile" element={<MyProfile />} />
            <Route path="my-attendance" element={<MyAttendance />} />
            <Route path="leave-request" element={<LeaveRequest />} />
            <Route path="company-calendar" element={<CompanyCalendar />} />
            <Route path="leave-management" element={<LeaveManagement />} />
            <Route path="leave-approvals" element={<LeaveManagerApproval />} />
            <Route path="leave-hr-approvals" element={<LeaveHrApproval />} />
              <Route path="resume" element={<ResumeCreate />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
