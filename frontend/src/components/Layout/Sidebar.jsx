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
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "../../lib/utils";
// import { Separator } from "radix-ui";
import { Separator } from "@/components/ui/separator"
import { Button } from "../ui/button";

export default function Sidebar() {
  const { user, loading } = useAuth();

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

  return (
    <aside className="hidden md:flex w-64 flex-col border-r bg-background sticky top-0 h-screen">
      <ScrollArea className="flex-1 py-6">
        <nav className="grid gap-2 px-2">
          {navItems.map((item, index) => (
            <NavLink
              key={index}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
                  isActive
                    ? "bg-indigo-100 text-accent-foreground"
                    : "text-muted-foreground",
                )
              }
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <Separator className="my-4" />
        <div className="px-2">
          <div className="rounded-lg bg-muted p-3">
            <h4 className="text-sm font-medium mb-2">Need Help?</h4>
            
            <Button variant="secondary" size="sm" className="w-full">
              Contact Us
            </Button>
          </div>
        </div>
      </ScrollArea>
    </aside>
  );
}
