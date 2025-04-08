
import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, CheckCircle, Table2, FilterX, Plus, Clock, RefreshCw } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function ServiceRequests() {
  const [requests, setRequests] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [currentUser, setCurrentUser] = useState({
    role_type: localStorage.getItem("userRoleType") || "staff",
    assigned_tables: []
  });
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshTimer, setRefreshTimer] = useState(30);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newRequest, setNewRequest] = useState({
    table_id: "",
    type: "water",
    details: ""
  });

  // Load data when component mounts
  useEffect(() => {
    loadData();
    
    // Set up refresh timer
    const interval = setInterval(() => {
      setRefreshTimer(prev => {
        if (prev <= 1) {
          loadData();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Use an interval to periodically refresh service requests
  useEffect(() => {
    const interval = setInterval(() => {
      // Get the latest service requests from localStorage
      const savedRequests = localStorage.getItem('serviceRequests');
      if (savedRequests) {
        try {
          const parsedRequests = JSON.parse(savedRequests);
          setRequests(parsedRequests);
        } catch (error) {
          console.error("Error refreshing service requests:", error);
        }
      }
    }, 10000); // Check every 10 seconds
    
    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, []);

  // Load all necessary data
  const loadData = () => {
    setLoading(true);
    
    // Load service requests from localStorage
    const savedRequests = localStorage.getItem('serviceRequests');
    if (savedRequests) {
      try {
        setRequests(JSON.parse(savedRequests));
      } catch (error) {
        console.error('Error parsing saved requests:', error);
        initializeDefaultRequests();
      }
    } else {
      initializeDefaultRequests();
    }
    
    // Load tables from localStorage
    const savedTables = localStorage.getItem('restaurantTables');
    if (savedTables) {
      try {
        setTables(JSON.parse(savedTables));
      } catch (error) {
        console.error('Error parsing saved tables:', error);
        initializeDefaultTables();
      }
    } else {
      initializeDefaultTables();
    }
    
    // Load user assignment data
    const savedAssignments = localStorage.getItem('staffAssignments');
    if (savedAssignments) {
      try {
        const assignments = JSON.parse(savedAssignments);
        const roleType = localStorage.getItem("userRoleType") || "staff";
        setCurrentUser(prev => ({
          ...prev,
          role_type: roleType,
          assigned_tables: assignments[roleType] || []
        }));
      } catch (error) {
        console.error('Error parsing saved assignments:', error);
      }
    }
    
    setLoading(false);
  };

  // Save service requests when they change
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('serviceRequests', JSON.stringify(requests));
    }
  }, [requests, loading]);

  // Save staff assignments when they change
  useEffect(() => {
    if (!loading && currentUser) {
      const savedAssignments = localStorage.getItem('staffAssignments');
      let assignments = {};
      
      if (savedAssignments) {
        try {
          assignments = JSON.parse(savedAssignments);
        } catch (error) {
          console.error('Error parsing saved assignments:', error);
        }
      }
      
      assignments[currentUser.role_type] = currentUser.assigned_tables;
      localStorage.setItem('staffAssignments', JSON.stringify(assignments));
    }
  }, [currentUser, loading]);

  const initializeDefaultRequests = () => {
    const defaultRequests = [
      {
        id: "req-1",
        table_id: "table-1",
        type: "water",
        details: "Need water for a party of 4",
        status: "pending",
        created_date: new Date(Date.now() - 10 * 60000).toISOString() // 10 mins ago
      },
      {
        id: "req-2",
        table_id: "table-3",
        type: "napkins",
        details: "Need extra napkins please",
        status: "in_progress",
        created_date: new Date(Date.now() - 5 * 60000).toISOString() // 5 mins ago
      },
      {
        id: "req-3",
        table_id: "table-5",
        type: "assistance",
        details: "Need help with menu options",
        status: "pending",
        created_date: new Date(Date.now() - 2 * 60000).toISOString() // 2 mins ago
      }
    ];
    setRequests(defaultRequests);
    localStorage.setItem('serviceRequests', JSON.stringify(defaultRequests));
  };

  const initializeDefaultTables = () => {
    const defaultTables = [
      { id: "table-1", seats: 4 },
      { id: "table-2", seats: 2 },
      { id: "table-3", seats: 6 },
      { id: "table-4", seats: 4 },
      { id: "table-5", seats: 8 }
    ];
    setTables(defaultTables);
  };

  const updateStatus = (requestId, status) => {
    setRequests(prev => 
      prev.map(request => 
        request.id === requestId 
          ? { ...request, status } 
          : request
      )
    );
    
    alert(`Request status updated to ${status}.`);
  };
  
  const assignTable = (tableId) => {
    setCurrentUser(prev => {
      const existingTables = prev.assigned_tables || [];
      
      // Toggle assignment - if already assigned, remove it
      let updatedTables;
      if (existingTables.includes(tableId)) {
        updatedTables = existingTables.filter(t => t !== tableId);
      } else {
        updatedTables = [...existingTables, tableId];
      }
      
      return {
        ...prev,
        assigned_tables: updatedTables
      };
    });
  };

  const handleAddRequest = () => {
    // Get available service types
    const savedTypes = localStorage.getItem('serviceTypes');
    let serviceTypes = [];
    
    if (savedTypes) {
      try {
        const parsedTypes = JSON.parse(savedTypes);
        // Only include active service types
        serviceTypes = parsedTypes.filter(type => type.active);
      } catch (error) {
        console.error("Error loading service types:", error);
      }
    }
    
    // If no valid service types, use fallback default
    if (serviceTypes.length === 0) {
      serviceTypes = [
        { id: "water", name: "Water" },
        { id: "napkins",  name: "Napkins" },
        { id: "utensils", name: "Utensils" },
        { id: "assistance", name: "Assistance" },
        { id: "other", name: "Other" }
      ];
    }
    
    setShowAddDialog(true);
    setNewRequest({
      table_id: "",
      type: serviceTypes[0]?.id || "water",
      details: ""
    });
  };

  const handleRefresh = () => {
    loadData();
    setRefreshTimer(30);
    alert('Service requests refreshed.');
  };

  const filteredRequests = activeTab === "all" 
    ? requests 
    : requests.filter(request => request.status === activeTab);

  const isStaff = currentUser?.role_type === 'staff';
  const isManager = currentUser?.role_type === 'manager';

  // Create URL helper function directly in the component
  const createPageUrl = (pageName) => {
    if (!pageName) return "/";
    return "/" + pageName;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Service Requests</h1>
            <p className="text-gray-500">
              Auto-refreshes in {refreshTimer}s
              <Button 
                variant="ghost" 
                size="sm" 
                className="ml-2"
                onClick={handleRefresh}
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Refresh Now
              </Button>
            </p>
          </div>
          
          {isManager && (
            <Button onClick={() => handleAddRequest()} className="w-full sm:w-auto">
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
                    <CardTitle>{request.table_id}</CardTitle>
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
        <DialogContent className="sm:max-w-[425px] p-4 sm:p-6 max-h-[90vh] overflow-auto">
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
                {(() => {
                  // Get available service types
                  const savedTypes = localStorage.getItem('serviceTypes');
                  let serviceTypes = [];
                  
                  if (savedTypes) {
                    try {
                      const parsedTypes = JSON.parse(savedTypes);
                      // Only include active service types
                      serviceTypes = parsedTypes.filter(type => type.active);
                    } catch (error) {
                      console.error("Error loading service types:", error);
                    }
                  }
                  
                  // If no valid service types, use fallback default
                  if (serviceTypes.length === 0) {
                    serviceTypes = [
                      { id: "water", name: "Water" },
                      { id: "napkins", name: "Napkins" },
                      { id: "utensils", name: "Utensils" },
                      { id: "assistance", name: "Assistance" },
                      { id: "other", name: "Other" }
                    ];
                  }
                  
                  return serviceTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ));
                })()}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Details</label>
              <Textarea
                value={newRequest.details}
                onChange={(e) => setNewRequest(prev => ({ ...prev, details: e.target.value }))}
                placeholder="Additional details about the request"
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter className="sm:justify-end gap-2">
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                const newReq = {
                  id: `req-${Date.now()}`,
                  table_id: newRequest.table_id,
                  type: newRequest.type,
                  details: newRequest.details,
                  status: "pending",
                  created_date: new Date().toISOString()
                };
                
                setRequests(prev => [...prev, newReq]);
                setShowAddDialog(false);
                setNewRequest({
                  table_id: "",
                  type: "water",
                  details: ""
                });
                
                alert(`New service request for ${newReq.table_id} has been created.`);
              }}
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
