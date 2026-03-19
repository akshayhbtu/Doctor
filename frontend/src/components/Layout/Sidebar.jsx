import React from "react";

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

export default function Sidebar() {
  // const { user } = useAuth();

  const user = {
    name: "Akshay kumar",
    email: "akshay@gmail.com",
    role: "user",
  };

  const patientNavItems = [
    { icon: Home, label: "Dashboard", href: "/dashboard" },
    { icon: Calendar, label: "My Appointments", href: "/appointments" },
    { icon: Users, label: "Find Doctors", href: "/doctors/search" },
    { icon: MessageSquare, label: "Messages", href: "/chat" },
    { icon: Star, label: "Reviews", href: "/reviews" },
    { icon: FileText, label: "Medical Records", href: "/records" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ];

  const doctorNavItems = [
    { icon: Home, label: "Dashboard", href: "/dashboard" },
    { icon: Calendar, label: "Appointments", href: "/appointments" },
    { icon: Clock, label: "Availability", href: "/availability" },
    { icon: MessageSquare, label: "Messages", href: "/chat" },
    { icon: Users, label: "My Patients", href: "/patients" },
    { icon: Star, label: "Reviews", href: "/reviews" },
    { icon: BarChart3, label: "Earnings", href: "/earnings" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ];

  const adminNavItems = [
    { icon: Home, label: "Dashboard", href: "/dashboard" },
    { icon: UserPlus, label: "Doctor Approvals", href: "/admin/approvals" },
    { icon: Users, label: "User Management", href: "/admin/users" },
    { icon: Shield, label: "Role Management", href: "/admin/roles" },
    { icon: Activity, label: "Analytics", href: "/admin/analytics" },
    { icon: FileText, label: "Reports", href: "/admin/reports" },
    { icon: Settings, label: "Settings", href: "/admin/settings" },
  ];

  const getNavItems = () => {
    switch (user?.role) {
      case "patient":
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

  return (
    <aside>
      <ScrollArea>
        <nav>
          
        </nav>
      </ScrollArea>
    </aside>
  )
}
