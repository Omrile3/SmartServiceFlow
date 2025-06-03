

import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  TableProperties, 
  LayoutDashboard, 
  Menu as MenuIcon, 
  MessagesSquare, 
  User as UserIcon, 
  ChevronDown,
  LogOut,
  Settings
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import RoleSelector from "../components/shared/RoleSelector";

export default function Layout({ children, currentPageName }) {
  const [roleType, setRoleType] = useState("customer");
  const [userName, setUserName] = useState("Demo User");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Load role from local storage if available
    const savedRole = localStorage.getItem("userRoleType");
    if (savedRole) {
      setRoleType(savedRole);
    }
  }, []);

  useEffect(() => {
    // Close mobile menu when route changes
    setMobileMenuOpen(false);
  }, [location]);

  const handleRoleChange = (newRole) => {
    setRoleType(newRole);
    localStorage.setItem("userRoleType", newRole);
    
    // If changing away from customer and returning to customer, keep the table assignment
    
    // Redirect to appropriate page based on new role
    if (newRole === "manager") {
      window.location.href = createPageUrl("Dashboard");
    } else if (newRole === "staff") {
      window.location.href = createPageUrl("ServiceRequests");
    } else {
      window.location.href = createPageUrl("Customer");
    }
  };

  const isManager = roleType === "manager";
  const isStaff = roleType === "staff";
  const isCustomer = roleType === "customer";

  // Check if current path matches the link
  const isCurrentPage = (pageName) => {
    return location.pathname === createPageUrl(pageName);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {(!isCustomer || location.pathname !== createPageUrl("Customer")) && (
        <header className="bg-white border-b shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <Link to={createPageUrl("Dashboard")} className="flex items-center gap-2">
                  <MenuIcon className="w-6 h-6 text-blue-600" />
                  <span className="font-bold text-xl hidden sm:block">Smart Service Flow</span>
                </Link>
                
                <nav className="hidden md:flex ml-8 space-x-1">
                  {(isManager || isStaff) && (
                    <Link
                      to={createPageUrl("Dashboard")}
                      className={`${
                        isCurrentPage("Dashboard")
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                      } flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium`}
                    >
                      <LayoutDashboard className="w-5 h-5" />
                      Dashboard
                    </Link>
                  )}
                  {isManager && (
                    <>
                      <Link
                        to={createPageUrl("Tables")}
                        className={`${
                          isCurrentPage("Tables")
                            ? "bg-blue-50 text-blue-600"
                            : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                        } flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium`}
                      >
                        <TableProperties className="w-5 h-5" />
                        Tables
                      </Link>
                      <Link
                        to={createPageUrl("Menu")}
                        className={`${
                          isCurrentPage("Menu")
                            ? "bg-blue-50 text-blue-600"
                            : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                        } flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium`}
                      >
                        <MenuIcon className="w-5 h-5" />
                        Menu
                      </Link>
                      <Link
                        to={createPageUrl("ServiceTypes")}
                        className={`${
                          isCurrentPage("ServiceTypes")
                            ? "bg-blue-50 text-blue-600"
                            : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                        } flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium`}
                      >
                        <MessagesSquare className="w-5 h-5" />
                        Service Types
                      </Link>
                    </>
                  )}
                  {(isManager || isStaff) && (
                    <Link
                      to={createPageUrl("ServiceRequests")}
                      className={`${
                        isCurrentPage("ServiceRequests")
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                      } flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium`}
                    >
                      <MessagesSquare className="w-5 h-5" />
                      Service Requests
                    </Link>
                  )}
                </nav>
              </div>

              <div className="flex items-center gap-2">
                <RoleSelector currentRole={roleType} onRoleChange={handleRoleChange} />
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2">
                      <UserIcon className="w-5 h-5" />
                      <span className="hidden sm:block">
                        {userName}
                        <span className="ml-1 text-xs text-gray-500 capitalize">({roleType})</span>
                      </span>
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => window.location.href = "/"}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button
                  variant="ghost"
                  size="sm"
                  className="md:hidden"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={
                        mobileMenuOpen
                          ? "M6 18L18 6M6 6l12 12"
                          : "M4 6h16M4 12h16m-7 6h7"
                      }
                    />
                  </svg>
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t">
              <div className="px-2 py-3 space-y-1">
                {(isManager || isStaff) && (
                  <Link
                    to={createPageUrl("Dashboard")}
                    className={`${
                      isCurrentPage("Dashboard")
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                    } flex items-center gap-2 py-3 px-4`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    Dashboard
                  </Link>
                )}
                {isManager && (
                  <>
                    <Link
                      to={createPageUrl("Tables")}
                      className={`${
                        isCurrentPage("Tables")
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                      } flex items-center gap-2 py-3 px-4`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <TableProperties className="w-5 h-5" />
                      Tables
                    </Link>
                    <Link
                      to={createPageUrl("Menu")}
                      className={`${
                        isCurrentPage("Menu")
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                      } flex items-center gap-2 py-3 px-4`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <MenuIcon className="w-5 h-5" />
                      Menu
                    </Link>
                    <Link
                      to={createPageUrl("ServiceTypes")}
                      className={`${
                        isCurrentPage("ServiceTypes")
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                      } flex items-center gap-2 py-3 px-4`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <MessagesSquare className="w-5 h-5" />
                      Service Types
                    </Link>
                  </>
                )}
                {(isManager || isStaff) && (
                  <Link
                    to={createPageUrl("ServiceRequests")}
                    className={`${
                      isCurrentPage("ServiceRequests")
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                    } flex items-center gap-2 py-3 px-4`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <MessagesSquare className="w-5 h-5" />
                    Service Requests
                  </Link>
                )}
              </div>
            </div>
          )}
        </header>
      )}

      <main className="flex-1 bg-gray-50">
        {children}
      </main>

      {/* Customer display header - only for customer view */}
      {isCustomer && location.pathname === createPageUrl("Customer") && (
        <div className="fixed top-0 left-0 right-0 bg-white border-b py-3 px-4 shadow-sm z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <MenuIcon className="w-6 h-6 text-blue-600 mr-2" />
              <span className="font-bold text-lg">Smart Service Flow</span>
            </div>
            <div className="flex items-center gap-2">
              
              <RoleSelector currentRole={roleType} onRoleChange={handleRoleChange} />
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}

