import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { UserCog, ChevronDown } from "lucide-react";

export default function RoleSelector({ currentRole, onRoleChange }) {
  const [showDialog, setShowDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState(currentRole);

  const getRoleLabel = (role) => {
    switch(role) {
      case 'manager': return 'Manager';
      case 'staff': return 'Staff';
      case 'customer': return 'Customer';
      default: return 'Unknown Role';
    }
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setShowDialog(true);
  };

  const confirmRoleChange = () => {
    onRoleChange(selectedRole);
    setShowDialog(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <UserCog className="w-4 h-4" />
            <span className="hidden sm:inline">Switch Role</span>
            <ChevronDown className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem 
            onClick={() => handleRoleSelect('manager')}
            className={currentRole === 'manager' ? 'bg-blue-50 text-blue-800' : ''}
          >
            Manager View
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleRoleSelect('staff')}
            className={currentRole === 'staff' ? 'bg-blue-50 text-blue-800' : ''}
          >
            Staff View
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleRoleSelect('customer')}
            className={currentRole === 'customer' ? 'bg-blue-50 text-blue-800' : ''}
          >
            Customer View
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Switch to {getRoleLabel(selectedRole)} View</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>You are about to switch to <strong>{getRoleLabel(selectedRole)}</strong> view.</p>
            
            {selectedRole === 'manager' && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  In Manager view, you'll have access to configure tables, menu items, and view service requests.
                </p>
              </div>
            )}
            
            {selectedRole === 'staff' && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800">
                  In Staff view, you'll be able to manage service requests and view assigned tables.
                </p>
              </div>
            )}
            
            {selectedRole === 'customer' && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-800">
                  In Customer view, you'll see the app as customers would after scanning a QR code.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmRoleChange}>
              Switch to {getRoleLabel(selectedRole)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}