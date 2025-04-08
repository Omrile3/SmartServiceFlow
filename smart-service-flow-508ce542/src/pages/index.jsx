import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Building2, Users, User } from "lucide-react";

export default function HomePage() {
  const [roleType, setRoleType] = useState("customer");

  useEffect(() => {
    // Check if there's a saved role in localStorage and redirect if found
    const savedRole = localStorage.getItem("userRoleType");
    if (savedRole) {
      redirectToRolePage(savedRole);
    }
  }, []);

  const handleRoleSelect = (role) => {
    setRoleType(role);
    localStorage.setItem("userRoleType", role);
    redirectToRolePage(role);
  };

  const redirectToRolePage = (role) => {
    if (role === "manager") {
      window.location.assign("/Dashboard");
    } else if (role === "staff") {
      window.location.assign("/ServiceRequests");
    } else {
      window.location.assign("/Customer");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-blue-600 mb-2">Smart Service Flow</h1>
        <p className="text-gray-600 text-lg max-w-md mx-auto">
          Streamline restaurant operations with our integrated service management platform
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full px-4">
        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-6 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Building2 className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Manager</h2>
          <p className="text-gray-600 mb-4">
            Oversee operations, manage tables, and handle restaurant administration
          </p>
          <Button 
            onClick={() => handleRoleSelect("manager")}
            className="mt-auto"
          >
            Enter as Manager
          </Button>
        </div>
        
        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-6 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-indigo-600" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Staff</h2>
          <p className="text-gray-600 mb-4">
            Respond to customer service requests and assist with table service
          </p>
          <Button 
            onClick={() => handleRoleSelect("staff")}
            className="mt-auto"
            variant="outline"
          >
            Enter as Staff
          </Button>
        </div>
        
        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-6 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <User className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Customer</h2>
          <p className="text-gray-600 mb-4">
            Browse the menu, place orders, and request service at your table
          </p>
          <Button 
            onClick={() => handleRoleSelect("customer")}
            className="mt-auto"
            variant="outline"
          >
            Enter as Customer
          </Button>
        </div>
      </div>
      
      <div className="mt-12 text-center text-gray-500">
        <p>This is a demo application. Choose any role to explore the features.</p>
      </div>
    </div>
  );
}