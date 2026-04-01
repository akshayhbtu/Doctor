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
import DoctorProfile from "./pages/doctors/DoctorProfile";
import DoctorRegister from "./pages/doctors/DoctorRegister";
import { Toaster } from "sonner";
import DoctorApproval from "./pages/admin/DoctorApproval";
// import toast from "react-hot-toast";
// import { Toaster } from "react-hot-toast";

const DashboardRouter = () => {
  const { user } = useAuth();

  switch (user?.role) {
    case "user":
      return <PatientDashboard />;
    case "doctor":
      return <DoctorDashboard />;
    case "admin":
      return <AdminDashboard />;
    default:
      return <Navigate to="/" replace />;
  }
};

const queryClient = new QueryClient();

function App() {
  return (
    <>
      {/* <Router> */}

      <QueryClientProvider client={queryClient}>
        <Toaster />

        <AuthProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/doctors/search" element={<DoctorSearch />} />

              <Route path="/doctors/:id" element={<DoctorProfile />} />

              <Route path="/register" element={<Register />} />

              <Route
                path="/doctor/register"
                element={
                  <ProtectedRoute allowedRoles={["user"]}>
                    <DoctorRegister />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardRouter />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/approvals"
                element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DoctorApproval/>
                </ProtectedRoute>
              }
              />
            </Routes>
          </Layout>
        </AuthProvider>
      </QueryClientProvider>
    </>
  );
}

export default App;
