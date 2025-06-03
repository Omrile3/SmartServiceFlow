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

  const fetchData = async (url, setState, errorMessage) => {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const textResponse = await response.text();
      const result = textResponse ? JSON.parse(textResponse) : {};
      if (result.success && Array.isArray(result.tables)) {
        setState(result.tables);
      } else if (Array.isArray(result)) {
        setState(result);
      } else {
        console.warn(`${errorMessage}: Unexpected response format`, result);
        setState([]);
      }
    } catch (error) {
      console.error(`${errorMessage}:`, error);
    }
  };

  const loadData = async () => {
    setLoading(true);

    // Fetch table names
    const fetchTables = async () => {
      try {
        const response = await fetch('/backend/read_tables.php', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      const textResponse = await response.text();
      const result = textResponse ? JSON.parse(textResponse) : {};
        const tablesArray = Array.isArray(result.tables) ? result.tables : result;
        return tablesArray.reduce((map, table) => {
          map[table.id] = table.name;
          return map;
        }, {});
      } catch (error) {
        console.error("Error fetching tables:", error);
        return {};
      }
    };

    const tableMap = await fetchTables();

    // Fetch service requests
    fetchData('/backend/read_service_requests.php', (requests) => {
      const enrichedRequests = requests.map(request => ({
        ...request,
        table_name: tableMap[request.table_id] || `Table ${request.table_id}`
      }));
      setRequests(enrichedRequests);
    }, "Error fetching service requests");

    setLoading(false);
  };

  useEffect(() => {
    loadData();
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

  const updateStatus = async (requestId, status) => {
    try {
      const response = await fetch('/backend/update_service_request_status.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: parseInt(requestId, 10), status: status === "in_process" ? "in_process" : status })
      });
      const result = await response.json();
      if (result.success) {
        alert(`Request status updated to ${status}.`);
        loadData();
      } else {
        console.error("Failed to update status:", result.message);
        alert("Failed to update status. Please try again.");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("An error occurred while updating the status. Please try again.");
    }
  };

  const assignTable = (tableId) => {
    setCurrentUser(prev => {
      const updatedTables = prev.assigned_tables.includes(tableId)
        ? prev.assigned_tables.filter(t => t !== tableId)
        : [...prev.assigned_tables, tableId];
      return { ...prev, assigned_tables: updatedTables };
    });
  };

  const handleAddRequest = () => {
    setShowAddDialog(true);
    setNewRequest({ table_id: "", type: "water", details: "" });
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
              <Button variant="ghost" size="sm" className="ml-2" onClick={handleRefresh}>
                <RefreshCw className="w-3 h-3 mr-1" />
                Refresh Now
              </Button>
            </p>
          </div>
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
                {tables.length === 0 && <p className="text-gray-500">No tables available to assign</p>}
              </div>
            </CardContent>
          </Card>
        )}
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="all">All Requests</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="in_process">In Process</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="grid gap-4">
          {filteredRequests.map(request => (
            <Card key={request.id} className="overflow-hidden border-l-4 border-blue-500 shadow-md">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <Table2 className="w-5 h-5 text-blue-500" />
                    <CardTitle className="text-blue-700 font-semibold">{request.table_number || `Table ${request.table_id}`}</CardTitle>
                  </div>
                  <Badge variant="outline" className={`capitalize ${
                    request.status === "pending" 
                      ? "bg-yellow-100 text-yellow-700" 
                      : request.status === "in_process" 
                        ? "bg-orange-100 text-orange-700" 
                        : "bg-green-100 text-green-700"
                  }`}>
                    {request.status.replace('_', ' ')}
                  </Badge>
                  <div className="text-sm text-gray-500 mt-1">
                    {(() => {
                      const elapsed = request.status === "completed"
                        ? new Date(request.completed_at).getTime() - new Date(request.created_at).getTime()
                        : Date.now() - new Date(request.created_at).getTime();
                      const minutes = Math.floor(elapsed / 60000);
                      const seconds = Math.floor((elapsed % 60000) / 1000);
                      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
                    })()}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <h3 className="text-lg font-medium capitalize text-gray-800 mb-1">{request.service_name || "Unknown Service"}</h3>
                  {request.details && <p className="text-gray-600 italic">{request.details}</p>}
                  <div className="flex items-center gap-1 text-sm text-gray-500 mt-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>Requested at {new Date(request.created_at).toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  {request.status === "pending" && (
                    <Button onClick={() => updateStatus(request.id, "in_process")} variant="outline" className="border-blue-500 text-blue-500">
                      <Play className="w-4 h-4" />
                      Start Processing
                    </Button>
                  )}
                  <Button 
                    onClick={() => updateStatus(request.id, "completed")} 
                    className="bg-green-600 hover:bg-green-700 text-white"
                    disabled={request.status === "completed"}
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
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
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
                setNewRequest({ table_id: "", type: "water", details: "" });
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
