
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
  Settings,
  Users
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

export default function Layout({ children, currentPageName }) {
  const [role, setRole] = useState(null);
  const [roleType, setRoleType] = useState(null);
  const [userName, setUserName] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // We're not using User.me() anymore as it's causing permission errors
    setRoleType('customer');
  }, []);

  useEffect(() => {
    // Close mobile menu when route changes
    setMobileMenuOpen(false);
  }, [location]);

  const handleLogin = () => {
    window.location.href = '/customer';
  };

  const isCustomer = true; // Default to customer view for now

  // Check if current path matches the link
  const isCurrentPage = (pageName) => {
    return location.pathname === createPageUrl(pageName);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1 bg-gray-50">
        {children}
      </main>

      {/* Customer display header */}
      <div className="fixed top-0 left-0 right-0 bg-white border-b py-3 px-4 shadow-sm z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <MenuIcon className="w-6 h-6 text-blue-600 mr-2" />
            <span className="font-bold text-lg">RestaurantQR</span>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogin}>
            Customer View
          </Button>
        </div>
      </div>
    </div>
  );
}
