import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Home,
  Calendar,
  Users,
  MessageSquare,
  Settings,
  FileText,
  Star,
  Clock,
  UserPlus,
  Activity,
  BarChart3,
  Shield,
  DollarSign,
  UserCircle,
  ClipboardList,
  TrendingUp,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "../../lib/utils";
import { Separator } from "@/components/ui/separator";
import { Button } from "../ui/button";

export default function Sidebar() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <aside className="hidden md:flex w-64 flex-col border-r bg-background">
        <div className="p-4 space-y-4">
          <div className="h-10 bg-muted animate-pulse rounded" />
          <div className="h-10 bg-muted animate-pulse rounded" />
          <div className="h-10 bg-muted animate-pulse rounded" />
        </div>
      </aside>
    );
  }

  // ==================== USER (PATIENT) NAVIGATION ====================
  const patientNavItems = [
    { icon: Home, label: "Dashboard", href: "/dashboard" },
    { icon: Calendar, label: "My Appointments", href: "/appointments" },
    { icon: Users, label: "Find Doctors", href: "/doctors/search" },
    { icon: MessageSquare, label: "Messages", href: "/chat" },
    { icon: Star, label: "My Reviews", href: "/reviews" },
    { icon: FileText, label: "Medical Records", href: "/records" },
    { icon: UserCircle, label: "Profile", href: "/profile" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ];

  // ==================== DOCTOR NAVIGATION ====================
  const doctorNavItems = [
    { icon: Home, label: "Dashboard", href: "/doctor/dashboard" },
    { icon: Calendar, label: "Appointments", href: "/doctor/appointments" },
    { icon: Clock, label: "Availability", href: "/doctor/availability" },
    { icon: Users, label: "My Patients", href: "/doctor/patients" },
    { icon: MessageSquare, label: "Messages", href: "/doctor/chat" },
    { icon: DollarSign, label: "Earnings", href: "/doctor/earnings" },
    { icon: Star, label: "Reviews", href: "/doctor/reviews" },
    { icon: UserCircle, label: "Profile", href: "/doctor/profile" },
    { icon: Settings, label: "Settings", href: "/doctor/settings" },
  ];

  // ==================== ADMIN NAVIGATION ====================
  const adminNavItems = [
    { icon: Home, label: "Dashboard", href: "/admin/dashboard" },
    { icon: UserPlus, label: "Doctor Approvals", href: "/admin/approvals" },
    { icon: Users, label: "User Management", href: "/admin/users" },
    { icon: ClipboardList, label: "All Appointments", href: "/admin/appointments" },
    { icon: Shield, label: "Role Management", href: "/admin/roles" },
    { icon: TrendingUp, label: "Analytics", href: "/admin/analytics" },
    { icon: Activity, label: "System Health", href: "/admin/health" },
    { icon: FileText, label: "Reports", href: "/admin/reports" },
    { icon: Settings, label: "Settings", href: "/admin/settings" },
  ];

  // Get navigation items based on user role
  const getNavItems = () => {
    switch (user?.role) {
      case "user":
        return patientNavItems;
      case "doctor":
        return doctorNavItems;
      case "admin":
        return adminNavItems;
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  // Get role badge color
  const getRoleBadgeColor = () => {
    switch (user?.role) {
      case "user":
        return "bg-blue-100 text-blue-700";
      case "doctor":
        return "bg-green-100 text-green-700";
      case "admin":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <aside className="hidden md:flex w-64 flex-col border-r bg-background sticky top-0 h-screen">
      <ScrollArea className="flex-1 py-6">
        {/* User Info Section */}
        {/* <div className="px-3 mb-6">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-primary font-semibold">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full ${getRoleBadgeColor()}`}>
                {user?.role === "user" ? "Patient" : user?.role}
              </span>
            </div>
          </div>
        </div> */}

        {/* Navigation Items */}
        <nav className="grid gap-1 px-2">
          {navItems.map((item, index) => (
            <NavLink
              key={index}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground"
                )
              }
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <Separator className="my-4" />

        {/* Help Section */}
        <div className="px-2">
          <div className="rounded-lg bg-muted p-3">
            <h4 className="text-sm font-medium mb-2">Need Help?</h4>
            <p className="text-xs text-muted-foreground mb-3">
              {user?.role === "doctor" 
                ? "Manage your practice efficiently" 
                : user?.role === "admin" 
                ? "Monitor system activities" 
                : "Book appointments easily"}
            </p>
            <Button variant="secondary" size="sm" className="w-full">
              Contact Support
            </Button>
          </div>
        </div>
      </ScrollArea>
    </aside>
  );
}