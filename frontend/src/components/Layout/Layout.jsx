import React, { Children } from "react";
import Navbar from "./Navbar";
import { useAuth } from "@/contexts/AuthContext";
import Sidebar from "./Sidebar";

export default function Layout({ children }) {
  const { isAuthenticated, loading } = useAuth();

  // if (loading) return <p>Loading...</p>;

  if (loading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-64 bg-muted rounded-lg" />
          <div className="h-96 bg-muted rounded-lg" />
        </div>
      </div>
    );
  }
  // console.log(isAuthenticated);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="flex">
        {isAuthenticated && <Sidebar />}

        <main className={`flex-1  ${isAuthenticated ? "p-6" : ""} `}>
          {children}
        </main>
      </div>
    </div>
  );
}
