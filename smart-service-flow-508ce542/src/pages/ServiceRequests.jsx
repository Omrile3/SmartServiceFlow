import React, { useState, useEffect } from "react";
import { ServiceRequest } from "@/api/entities";
import { User } from "@/api/entities";
import { Restaurant } from "@/api/entities";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, CheckCircle, Table2, FilterX, Plus, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function ServiceRequests() {
  const [requests, setRequests] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [currentUser, setCurrentUser] = useState(null);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshTimer, setRefreshTimer] = useState(30);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newRequest, setNewRequest] = useState({
    table_id: "",
    type: "water",
    details: ""
  });

  useEffect(() => {
    loadUserAndData();
    
    // Set up refresh timer
    const interval = setInterval(() => {
      setRefreshTimer(prev => {
        if (prev <= 1) {
          loadRequests();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const loadUserAndData = async () => {
    setLoading(true);
    try {
      const user = await User.me();
      setCurrentUser(user);
      
      // Load tables information
      const restaurants = await Restaurant.list();
      if (restaurants.length > 0) {
        setTables(restaurants[0]?.layout?.tables || []);
      }
      
      await loadRequests();
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setLoading(false);
  };

  const loadRequests = async () => {
    try {
      let activeRequests;
      
      if (currentUser?.role_type === 'staff' && currentUser?.assigned_tables?.length) {
        // For staff, only show requests from assigned tables
        activeRequests = await ServiceRequest.filter({
          table_id: currentUser.assigned_tables,
          status: ["pending", "in_progress"]
        });
      } else {
        // For managers or staff without assigned tables, show all requests
        activeRequests = await ServiceRequest.filter({
          status: ["pending", "in_progress"]
        });
      }
      
      setRequests(activeRequests);
      setRefreshTimer(30);
    } catch (error) {
      console.error("Error loading requests:", error);
    }
  };

  const updateStatus = async (requestId, status) => {
    try {
      await ServiceRequest.update(requestId, { status });
      loadRequests();
    } catch (error) {
      console.error("Error updating request:", error);
    }
  };
  
  const assignTable = async (tableId) => {
    try {
      const existingTables = currentUser.assigned_tables || [];
      
      // Toggle assignment - if already assigned, remove it
      let updatedTables;
      if (existingTables.includes(tableId)) {
        updatedTables = existingTables.filter(t => t !== tableId);
      } else {
        updatedTables = [...existingTables, tableId];
      }
      
      await User.updateMyUserData({ assigned_tables: updatedTables });
      
      // Update current user state
      setCurrentUser(prev => ({
        ...prev,
        assigned_tables: updatedTables
      }));
      
      // Reload requests to show newly assigned tables
      loadRequests();
    } catch (error) {
      console.error("Error assigning table:", error);
    }
  };

  const handleAddRequest = async () => {
    try {
      await ServiceRequest.create({
        table_id: newRequest.table_id,
        type: newRequest.type,
        details: newRequest.details,
        status: "pending"
      });
      
      setShowAddDialog(false);
      setNewRequest({
        table_id: "",
        type: "water",
        details: ""
      });
      
      loadRequests();
    } catch (error) {
      console.error("Error creating service request:", error);
    }
  };

  const filteredRequests = activeTab === "all" 
    ? requests 
    : requests.filter(request => request.status === activeTab);

  const isStaff = currentUser?.role_type === 'staff';
  const isManager = currentUser?.role_type === 'manager';

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Service Requests</h1>
            <p className="text-gray-500">
              Auto-refreshes in {refreshTimer}s
              <Button 
                variant="ghost" 
                size="sm" 
                className="ml-2" 
                onClick={loadRequests}
              >
                Refresh Now
              </Button>
            </p>
          </div>
          
          {isManager && (
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Request
            </Button>
          )}
        </div>
        
        {isStaff && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>My Assigned Tables</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {tables.map(table => (
                  <Button
                    key={table.id}
                    variant={currentUser?.assigned_tables?.includes(table.id) ? "default" : "outline"}
                    size="sm"
                    onClick={() => assignTable(table.id)}
                    className="flex items-center gap-1"
                  >
                    <Table2 className="w-4 h-4" />
                    {table.id}
                    {currentUser?.assigned_tables?.includes(table.id) && (
                      <span className="ml-1 w-2 h-2 bg-green-500 rounded-full"></span>
                    )}
                  </Button>
                ))}
                
                {tables.length === 0 && (
                  <p className="text-gray-500">No tables available to assign</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
        
        <Tabs 
          defaultValue="all" 
          value={activeTab}
          onValueChange={setActiveTab}
          className="mb-6"
        >
          <TabsList>
            <TabsTrigger value="all">
              All Requests
              {requests.length > 0 && (
                <span className="ml-2 bg-gray-200 text-gray-800 rounded-full px-2 py-0.5 text-xs">
                  {requests.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending
              <span className="ml-2 bg-yellow-100 text-yellow-800 rounded-full px-2 py-0.5 text-xs">
                {requests.filter(r => r.status === 'pending').length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="in_progress">
              In Progress
              <span className="ml-2 bg-blue-100 text-blue-800 rounded-full px-2 py-0.5 text-xs">
                {requests.filter(r => r.status === 'in_progress').length}
              </span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="grid gap-4">
          {filteredRequests.map(request => (
            <Card key={request.id} className="overflow-hidden border-l-4" style={{
              borderLeftColor: request.status === 'pending' 
                ? '#EAB308' 
                : request.status === 'in_progress' 
                  ? '#2563EB' 
                  : '#10B981'
            }}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <Table2 className="w-5 h-5 text-gray-500" />
                    <CardTitle>Table {request.table_id}</CardTitle>
                  </div>
                  <Badge 
                    variant={request.status === "pending" ? "warning" : "default"}
                    className="capitalize"
                  >
                    {request.status.replace('_', ' ')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <h3 className="text-lg font-medium capitalize mb-1">
                    {request.type.replace('_', ' ')}
                  </h3>
                  {request.details && (
                    <p className="text-gray-600">{request.details}</p>
                  )}
                  <div className="flex items-center gap-1 text-sm text-gray-500 mt-2">
                    <Clock className="w-4 h-4" />
                    <span>Requested at {new Date(request.created_date).toLocaleTimeString()}</span>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  {request.status === "pending" && (
                    <Button 
                      onClick={() => updateStatus(request.id, "in_progress")}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Play className="w-4 h-4" />
                      Start Processing
                    </Button>
                  )}
                  <Button 
                    onClick={() => updateStatus(request.id, "completed")}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Mark as Complete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {filteredRequests.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg border">
              <FilterX className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No active service requests</p>
              {isStaff && currentUser?.assigned_tables?.length === 0 && (
                <p className="text-sm text-gray-400 mt-2">Assign yourself to tables to see their requests</p>
              )}
            </div>
          )}
        </div>
      </div>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Service Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium mb-1">Table</label>
              <select
                className="w-full rounded-md border border-gray-300 p-2"
                value={newRequest.table_id}
                onChange={(e) => setNewRequest(prev => ({ ...prev, table_id: e.target.value }))}
              >
                <option value="" disabled>Select a table</option>
                {tables.map(table => (
                  <option key={table.id} value={table.id}>
                    {table.id} ({table.seats} seats)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Request Type</label>
              <select
                className="w-full rounded-md border border-gray-300 p-2"
                value={newRequest.type}
                onChange={(e) => setNewRequest(prev => ({ ...prev, type: e.target.value }))}
              >
                <option value="water">Water</option>
                <option value="napkins">Napkins</option>
                <option value="utensils">Utensils</option>
                <option value="assistance">Assistance</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Details</label>
              <Textarea
                value={newRequest.details}
                onChange={(e) => setNewRequest(prev => ({ ...prev, details: e.target.value }))}
                placeholder="Additional details about the request"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddRequest}
              disabled={!newRequest.table_id}
            >
              Create Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}