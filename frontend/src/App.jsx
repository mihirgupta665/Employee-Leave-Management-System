import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import ApplyLeavePage from "./pages/ApplyLeavePage";
import LeaveHistoryPage from "./pages/LeaveHistoryPage";
import EmployeeAnalyticsPage from "./pages/EmployeeAnalyticsPage";
import EmployeeTicketsPage from "./pages/EmployeeTicketsPage";
import ManagerDashboard from "./pages/ManagerDashboard";
import ManagerAnalyticsPage from "./pages/ManagerAnalyticsPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminAnalyticsPage from "./pages/AdminAnalyticsPage";
import AdminTicketsPage from "./pages/AdminTicketsPage";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import { useAuth } from "./context/AuthContext";

const HomeRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "admin") return <Navigate to="/admin" replace />;
  if (user.role === "manager") return <Navigate to="/manager" replace />;
  return <Navigate to="/employee" replace />;
};

const App = () => (
  <Routes>
    <Route path="/" element={<HomeRedirect />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/unauthorized" element={<UnauthorizedPage />} />

    <Route
      path="/employee"
      element={
        <ProtectedRoute roles={["employee"]}>
          <EmployeeDashboard />
        </ProtectedRoute>
      }
    />
    <Route
      path="/employee/apply"
      element={
        <ProtectedRoute roles={["employee"]}>
          <ApplyLeavePage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/employee/history"
      element={
        <ProtectedRoute roles={["employee"]}>
          <LeaveHistoryPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/employee/analytics"
      element={
        <ProtectedRoute roles={["employee"]}>
          <EmployeeAnalyticsPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/employee/tickets"
      element={
        <ProtectedRoute roles={["employee"]}>
          <EmployeeTicketsPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/manager"
      element={
        <ProtectedRoute roles={["manager"]}>
          <ManagerDashboard />
        </ProtectedRoute>
      }
    />
    <Route
      path="/manager/analytics"
      element={
        <ProtectedRoute roles={["manager"]}>
          <ManagerAnalyticsPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/admin"
      element={
        <ProtectedRoute roles={["admin"]}>
          <AdminDashboard />
        </ProtectedRoute>
      }
    />
    <Route
      path="/admin/analytics"
      element={
        <ProtectedRoute roles={["admin"]}>
          <AdminAnalyticsPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/admin/tickets"
      element={
        <ProtectedRoute roles={["admin"]}>
          <AdminTicketsPage />
        </ProtectedRoute>
      }
    />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default App;
