
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
import { Button } from "@/components/ui/button";
import RoleSelector from "./components/shared/RoleSelector";

export default function Layout({ children }) {
  const [roleType, setRoleType] = useState("customer");
  const [userName, setUserName] = useState("Demo User");

  useEffect(() => {
    const savedRole = localStorage.getItem("userRoleType");
    if (savedRole) {
      setRoleType(savedRole);
    }
  }, []);

  const handleRoleChange = (newRole) => {
    setRoleType(newRole);
    localStorage.setItem("userRoleType", newRole);
    
    // Using window.location.assign for better page transitioning
    if (newRole === "manager") {
      window.location.assign("/Dashboard");
    } else if (newRole === "staff") {
      window.location.assign("/ServiceRequests");
    } else {
      window.location.assign("/Customer");
    }
  };

  const isCustomer = roleType === "customer";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top header with role selector - always visible */}
      <div className="fixed top-0 left-0 right-0 bg-white border-b py-3 px-4 shadow-sm z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <MenuIcon className="w-6 h-6 text-blue-600 mr-2" />
            <span className="font-bold text-lg">Smart Service Flow</span>
          </div>
          <RoleSelector currentRole={roleType} onRoleChange={handleRoleChange} />
        </div>
      </div>

      <main className="flex-1 bg-gray-50 pt-16">
        {children}
      </main>
    </div>
  );
}
