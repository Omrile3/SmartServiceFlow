import React, { useState, useEffect } from 'react';
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserCog, ChevronDown } from "lucide-react";

export default function RoleSwitcher() {
  const [showDialog, setShowDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState('customer');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);
      setSelectedRole(user.role_type || 'customer');
    } catch (error) {
      console.error("Error loading user:", error);
    }
  };

  const handleRoleChange = async () => {
    try {
      setLoading(true);
      await User.updateMyUserData({ role_type: selectedRole });
      setCurrentUser(prev => ({ ...prev, role_type: selectedRole }));
      setShowDialog(false);
      window.location.href = '/'; // Redirect to home page to refresh app state
    } catch (error) {
      console.error("Error updating role:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleLabel = (role) => {
    switch(role) {
      case 'manager': return 'Manager';
      case 'staff': return 'Staff';
      case 'customer': return 'Customer';
      default: return 'Unknown Role';
    }
  };

  const availableRoles = [];
  
  if (currentUser?.role === 'admin') {
    availableRoles.push('manager');
  }
  
  if (currentUser?.role === 'user' || currentUser?.role === 'admin') {
    availableRoles.push('staff');
  }
  
  availableRoles.push('customer');
  
  if (availableRoles.length <= 1) {
    return null;
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <UserCog className="w-4 h-4" />
            <span>View as: {getRoleLabel(currentUser?.role_type || 'customer')}</span>
            <ChevronDown className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {availableRoles.map(role => (
            <DropdownMenuItem 
              key={role}
              onClick={() => {
                setSelectedRole(role);
                setShowDialog(true);
              }}
              className={currentUser?.role_type === role ? 'bg-blue-50 text-blue-800' : ''}
            >
              Switch to {getRoleLabel(role)}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Switch Role</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-6">
              You are about to switch to <strong>{getRoleLabel(selectedRole)}</strong> view. This will refresh the application.
            </p>
            {selectedRole === 'customer' && (
              <div className="rounded-lg bg-yellow-50 p-4 border border-yellow-200 mb-4">
                <p className="text-yellow-800 text-sm">
                  In Customer view, you'll see the app as a customer would after scanning a QR code.
                </p>
              </div>
            )}
            <div className="flex items-center justify-between">
              <Label htmlFor="confirm-switch">Confirm role switch</Label>
              <Switch id="confirm-switch" checked={true} />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowDialog(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleRoleChange}
              disabled={loading}
            >
              {loading ? 'Switching...' : `Switch to ${getRoleLabel(selectedRole)}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}