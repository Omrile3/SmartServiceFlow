import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MinusCircle, PlusCircle, ShoppingCart, Check, AlertCircle, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function MenuDisplay({ items, onOrder, tableId }) {
  const [cart, setCart] = useState({});
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [menuItems, setMenuItems] = useState([]);

  useEffect(() => {
    if (items && items.length > 0) {
      setMenuItems(items);
    } else {
      fetch('/backend/read_menu_items.php')
        .then(response => response.json())
        .then(data => setMenuItems(data))
        .catch(error => console.error("Error fetching menu items:", error));
    }
  }, [items]);

  useEffect(() => {
    const savedCart = localStorage.getItem(`cart-${tableId}`);
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error("Error loading cart:", error);
      }
    }
  }, [tableId]);

  useEffect(() => {
    if (Object.keys(cart).length > 0) {
      localStorage.setItem(`cart-${tableId}`, JSON.stringify(cart));
    } else {
      localStorage.removeItem(`cart-${tableId}`);
    }
  }, [cart, tableId]);

  const addToCart = (item) => {
    setCart(prev => ({
      ...prev,
      [item.id]: (prev[item.id] || 0) + 1
    }));
  };

  const removeFromCart = (item) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[item.id] > 1) {
        newCart[item.id]--;
      } else {
        delete newCart[item.id];
      }
      return newCart;
    });
  };

  const clearCart = () => {
    setCart({});
  };

  const handleOrder = async () => {
    try {
      const orderItems = Object.entries(cart).map(([menu_item_id, quantity]) => ({
        menu_item_id,
        quantity,
        special_instructions: ""
      }));
      const success = await onOrder(orderItems);
      if (success) {
        setOrderComplete(true);
        setCart({});
        localStorage.removeItem(`cart-${tableId}`);
        setTimeout(() => {
          setShowOrderDialog(false);
          setOrderComplete(false);
        }, 3000);
      }
    } catch (error) {
      console.error("Error placing order:", error);
    }
  };

  const categories = ["all", ...new Set(menuItems.filter(item => item.category).map(item => item.category))];
  const filteredItems = activeCategory === "all" 
    ? menuItems.filter(item => item.availability) // Only show available items
    : menuItems.filter(item => item.category === activeCategory && item.availability); // Filter by category and availability

  const cartTotal = Object.entries(cart).reduce((total, [id, quantity]) => {
    const item = menuItems.find(i => i.id === id);
    return total + (item?.price || 0) * quantity;
  }, 0);

  const cartItemCount = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);

  return (
    <div>
      <Tabs 
        defaultValue="all" 
        value={activeCategory}
        onValueChange={setActiveCategory}
        className="mb-6"
      >
        <TabsList className="w-full flex overflow-x-auto">
          {categories.map(category => (
            <TabsTrigger key={category} value={category} className="capitalize">
              {category.replace('_', ' ')}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      
      <div className="grid gap-4 md:grid-cols-2">
        {filteredItems.map(item => (
          <Card key={item.id}>
            {item.image_url && (
              <div className="h-40">
                <img 
                  src={item.image_url} 
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle>{item.name}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{item.description}</p>
              <div className="flex justify-between items-center">
                {item.availability ? (
                  cart[item.id] ? (
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => removeFromCart(item)}
                      >
                        <MinusCircle className="w-4 h-4" />
                      </Button>
                      <span className="font-medium">{cart[item.id]}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => addToCart(item)}
                      >
                        <PlusCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button onClick={() => addToCart(item)}>
                      Add to Order
                    </Button>
                  )
                ) : (
                  <Button disabled className="opacity-50 cursor-not-allowed">
                    Unavailable
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredItems.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border col-span-full">
            <p className="text-gray-500">No items available in this category</p>
          </div>
        )}
      </div>

      {cartItemCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg z-10">
          <div className="max-w-md mx-auto flex items-center justify-between">
            <div>
              <span className="text-gray-600">{cartItemCount} items</span>
              <span className="text-xl font-bold ml-2">
                ₪{cartTotal.toFixed(2)}
              </span>
            </div>
            <Button 
              onClick={() => setShowOrderDialog(true)} 
              className="bg-blue-600 hover:bg-blue-700"
            >
              <ShoppingCart className="w-4 h-4 mr-1" />
              Review Order
            </Button>
          </div>
        </div>
      )}

      <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {orderComplete ? 'Order Placed Successfully!' : 'Review Your Order'}
            </DialogTitle>
          </DialogHeader>
          {orderComplete ? (
            <div className="py-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Thank You!</h3>
              <p className="text-gray-600">Your order has been placed and will be served soon.</p>
            </div>
          ) : (
            <>
              <div className="py-4 space-y-4">
                {Object.entries(cart).map(([id, quantity]) => {
                  const item = menuItems.find(i => i.id === id);
                  return item ? (
                    <div key={id} className="flex justify-between items-center">
                      <div>
                        <span className="font-medium">{item.name}</span>
                        <div className="text-sm text-gray-600">
                          ₪{item.price.toFixed(2)} × {quantity}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="font-medium">
                          ₪{(item.price * quantity).toFixed(2)}
                        </div>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => removeFromCart(item)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : null;
                })}
                <div className="border-t pt-4 flex justify-between font-bold">
                  <span>Total</span>
                  <span>₪{cartTotal.toFixed(2)}</span>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setShowOrderDialog(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleOrder}
                >
                  Place Order
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
