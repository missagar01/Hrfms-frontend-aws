import React, { useEffect } from "react";
import jwtDecode from "jwt-decode";
import { useAuth } from "./context/AuthContext";

function App() {
  const { login } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("masterToken");

    if (token) {
      try {
        const decoded = jwtDecode(token);

        // AuthContext ke through login karao
        login(decoded, token);

        // URL clean kar do
        window.history.replaceState({}, document.title, "/dashboard");
      } catch (err) {
        console.error("Invalid master token");
      }
    }
  }, [login]);

  return (
    <div className="gradient-bg min-h-screen">
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Toaster position="top-right" />
        <Routes>

          <Route path="/login" element={<Navigate to="http://localhost:5173/login" />} />

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
            <Route path="commercial-head-approval" element={<CommercialHeadApproval />} />
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
