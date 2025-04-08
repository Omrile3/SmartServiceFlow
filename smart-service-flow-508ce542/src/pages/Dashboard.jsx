import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Building2, 
  QrCode, 
  ArrowRight, 
  TableProperties, 
  Menu as MenuIcon, 
  MessagesSquare 
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [roleType, setRoleType] = useState("customer");

  useEffect(() => {
    // Load role from local storage if available
    const savedRole = localStorage.getItem("userRoleType");
    if (savedRole) {
      setRoleType(savedRole);
    }
  }, []);

  const isManager = roleType === "manager";
  const isStaff = roleType === "staff";
  const isCustomer = roleType === "customer";

  // Create URL helper function directly in the component
  const createPageUrl = (pageName) => {
    if (!pageName) return "/";
    return "/" + pageName;
  };

  return (
    <div className="p-6 pt-20">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Welcome to Smart Service Flow</h1>
            <p className="text-gray-600">
              {isManager 
                ? "Manage your restaurant's digital services" 
                : isStaff 
                  ? "View and manage service requests"
                  : "Experience digital dining"}
            </p>
          </div>
        </div>

        {(isManager || isStaff) && (
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {isManager && (
              <>
                <Card className="hover:shadow-md transition-shadow">
                  <Link to={createPageUrl("Tables")} className="block p-6">
                    <div className="flex items-center justify-between mb-4">
                      <TableProperties className="w-10 h-10 text-blue-600" />
                      <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                        Manage
                      </div>
                    </div>
                    <h3 className="font-bold text-lg">Table Setup</h3>
                    <p className="text-gray-600 mt-2">
                      Add, position, and generate QR codes for restaurant tables
                    </p>
                  </Link>
                </Card>
                
                <Card className="hover:shadow-md transition-shadow">
                  <Link to={createPageUrl("Menu")} className="block p-6">
                    <div className="flex items-center justify-between mb-4">
                      <MenuIcon className="w-10 h-10 text-green-600" />
                      <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                        Manage
                      </div>
                    </div>
                    <h3 className="font-bold text-lg">Menu Management</h3>
                    <p className="text-gray-600 mt-2">
                      Create and update menu items, categories, and pricing
                    </p>
                  </Link>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                  <Link to={createPageUrl("ServiceTypes")} className="block p-6">
                    <div className="flex items-center justify-between mb-4">
                      <MessagesSquare className="w-10 h-10 text-indigo-600" />
                      <div className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-xs">
                        Configure
                      </div>
                    </div>
                    <h3 className="font-bold text-lg">Service Types</h3>
                    <p className="text-gray-600 mt-2">
                      Customize the service types customers can request
                    </p>
                  </Link>
                </Card>
              </>
            )}
            
            <Card className="hover:shadow-md transition-shadow">
              <Link to={createPageUrl("ServiceRequests")} className="block p-6">
                <div className="flex items-center justify-between mb-4">
                  <MessagesSquare className="w-10 h-10 text-purple-600" />
                  <div className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                    Monitor
                  </div>
                </div>
                <h3 className="font-bold text-lg">Service Requests</h3>
                <p className="text-gray-600 mt-2">
                  View and manage customer service requests
                </p>
              </Link>
            </Card>
          </div>
        )}

        {isCustomer && (
          <div className="mt-8 max-w-2xl mx-auto text-center">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <QrCode className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-4">Get Started with Customer View</h2>
              <p className="text-gray-600 mb-6">
                Experience the customer view by scanning table QR codes or directly accessing the customer interface.
              </p>
              <Link to={createPageUrl("Customer")}>
                <Button className="w-full sm:w-auto py-2 px-6">
                  Go to Customer View <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}