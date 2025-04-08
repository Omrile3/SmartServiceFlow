import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Building2, Users, User } from "lucide-react";

export default function RoleSelector({ currentRole, onRoleChange }) {
  // Direct page navigation when role changes
  const handleRoleChange = (role) => {
    // First call the parent's handler
    onRoleChange(role);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          {currentRole === "manager" ? (
            <Building2 className="w-4 h-4" />
          ) : currentRole === "staff" ? (
            <Users className="w-4 h-4" />
          ) : (
            <User className="w-4 h-4" />
          )}
          <span className="capitalize">{currentRole}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => handleRoleChange("manager")}
          className={`flex items-center gap-2 ${
            currentRole === "manager" ? "bg-blue-50 text-blue-600" : ""
          }`}
        >
          <Building2 className="w-4 h-4" />
          Manager
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleRoleChange("staff")}
          className={`flex items-center gap-2 ${
            currentRole === "staff" ? "bg-blue-50 text-blue-600" : ""
          }`}
        >
          <Users className="w-4 h-4" />
          Staff
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleRoleChange("customer")}
          className={`flex items-center gap-2 ${
            currentRole === "customer" ? "bg-blue-50 text-blue-600" : ""
          }`}
        >
          <User className="w-4 h-4" />
          Customer
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}