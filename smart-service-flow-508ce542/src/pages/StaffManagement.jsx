
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Restaurant } from "@/api/entities";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserPlus, Table2, Check, X, UserCheck } from "lucide-react";

export default function StaffManagement() {
  const [users, setUsers] = useState([]);
  const [tables, setTables] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedTables, setSelectedTables] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const user = await User.me();
      setCurrentUser(user);
      
      if (user.role !== 'admin' || user.role_type !== 'manager') {
        window.location.href = createPageUrl("Dashboard");
        return;
      }
      
      const [allUsers, restaurants] = await Promise.all([
        User.list(),
        Restaurant.list()
      ]);
      
      const staffMembers = allUsers.filter(user => 
        user.role === 'user' && user.role_type === 'staff'
      );
      
      setUsers(staffMembers);
      
      if (restaurants.length > 0) {
        setTables(restaurants[0]?.layout?.tables || []);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setLoading(false);
  };

  const handleAssignTables = (user) => {
    setSelectedUser(user);
    setSelectedTables(user.assigned_tables || []);
    setShowAssignDialog(true);
  };

  const toggleTableSelection = (tableId) => {
    setSelectedTables(prev => {
      if (prev.includes(tableId)) {
        return prev.filter(id => id !== tableId);
      } else {
        return [...prev, tableId];
      }
    });
  };

  const saveTableAssignments = async () => {
    try {
      await User.update(selectedUser.id, {
        assigned_tables: selectedTables
      });
      
      setUsers(prev => 
        prev.map(user => 
          user.id === selectedUser.id 
            ? { ...user, assigned_tables: selectedTables }
            : user
        )
      );
      
      setShowAssignDialog(false);
    } catch (error) {
      console.error("Error saving table assignments:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Staff Management</h1>
            <p className="text-gray-600">Assign staff members to tables</p>
          </div>
          <Button>
            <UserPlus className="w-4 h-4 mr-2" />
            Invite Staff
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Staff Members</CardTitle>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No staff members found</p>
                <Button className="mt-4">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Invite New Staff
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Assigned Tables</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map(user => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-700 font-semibold">
                              {user.full_name?.charAt(0) || user.email?.charAt(0)}
                            </span>
                          </div>
                          {user.full_name}
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user.assigned_tables?.map(tableId => (
                            <Badge key={tableId} variant="outline" className="flex items-center gap-1">
                              <Table2 className="w-3 h-3" />
                              {tableId}
                            </Badge>
                          ))}
                          {(!user.assigned_tables || user.assigned_tables.length === 0) && (
                            <span className="text-gray-500 text-sm">No tables assigned</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleAssignTables(user)}
                        >
                          <UserCheck className="w-4 h-4 mr-2" />
                          Assign Tables
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Assign Tables to {selectedUser?.full_name}</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-gray-500 mb-4">
                Select tables that this staff member will be responsible for:
              </p>
              
              {tables.length === 0 ? (
                <div className="text-center py-8 border rounded-lg">
                  <p className="text-gray-500">No tables have been created yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-64 overflow-y-auto p-2">
                  {tables.map(table => (
                    <Button
                      key={table.id}
                      variant={selectedTables.includes(table.id) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleTableSelection(table.id)}
                      className="flex items-center justify-between"
                    >
                      <span className="flex items-center gap-1">
                        <Table2 className="w-4 h-4" />
                        {table.id}
                      </span>
                      {selectedTables.includes(table.id) ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <X className="w-4 h-4 opacity-0" />
                      )}
                    </Button>
                  ))}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
                Cancel
              </Button>
              <Button onClick={saveTableAssignments}>
                Save Assignments
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
