import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell, LogOut, Settings, User, Calendar, Users, Clock, Home } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  // ✅ Role-based navigation items
  const getNavLinks = () => {
    if (!user) return [];
    
    switch (user?.role) {
      case "user":
        return [
          { label: "Dashboard", href: "/dashboard", icon: Home },
          { label: "My Appointments", href: "/appointments", icon: Calendar },
          { label: "Find Doctors", href: "/doctors/search", icon: Users },
        ];
      case "doctor":
        return [
          { label: "Dashboard", href: "/doctor/dashboard", icon: Home },
          { label: "Appointments", href: "/doctor/appointments", icon: Calendar },
          { label: "Availability", href: "/doctor/availability", icon: Clock },
          { label: "My Patients", href: "/doctor/patients", icon: Users },
        ];
      case "admin":
        return [
          { label: "Dashboard", href: "/admin/dashboard", icon: Home },
          { label: "Doctor Approvals", href: "/admin/approvals", icon: Users },
          { label: "User Management", href: "/admin/users", icon: Users },
          { label: "Analytics", href: "/admin/analytics", icon: Clock },
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavLinks();

  // ✅ Profile menu items based on role
  const getProfileLinks = () => {
    if (!user) return [];
    
    switch (user?.role) {
      case "user":
        return [
          { label: "Profile", href: "/profile", icon: User },
          { label: "Settings", href: "/settings", icon: Settings },
        ];
      case "doctor":
        return [
          { label: "Profile", href: "/doctor/profile", icon: User },
          { label: "Settings", href: "/settings", icon: Settings },
          { label: "Earnings", href: "/doctor/earnings", icon: Clock },
        ];
      case "admin":
        return [
          { label: "Profile", href: "/admin/profile", icon: User },
          { label: "Settings", href: "/admin/settings", icon: Settings },
        ];
      default:
        return [];
    }
  };

  const profileLinks = getProfileLinks();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 px-2 md:px-4 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-10">
          <Link to="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold">DA</span>
            </div>
            <span className="font-bold text-xl hidden sm:inline-block">
              DocAppoint
            </span>
          </Link>

          {/* ✅ Dynamic Navigation Links - Role based */}
          {isAuthenticated && navLinks.length > 0 && (
            <nav className="hidden md:flex items-center space-x-4">
              {navLinks.map((link, index) => (
                <Link
                  key={index}
                  to={link.href}
                  className="text-sm font-medium transition-colors hover:text-primary flex items-center gap-1"
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              ))}
            </nav>
          )}
        </div>

        {/* Right Side - Notifications & User Menu */}
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500">
                  3
                </Badge>
              </Button>

              {/* User Dropdown Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.profileImage} alt={user?.name} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getInitials(user?.name)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user?.name}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                      <Badge 
                        variant="outline" 
                        className="mt-1 w-fit"
                      >
                        {user?.role === "user" ? "Patient" : user?.role === "doctor" ? "Doctor" : "Admin"}
                      </Badge>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  {/* ✅ Dynamic Profile Links */}
                  {profileLinks.map((link, index) => (
                    <DropdownMenuItem key={index} onClick={() => navigate(link.href)}>
                      <link.icon className="mr-2 h-4 w-4" />
                      {link.label}
                    </DropdownMenuItem>
                  ))}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => navigate("/login")}>
                Login
              </Button>
              <Button onClick={() => navigate("/register")}>Sign Up</Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}