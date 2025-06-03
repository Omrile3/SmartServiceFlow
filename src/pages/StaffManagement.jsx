
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
      
      const [allUsers, serviceRequests] = await Promise.all([
        User.list(),
        fetch('/backend/read_service_requests.php')
          .then(res => res.json())
          .then(data => {
            if (data.success && Array.isArray(data.tables)) {
              const tables = data.tables.map(table => ({
                id: table.id,
                table_number: table.table_number,
                qr_code: table.qr_code,
                x: table.x,
                y: table.y
              }));
              return tables;
            } else {
              console.warn("Unexpected response format for tables:", data);
              console.log("Tables key in response:", data.tables);
              console.log("Full response from read_service_requests.php:", data);
              return [];
            }
          })
      ]);
      console.log("Fetched service requests:", serviceRequests);
      console.log("Processed tables array:", tables);
      
      const staffMembers = allUsers.filter(user => 
        user.role === 'user' && user.role_type === 'staff'
      );
      
      setUsers(staffMembers);
    console.log("Fetched staff members:", staffMembers);
    console.log("Fetched tables:", restaurants[0]?.layout?.tables || []);
      
      const uniqueTables = Array.from(
        new Map(
          serviceRequests.map(req => [req.table_id, { id: req.table_id, table_number: req.table_number }])
        ).values()
      );
      console.log("Unique tables extracted from service requests:", uniqueTables);
      setTables(uniqueTables);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setLoading(false);
  };

  const handleTableClick = (tableNumber) => {
    const filteredRequests = tables.filter(req => req.table_number === tableNumber);
    setTables(filteredRequests);
    console.log("Filtered requests for table:", tableNumber, filteredRequests);
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
                          {tables.length > 0 ? (
                            serviceRequests.map(request => (
                              <Button
                                key={request.table_id}
                                variant={currentUser?.assigned_tables?.includes(request.table_id) ? "default" : "outline"}
                                size="sm"
                                onClick={() => assignTable(request.table_id)}
                                className="flex items-center gap-1"
                              >
                                <Table2 className="w-4 h-4" />
                                {request.table_number}
                                {currentUser?.assigned_tables?.includes(request.table_id) && (
                                  <span className="ml-1 w-2 h-2 bg-green-500 rounded-full"></span>
                                )}
                              </Button>
                            ))
                          ) : (
                            <p className="text-gray-500">No tables available to assign</p>
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
                        {table.table_number}
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
