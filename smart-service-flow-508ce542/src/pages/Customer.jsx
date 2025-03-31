import React, { useState, useEffect } from "react";
import { MenuItem } from "@/api/entities";
import { ServiceRequest } from "@/api/entities";
import { Order } from "@/api/entities";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode, AlertCircle, Users, TableProperties, LucideUtensils, Clipboard } from "lucide-react";
import MenuDisplay from "../components/customer/MenuDisplay";
import ServiceRequestDisplay from "../components/customer/ServiceRequestDisplay";
import CameraScanner from "../components/customer/CameraScanner";

export default function Customer() {
  const [menuItems, setMenuItems] = useState([
    {
      id: "item1",
      name: "Classic Burger",
      description: "Beef patty with lettuce, tomato, and special sauce",
      price: 12.99,
      category: "mains",
      available: true,
      image_url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: "item2",
      name: "Caesar Salad",
      description: "Fresh romaine lettuce, croutons, parmesan cheese with Caesar dressing",
      price: 8.99,
      category: "starters",
      available: true,
      image_url: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: "item3",
      name: "Chocolate Cake",
      description: "Rich chocolate cake with ganache frosting",
      price: 6.99,
      category: "desserts",
      available: true,
      image_url: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: "item4",
      name: "Iced Tea",
      description: "Fresh brewed tea with lemon",
      price: 3.99,
      category: "drinks",
      available: true,
      image_url: "https://images.unsplash.com/photo-1499638673689-79a0b5115d87?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    }
  ]);
  const [serviceRequests, setServiceRequests] = useState([]);
  const [tableId, setTableId] = useState(null);
  const [tableInfo, setTableInfo] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("menu");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const table = params.get('table');
    if (table) {
      setTableId(table);
      // Mock table info since we can't fetch from backend
      setTableInfo({
        id: table,
        seats: 4
      });
    } else {
      setShowScanner(true);
    }
  }, []);

  const handleServiceRequest = async (type, details) => {
    // Create a mock service request since we can't use backend
    const newRequest = {
      id: `req-${Date.now()}`,
      table_id: tableId,
      type,
      details,
      status: "pending",
      created_date: new Date().toISOString()
    };
    setServiceRequests(prev => [...prev, newRequest]);
    return true;
  };

  const handleOrder = async (items) => {
    try {
      // Calculate total amount
      const total = items.reduce((sum, item) => {
        const menuItem = menuItems.find(mi => mi.id === item.menu_item_id);
        return sum + (menuItem?.price || 0) * item.quantity;
      }, 0);
      
      // Create a mock order
      const newOrder = {
        id: `order-${Date.now()}`,
        table_id: tableId,
        items,
        status: "pending",
        payment_status: "unpaid",
        total_amount: total,
        created_date: new Date().toISOString()
      };
      
      setOrders(prev => [...prev, newOrder]);
      return true;
    } catch (error) {
      console.error("Error placing order:", error);
      return false;
    }
  };

  const handleQrCodeScanned = (data) => {
    try {
      // Try to parse the QR code data to extract table ID
      const url = new URL(data);
      const params = new URLSearchParams(url.search);
      const scannedTableId = params.get('table');
      
      if (scannedTableId) {
        setTableId(scannedTableId);
        setShowScanner(false);
        // Mock table info
        setTableInfo({
          id: scannedTableId,
          seats: 4
        });
      }
    } catch (error) {
      console.error("Invalid QR code:", error);
      // Set a default table ID if QR scan fails
      setTableId("table-1");
      setShowScanner(false);
      setTableInfo({
        id: "table-1",
        seats: 4
      });
    }
  };

  if (showScanner) {
    return (
      <div className="container mx-auto px-4 py-12 pt-20">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <QrCode className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold">Scan Table QR Code</h1>
            <p className="text-gray-600 mt-2">
              Please scan the QR code on your table to view the menu and place orders
            </p>
          </div>
          <CameraScanner onScanSuccess={handleQrCodeScanned} />
          
          {/* Bypass QR code option for demo */}
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
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold">
          Restaurant Menu
        </h1>
      </div>
      
      {/* Table Information Card */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <TableProperties className="w-5 h-5 text-blue-500" />
            Table Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-6">
            <div>
              <p className="text-sm text-gray-500">Table ID</p>
              <p className="font-medium">{tableId}</p>
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
          <MenuDisplay items={menuItems} onOrder={handleOrder} />
        </TabsContent>
        <TabsContent value="service">
          <ServiceRequestDisplay 
            requests={serviceRequests} 
            onNewRequest={handleServiceRequest}
          />
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
                  <Card key={order.id} className={`overflow-hidden border-l-4 ${
                    order.status === 'paid' 
                      ? 'border-l-green-500' 
                      : order.status === 'confirmed' || order.status === 'preparing'
                        ? 'border-l-blue-500'
                        : 'border-l-orange-500'
                  }`}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">
                          Order #{order.id.slice(-4)}
                        </CardTitle>
                        <div className={`px-2 py-1 rounded-full text-xs uppercase font-semibold ${
                          order.status === 'paid' 
                            ? 'bg-green-100 text-green-800' 
                            : order.status === 'confirmed' || order.status === 'preparing'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-orange-100 text-orange-800'
                        }`}>
                          {order.status}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 mb-4">
                        {order.items?.map((item, idx) => {
                          const menuItem = menuItems.find(m => m.id === item.menu_item_id);
                          return menuItem ? (
                            <div key={idx} className="flex justify-between">
                              <div>
                                <span className="font-medium">{menuItem.name}</span>
                                <div className="text-sm text-gray-600">
                                  {item.quantity} × ${menuItem.price?.toFixed(2)}
                                </div>
                              </div>
                              <div className="font-medium">
                                ${(menuItem.price * item.quantity).toFixed(2)}
                              </div>
                            </div>
                          ) : null;
                        })}
                      </div>
                      
                      <div className="flex justify-between pt-2 border-t">
                        <span className="font-bold">Total</span>
                        <span className="font-bold">${order.total_amount?.toFixed(2)}</span>
                      </div>
                      
                      <div className="mt-4 text-sm text-gray-500">
                        Ordered at {new Date(order.created_date).toLocaleTimeString()}
                      </div>
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