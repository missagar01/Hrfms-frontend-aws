import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import MyProfile from "./pages/MyProfile";
import LeaveRequest from "./pages/LeaveRequest";
import ProtectedRoute from "./components/ProtectedRoute";
import LeaveManagerApproval from "./pages/LeaveManagerApproval";
import LeaveHrApproval from "./pages/LeaveHrApproval";
import EmployeeCreate from "./pages/EmployeeCreate";
import RequestCreate from "./pages/RequestCreate";
import TicketCreate from "./pages/TicketCreate";
import TravelStatus from "./pages/TravelStatus";
import ResumeCreate from "./pages/ResumeCreate";
import ResumeRequest from "./pages/ResumeRequest";
import ResumeList from "./pages/ResumeList";
import CandidateStatus from "./pages/CandidateStatusPage";
import SelectedCondidate from "./pages/SelectedCondidate";
import { useAuth } from "./context/AuthContext";
import PlaneVisitor from "./pages/PlantVisitor";
import PlantVisitorList from "./pages/PlantVisitorList";
import EmployeeDetailsPage from "./pages/EmployeeDetailsPage";

const RoleBasedHome = () => {
  const { user, isInitializing } = useAuth();

  if (isInitializing) {
    return null;
  }

  // Dashboard now handles role checking internally to show either AdminDashboard or UserDashboard
  return <Dashboard />;
};

function App() {
  return (
    <div className="gradient-bg min-h-screen">
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<RoleBasedHome />} />
            <Route path="resume-request" element={<ResumeRequest />} />
            <Route path="resume-list" element={<ResumeList />} />
            <Route path="employee-create" element={<EmployeeCreate />} />
            <Route path="employee-details/:employeeId" element={<EmployeeDetailsPage />} />
            <Route path="condidate-list" element={<CandidateStatus />} />
            <Route path="condidate-select" element={<SelectedCondidate />} />
            <Route path="requests" element={<RequestCreate />} />
            <Route path="tickets" element={<TicketCreate />} />
            <Route path="travel-status" element={<TravelStatus />} />
            <Route path="resumes" element={<ResumeCreate />} />
            <Route path="my-profile" element={<MyProfile />} />
            <Route path="leave-request" element={<LeaveRequest />} />
            <Route path="leave-approvals" element={<LeaveManagerApproval />} />
            <Route path="leave-hr-approvals" element={<LeaveHrApproval />} />
            <Route path="resume" element={<ResumeCreate />} />
            <Route path="plant-visitor" element={<PlaneVisitor />} />
            <Route path="plant-visitorlist" element={<PlantVisitorList />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
