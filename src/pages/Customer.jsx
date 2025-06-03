
import React, { useState, useEffect } from "react";
import { MenuItem } from "@/api/entities";
import { ServiceRequest } from "@/api/entities";
import { Order } from "@/api/entities";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode, AlertCircle, Users, TableProperties, LucideUtensils, Clipboard, GlassWater, UtensilsCrossed, Coffee, Table2, HandHelping, SlidersHorizontal, HelpCircle, Clock, Play, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { createOrder, captureOrder } from "@/api/paypalClient";
import MenuDisplay from "../components/customer/MenuDisplay";
import ServiceRequestDisplay from "../components/customer/ServiceRequestDisplay";
import CameraScanner from "../components/customer/CameraScanner";

const getIconComponent = (iconId) => {
  const iconMap = {
    water: <GlassWater className="w-6 h-6 text-blue-600" />,
    utensils: <UtensilsCrossed className="w-6 h-6 text-blue-600" />,
    coffee: <Coffee className="w-6 h-6 text-blue-600" />,
    napkins: <Table2 className="w-6 h-6 text-blue-600" />,
    assistance: <HandHelping className="w-6 h-6 text-blue-600" />,
    settings: <SlidersHorizontal className="w-6 h-6 text-blue-600" />,
    help: <HelpCircle className="w-6 h-6 text-blue-600" />,
    other: <AlertCircle className="w-6 h-6 text-blue-600" />,
  };
  return iconMap[iconId] || <HelpCircle className="w-6 h-6 text-gray-400" />;
};

