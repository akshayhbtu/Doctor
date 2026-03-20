// import './App.css'

// import { Button } from "@/components/ui/button"

// import { BrowserRouter as Route, Router, Routes } from "react-router-dom";

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
import {  QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { AuthProvider } from "./contexts/AuthContext";
// import { path } from 'path';

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

const queryClient= new QueryClient();

function App() {
  return (
    <>
      {/* <Router> */}

      <QueryClientProvider client={queryClient}>


      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />

            <Route path="/register" element={<Register />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardRouter />
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
