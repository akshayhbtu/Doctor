// import './App.css'

// import { Button } from "@/components/ui/button"

// import { BrowserRouter as Route, Router, Routes } from "react-router-dom";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Layout from "./components/Layout/Layout";
import { Route, Routes } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import { AuthProvider } from "./contexts/AuthContext";
// import { AuthProvider } from "./contexts/AuthContext";
// import { path } from 'path';

function App() {
  return (
    <>
      {/* <Router> */}

      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />

            <Route path="/register" element={<Register />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </>
  );
}

export default App;