export default function Customer() {
  const [menuItems, setMenuItems] = useState([]);
  const [serviceRequests, setServiceRequests] = useState([]);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [tableId, setTableId] = useState(null);
  const [tableInfo, setTableInfo] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("menu");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // First check if we have a table in URL params
    const params = new URLSearchParams(window.location.search);
    const tableParam = params.get('table');
    
    // Then check if we have a saved table in localStorage
    const savedCustomerTable = localStorage.getItem('customerAssignedTable');
    
    // Determine which table to use (URL param takes priority)
    let tableToUse = tableParam;
    if (!tableToUse && savedCustomerTable) {
      try {
        const parsedTable = JSON.parse(savedCustomerTable);
        tableToUse = parsedTable.id;
      } catch (error) {
        console.error("Error parsing saved table:", error);
      }
    }
    
    if (tableToUse) {
      setTableId(tableToUse);
      loadTableInfo(tableToUse);
    } else {
      setShowScanner(true);
    }
    
    // Fetch menu items and active service types from the backend
    const loadMenuItems = async () => {
      try {
        const response = await fetch('/backend/read_menu_items.php');
                              const textResponse = await response.text();
                              const result = textResponse ? JSON.parse(textResponse) : {};

        if (Array.isArray(result)) {
          setMenuItems(result);
        } else {
          console.error("Failed to fetch menu items:", result);
        }
      } catch (error) {
        console.error("Error fetching menu items:", error);
      }
    };

    loadMenuItems();
    fetch('/backend/read_service_types.php')
      .then(response => response.json())
      .then(data => {
        const activeServices = data.filter(service => service.active === 1);
        setServiceTypes(activeServices);
      })
      .catch(error => console.error("Error fetching service types:", error));
    // Set up listener for storage events to detect menu changes (excluding restaurantMenu)
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Removed loadMenuItems function, MenuDisplay will handle fetching.

  const handleStorageChange = (event) => {
    // Removed restaurantMenu handling, MenuDisplay handles its own data.
    if (event.key === 'serviceRequests') {
      loadServiceRequests();
    } else if (event.key === 'orders') {
      loadOrders();
    }
  };

  // Removed useEffect that was calling loadMenuItems

  useEffect(() => {
    // When tableId changes, save it to localStorage and load related data
    if (tableId) {
      localStorage.setItem('customerAssignedTable', JSON.stringify({ id: tableId }));
      loadServiceRequests();
      loadOrders();

      // Set up polling for real-time updates
      const interval = setInterval(() => {
        loadServiceRequests();
      }, 5000); // Poll every 5 seconds

      return () => clearInterval(interval); // Cleanup on unmount
    }
  }, [tableId]);

  // Modified loadTableInfo function to ensure we're using the exact table ID
  const loadTableInfo = (tableId) => {
    // Check if we have table info in localStorage
    const savedTables = localStorage.getItem('restaurantTables');
    if (savedTables) {
      try {
        const parsedTables = JSON.parse(savedTables);
        // Use exact match for table ID
        const foundTable = parsedTables.find(t => t.id === tableId);
        if (foundTable) {
          setTableInfo({
            id: tableId, // Use the exact ID that was passed
            seats: foundTable.seats
          });
        } else {
          // If table not found in saved tables
          setTableInfo({
            id: tableId, // Use the exact ID that was passed
            seats: 4
          });
        }
      } catch (error) {
        console.error("Error loading table info:", error);
        setTableInfo({
          id: tableId, // Use the exact ID that was passed
          seats: 4
        });
      }
    } else {
      // No saved tables
      setTableInfo({
        id: tableId, // Use the exact ID that was passed
        seats: 4
      });
    }
  };

  const loadServiceRequests = async () => {
    try {
      const response = await fetch(`/backend/read_service_requests.php?table_id=${tableId}`);
      const result = await response.json();

      if (Array.isArray(result)) {
        const enrichedRequests = result.map(req => {
          const iconComponent = (
            <div className="p-2 rounded-full bg-blue-200 shadow-md flex items-center justify-center">
              {getIconComponent(req.icon || "help")}
            </div>
          );
          return {
            ...req,
            icon: iconComponent,
            id: req.id, // Include the ID of the service request
            name: req.service_name || `Service ID: ${req.service_type_id}`,
          };
        });
        setServiceRequests(enrichedRequests);
      } else {
        console.error("Failed to fetch service requests:", result);
      }
    } catch (error) {
      console.error("Error fetching service requests:", error);
    }
  };

  const loadOrders = async () => {
    try {
      const response = await fetch(`/backend/read_orders.php?table_id=${tableId}`);
      const result = await response.json();

      console.log("Orders API Response:", result);
      if (result.success) {
        console.log("Current tableId state:", tableId);
        console.log("Orders table_id values from API:", result.orders.map(order => order.table_id));
        const validOrders = result.orders.filter(order => order.table_id == tableId);
        setOrders(validOrders);
        console.log("Orders state after setting:", validOrders);
      } else {
        console.error("Failed to fetch orders:", result.message);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const handleServiceRequest = async (serviceTypeId) => {
    try {
      const response = await fetch('/backend/create_service_request.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table_id: tableId, service_type_id: serviceTypeId })
      });

      const result = await response.json();
      if (result.success) {
        loadServiceRequests(); // Refresh the service requests
        return true;
      } else {
        console.error(result.message);
        return false;
      }
    } catch (error) {
      console.error("Error creating service request:", error);
      return false;
    }
  };

  const handleOrder = async (items) => {
    try {
      // MenuDisplay will use its own fetched menuItems for price calculation if needed,
      // or this logic needs to be updated to fetch if prices are not available.
      // For now, assuming MenuDisplay handles prices internally or this function gets updated menuItems.
      // Calculate total amount
      console.log("Menu Items:", menuItems);

      if (menuItems.length === 0) {
        alert("Menu items are not loaded. Please refresh the page and try again.");
        return false;
      }

      const total = items.reduce((sum, item) => {
        const menuItem = menuItems.find(mi => mi.id === item.menu_item_id);
        if (!menuItem) {
          console.error(`Menu item with ID ${item.menu_item_id} not found.`);
          alert(`Menu item with ID ${item.menu_item_id} not found. Please check your order.`);
          return sum;
        }
        return sum + menuItem.price * item.quantity;
      }, 0);

      console.log("Calculated Total Amount:", total);
      
      // Create a new order
      try {
        const response = await fetch('/backend/create_order.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            table_id: tableId,
            items: items.map(item => ({
              menu_item_id: item.menu_item_id,
              quantity: item.quantity
            })),
            total_amount: total
          })
        });

        const textResponse = await response.text();
        console.log("Raw Response:", textResponse);

        try {
          const result = JSON.parse(textResponse);
          if (result.success) {
            loadOrders(); // Refresh orders from the backend
          } else {
            console.error(result.message);
            alert("Failed to place order: " + result.message);
          }
        } catch (error) {
          console.error("Error parsing JSON response:", error);
          alert("Failed to place order: Invalid server response.");
        }
      } catch (error) {
        console.error("Error placing order:", error);
        alert("An error occurred while placing the order. Please try again.");
      }
      
      // Update table status to occupied
      updateTableStatus(tableId, 'occupied');
      
      return true;
    } catch (error) {
      console.error("Error placing order:", error);
      return false;
    }
  };

  // Helper function to update table status
  const updateTableStatus = (tableId, status) => {
    const savedStatuses = localStorage.getItem('tableStatuses');
    let tableStatuses = {};
    
    if (savedStatuses) {
      try {
        tableStatuses = JSON.parse(savedStatuses);
      } catch (e) {
        console.error("Error parsing table statuses:", e);
      }
    }
    
    tableStatuses[tableId] = { status, lastUpdated: new Date().toISOString() };
    localStorage.setItem('tableStatuses', JSON.stringify(tableStatuses));
  };

  const handleQrCodeScanned = (data) => {
    try {
      // Try to parse the QR code data to extract table ID
      // First try as URL
      try {
        const url = new URL(data);
        const params = new URLSearchParams(url.search);
        const scannedTableId = params.get('table');

        if (scannedTableId) {
          setTableId(scannedTableId);
          setShowScanner(false);
          loadTableInfo(scannedTableId);
        }
      } catch (error) {
        console.error("Failed to process QR code:", error);
      }
    } catch (error) {
      console.error("Invalid QR code:", error);
      // Set a default table ID if QR scan fails
      console.error("Invalid QR code or table ID. Please scan a valid QR code.");
      alert("Invalid QR code or table ID. Please scan a valid QR code.");
      
      // Demo menu initialization is removed. MenuDisplay handles its data.
    }
  };

  // Removed initializeDemoMenu function.

  const resetTable = () => {
    localStorage.removeItem('customerAssignedTable');
    setTableId(null);
    setTableInfo(null);
    setShowScanner(true);
    setServiceRequests([]);
    setOrders([]);
  };

  if (showScanner) {
    return (
      <div className="container mx-auto px-4 py-8 pt-20">
        <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <QrCode className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h1 className="text-2xl font-bold">Scan Table QR Code</h1>
              <p className="text-gray-600 mt-2">
                Please scan the QR code on your table to view the menu and place orders
              </p>
                        </div>
                        
            <CameraScanner onScanSuccess={handleQrCodeScanned} />
            
            <div className="mt-8 text-center">
              <p className="text-gray-600 mb-4">For demo purposes:</p>
              <Button 
                variant="outline"
                onClick={() => {
                  setTableId("table-demo");
                  setShowScanner(false);
                  setTableInfo({
                    id: "table-demo",
                    seats: 4
                  });
                  // Demo menu initialization is removed.
                }}
              >
                Skip QR Scan (Demo Mode)
              </Button>
            </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 pt-20 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!tableId) {
    return (
      <div className="container mx-auto px-4 py-12 pt-20">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Invalid table. Please scan a valid QR code to access the menu.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 pt-20">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          Smart Service Flow Menu
        </h1>
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={resetTable}
            className="text-xs"
          >
            Reset Experience
          </Button>
        </div>
      </div>
      
      {/* Table Information Card */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <TableProperties className="w-5 h-5 text-blue-500" />
              Table Information
            </CardTitle>
            <div className="flex justify-between items-center">
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-6">
            <div>
<p className="text-sm text-gray-500">Table ID</p>
<p className="font-medium">{tableInfo?.table_number || `Table ${tableId}`}</p>
            </div>
            
            {tableInfo && (
              <div>
                <p className="text-sm text-gray-500">Seats</p>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4 text-gray-600" />
                  <p className="font-medium">{tableInfo.seats}</p>
                </div>
              </div>
            )}
            
            <div>
              <p className="text-sm text-gray-500">Active Requests</p>
              <p className="font-medium">{serviceRequests.length}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Orders Placed</p>
              <p className="font-medium">{orders.length}</p>
            </div>
          </div>
                </CardContent>
                <div className="mt-4">
                 
                </div>
      </Card>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="menu" className="text-base flex items-center gap-2">
            <LucideUtensils className="w-4 h-4" />
            Menu
          </TabsTrigger>
          <TabsTrigger value="service" className="text-base flex items-center gap-2">
            <Clipboard className="w-4 h-4" />
            Service
            {serviceRequests.length > 0 && (
              <span className="ml-1 bg-blue-100 text-blue-800 rounded-full px-2 py-0.5 text-xs">
                {serviceRequests.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="orders" className="text-base flex items-center gap-2">
            <Clipboard className="w-4 h-4" />
            Orders
            {orders.length > 0 && (
              <span className="ml-1 bg-green-100 text-green-800 rounded-full px-2 py-0.5 text-xs">
                {orders.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="menu">
          {/* Removed items={menuItems} prop, MenuDisplay will fetch its own data */}
<MenuDisplay onOrder={handleOrder} tableId={tableId} disableUnavailableItems />
        </TabsContent>
        <TabsContent value="service">
          <div className="py-4">
            <h2 className="text-xl font-bold mb-4">Request a Service</h2>
            <div className="grid gap-6 sm:grid-cols-3 lg:grid-cols-4">
              {serviceTypes.map(service => (
                <Card key={service.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex flex-col items-center mb-2">
                      <div className="p-3 rounded-full bg-blue-200 shadow-md flex items-center justify-center">
                        {getIconComponent(service.icon)}
                      </div>
                      <CardTitle className="mt-2 text-center">{service.name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 text-center">{service.description}</p>
                  </CardContent>
                    <CardFooter className="flex justify-center">
                      <Button 
                        onClick={() => handleServiceRequest(service.id, service.name)}
                        className="w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Request
                      </Button>
                    </CardFooter>
                </Card>
              ))}
            </div>

            <h2 className="text-xl font-bold mt-8 mb-4">Active Requests</h2>
            {serviceRequests.length === 0 ? (
              <div className="text-center py-8 bg-white rounded-lg border">
                <p className="text-gray-500">No active requests</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {serviceRequests.map(request => (
                  <Card key={request.id} className="overflow-hidden border-l-4 border-blue-500 shadow-md">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <Table2 className="w-5 h-5 text-blue-500" />
                          <CardTitle className="text-blue-700 font-semibold">{request.name}</CardTitle>
                        </div>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className={`capitalize ${
                            request.status === "pending" 
                              ? "bg-yellow-100 text-yellow-700" 
                              : request.status === "in_process" 
                                ? "bg-orange-100 text-orange-700" 
                                : "bg-green-100 text-green-700"
                          } ml-auto`}>
                            {request.status.replace('_', ' ')}
                          </Badge>
                          <span className="text-sm text-gray-500 ml-4">
                            {(() => {
                              const elapsed = request.status === "completed"
                                ? new Date(request.completed_at).getTime() - new Date(request.created_at).getTime()
                                : Date.now() - new Date(request.created_at).getTime();
                              const adjustedElapsed = elapsed - (9 * 60 * 1000 + 54 * 1000); // Subtract 9:54 minutes since the server is 9:54 minutes late
                              const minutes = Math.floor(adjustedElapsed / 60000);
                              const seconds = Math.floor((adjustedElapsed % 60000) / 1000);
                              return `${minutes}:${seconds.toString().padStart(2, '0')}`;
                            })()}
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4">
                        <h3 className="text-lg font-medium capitalize text-gray-800 mb-1">{request.name}</h3>
                        <p className="text-gray-600 italic">{request.details}</p>
                        <div className="flex items-center gap-1 text-sm text-gray-500 mt-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span>Requested at {new Date(request.created_at).toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Button 
                          variant="outline" 
                          className="w-full text-red-600 hover:text-red-700"
                          disabled={request.status === "completed"}
                          onClick={async () => {
                            try {
                              const response = await fetch('/backend/delete_service_request.php', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ id: request.id })
                              });

                              if (!response.ok) {
                                throw new Error(`HTTP error! status: ${response.status}`);
                              }

                              const result = await response.json();
                              if (result.success) {
                                loadServiceRequests(); // Refresh the service requests
                              } else {
                                console.error(result.message);
                                alert("Failed to delete service request: " + result.message);
                              }
                            } catch (error) {
                              console.error("Error deleting service request:", error);
                              alert("An error occurred while deleting the service request. Please try again.");
                            }
                          }}
                        >
                          Cancel Request
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="orders">
          <div className="py-4">
            <h2 className="text-xl font-bold mb-4">Your Orders</h2>
            
            {orders.length === 0 ? (
              <div className="text-center py-8 bg-white rounded-lg border">
                <p className="text-gray-500">No orders placed yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map(order => (
                  <Card key={order.order_id} className={`overflow-hidden border-l-4 ${
                    order.payment_status === 'paid' 
                      ? 'border-l-green-500' 
                      : 'border-l-orange-500'
                  }`}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">
                          Order #{order.order_id ? String(order.order_id).slice(-4) : "Unknown"}
                        </CardTitle>
<div className={`px-2 py-1 rounded-full text-xs uppercase font-semibold ${
  order.payment_status === 'paid' 
    ? 'bg-green-100 text-green-800' 
    : 'bg-orange-100 text-orange-800'
}`}>
  {order.payment_status === 'paid' ? 'Paid' : 'Unpaid'}
</div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    {order.items?.map((item, idx) => (
                      <div key={`${order.order_id}-${item.menu_item_id}-${idx}`} className="flex justify-between">
                        <div>
                          <span className="font-medium">{item.menu_item_name || "Unknown Item"}</span>
                          <div className="text-sm text-gray-600">
                            Quantity: {item.quantity}
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          ₪{(item.menu_item_price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-between pt-2 border-t">
                    <span className="font-bold">Total</span>
                    <span className="font-bold">₪{order.total_amount?.toFixed(2)}</span>
                  </div>
                  
                  <div className="mt-4 text-sm text-gray-500">
Ordered at {order.created_at ? new Date(order.created_at).toLocaleString() : "Unknown Date"}
                  </div>
<Button
  onClick={async () => {
    try {
      const enrichedItems = order.items.map(item => {
        const menuItem = menuItems.find(m => m.id === item.menu_item_id);
        return {
          name: menuItem?.name || "Unknown Item",
          price: menuItem?.price || 0,
          quantity: item.quantity,
        };
      });
      const approvalUrl = await createOrder(order.total_amount);
      if (approvalUrl) {
const width = 600;
const height = 700;
const left = (window.screen.width - width) / 2;
const top = (window.screen.height - height) / 2;
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
if (isMobile) {
  window.location.href = approvalUrl;
} else {
  const width = 600;
  const height = 700;
  const left = (window.screen.width - width) / 2;
  const top = (window.screen.height - height) / 2;
  window.open(approvalUrl, "_blank", `width=${width},height=${height},top=${top},left=${left}`);
}
      } else {
        console.error('Order creation failed: Approval URL not found');
      }
    } catch (error) {
      console.error('Payment failed:', error);
    }
  }}
  className="bg-blue-600 hover:bg-blue-700 text-white"
>
  Pay with PayPal
</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </TabsContent>
      </Tabs>
    </div>
  );
}
