import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Layout from "./components/Layout/Layout";
import { Navigate, Route, Routes } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import ProtectedRoute from "./components/Layout/ProtectedRoute";
import PatientDashboard from "./pages/dashboard/PatientDashboard";
import DoctorDashboard from "./pages/dashboard/DoctorDashboard";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import DoctorSearch from "./pages/doctors/DoctorSearch";
import DoctorRegister from "./pages/doctors/DoctorRegister";
import { Toaster } from "sonner";
import DoctorApproval from "./pages/admin/DoctorApproval";
import UserProfile from "./pages/profile/UserProfile";
import Settings from "./pages/setting/Settings";
import Reviews from "./pages/Review/Reviews";
import Chat from "./pages/chat/Chat";
import DoctorAppointment from "./pages/appointments/DoctorAppointment";
import DoctorPatients from "./pages/doctors/DoctorPatients";
import DoctorEarning from "./pages/doctors/DoctorEarning";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import NotFound from "./pages/NotFound";
import DoctorReview from "./pages/Review/DoctorReview";
import DoctorSetting from "./pages/setting/DoctorSetting";
import PatientAppointment from "./pages/appointments/PatientAppointment";
import DoctorSlotManager from "./components/Doctors/DoctorSlotManger";
import DoctorProfile from "./pages/doctors/DoctorProfile";
import { SocketProvider } from "./contexts/SocketContext";
import ChatList from "./pages/chat/ChatList";
import DoctorDetailsProfile from "./pages/doctors/DoctorDetailsProfile";
import DoctorProfileEdit from "./pages/doctors/DoctorProfileEdit";

// Role-based redirect component
const RoleBasedRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) return <Navigate to="/login" replace />;

  switch (user?.role) {
    case "user":
      return <Navigate to="/dashboard" replace />;
    case "doctor":
      return <Navigate to="/doctor/dashboard" replace />;
    case "admin":
      return <Navigate to="/admin/dashboard" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster richColors position="top-right" />
      <AuthProvider>
        <SocketProvider>
          <Layout>
            <Routes>
              {/* ==================== PUBLIC ROUTES ==================== */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/doctors/search" element={<DoctorSearch />} />
              <Route path="/doctors/:id" element={<DoctorProfile />} />
              <Route path="/redirect" element={<RoleBasedRedirect />} />

              {/* ==================== PATIENT (USER) ROUTES ==================== */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["user"]}>
                    <PatientDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/appointments"
                element={
                  <ProtectedRoute allowedRoles={["user"]}>
                    <PatientAppointment />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/profile"
                element={
                  <ProtectedRoute allowedRoles={["user"]}>
                    <UserProfile />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/chat"
                element={
                  <ProtectedRoute allowedRoles={["user", "doctor"]}>
                    <ChatList /> 
                  </ProtectedRoute>
                }
              />

              <Route
                path="/settings"
                element={
                  <ProtectedRoute allowedRoles={["user", "doctor", "admin"]}>
                    <Settings />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/reviews"
                element={
                  <ProtectedRoute allowedRoles={["user", "doctor"]}>
                    <Reviews />
                  </ProtectedRoute>
                }
              />

              {/* ==================== DOCTOR ROUTES ==================== */}
              <Route
                path="/doctor/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["doctor"]}>
                    <DoctorDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/doctor/register"
                element={
                  <ProtectedRoute allowedRoles={["user"]}>
                    <DoctorRegister />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/doctor/availability"
                element={
                  <ProtectedRoute allowedRoles={["doctor"]}>
                    <DoctorSlotManager />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/doctor/appointments"
                element={
                  <ProtectedRoute allowedRoles={["doctor"]}>
                    <DoctorAppointment />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/doctor/patients"
                element={
                  <ProtectedRoute allowedRoles={["doctor"]}>
                    <DoctorPatients />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/doctor/chat"
                element={
                  <ProtectedRoute allowedRoles={["user", "doctor"]}>
                    <ChatList /> 
                  </ProtectedRoute>
                }
              />

              <Route
                path="/doctor/earnings"
                element={
                  <ProtectedRoute allowedRoles={["doctor"]}>
                    <DoctorEarning />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/doctor/profile"
                element={
                  <ProtectedRoute allowedRoles={["doctor"]}>
                    <DoctorDetailsProfile />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/doctor/profile/edit"
                element={
                  <ProtectedRoute allowedRoles={["doctor"]}>
                    <DoctorProfileEdit />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/doctor/reviews"
                element={
                  <ProtectedRoute allowedRoles={["doctor"]}>
                    <DoctorReview />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/doctor/settings"
                element={
                  <ProtectedRoute allowedRoles={["doctor"]}>
                    <DoctorSetting />
                  </ProtectedRoute>
                }
              />

              {/* ==================== ADMIN ROUTES ==================== */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/approvals"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <DoctorApproval />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminUsers />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/analytics"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminAnalytics />
                  </ProtectedRoute>
                }
              />

              {/* ==================== COMMON ROUTES (Multiple Roles) ==================== */}

              <Route
                path="/chat/:appointmentId"
                element={
                  <ProtectedRoute allowedRoles={["user", "doctor"]}>
                    <Chat />
                  </ProtectedRoute>
                }
              />

              {/* ==================== 404 NOT FOUND ==================== */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </SocketProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
