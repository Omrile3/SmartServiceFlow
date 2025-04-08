
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Image, ShoppingCart } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function Menu() {
  const [menuItems, setMenuItems] = useState([]);
  const [showAddEdit, setShowAddEdit] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [showCart, setShowCart] = useState(false);

  // Load menu items from localStorage when component mounts
  useEffect(() => {
    const savedMenuItems = localStorage.getItem('restaurantMenu');
    if (savedMenuItems) {
      try {
        const parsedItems = JSON.parse(savedMenuItems);
        setMenuItems(parsedItems);
      } catch (error) {
        console.error('Error loading saved menu items:', error);
        // If error loading, use default items
        initializeDefaultMenuItems();
      }
    } else {
      // If no saved items, initialize with defaults
      initializeDefaultMenuItems();
    }
    setLoading(false);
  }, []);

  // Save menu items to localStorage whenever they change
  useEffect(() => {
    if (menuItems.length > 0 && !loading) {
      localStorage.setItem('restaurantMenu', JSON.stringify(menuItems));
    }
  }, [menuItems, loading]);

    // Load cart items from localStorage when component mounts
    useEffect(() => {
      const savedCartItems = localStorage.getItem('shoppingCart');
      if (savedCartItems) {
        try {
          const parsedCartItems = JSON.parse(savedCartItems);
          setCartItems(parsedCartItems);
        } catch (error) {
          console.error('Error loading saved cart items:', error);
        }
      }
    }, []);
  
    // Save cart items to localStorage whenever they change
    useEffect(() => {
      localStorage.setItem('shoppingCart', JSON.stringify(cartItems));
    }, [cartItems]);

  const initializeDefaultMenuItems = () => {
    const defaultItems = [
      {
        id: "item1",
        name: "Classic Burger",
        description: "Beef patty with lettuce, tomato, and special sauce",
        price: 49.90,
        category: "mains",
        available: true,
        image_url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
      },
      {
        id: "item2",
        name: "Caesar Salad",
        description: "Fresh romaine lettuce, croutons, parmesan cheese with Caesar dressing",
        price: 38.90,
        category: "starters",
        available: true,
        image_url: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
      },
      {
        id: "item3",
        name: "Chocolate Cake",
        description: "Rich chocolate cake with ganache frosting",
        price: 29.90,
        category: "desserts",
        available: true,
        image_url: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
      },
      {
        id: "item4",
        name: "Iced Tea",
        description: "Fresh brewed tea with lemon",
        price: 14.90,
        category: "drinks",
        available: true,
        image_url: "https://images.unsplash.com/photo-1499638673689-79a0b5115d87?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
      }
    ];
    setMenuItems(defaultItems);
    localStorage.setItem('restaurantMenu', JSON.stringify(defaultItems));
    console.log("Initialized default menu items:", defaultItems);
  };

  const handleAddItem = () => {
    setEditItem({
      name: "",
      description: "",
      price: 0,
      category: "mains",
      available: true
    });
    setShowAddEdit(true);
  };

  const handleEditItem = (item) => {
    setEditItem(item);
    setShowAddEdit(true);
  };

  const handleSaveItem = async () => {
    const savedMenu = localStorage.getItem('restaurantMenu');
    let currentMenuItems = menuItems;
    
    if (savedMenu) {
      try {
        currentMenuItems = JSON.parse(savedMenu);
      } catch (e) {
        console.error("Error parsing menu:", e);
      }
    }
    
    if (editItem.id) {
      // Editing existing item
      const updatedItems = currentMenuItems.map(item => 
        item.id === editItem.id ? editItem : item
      );
      setMenuItems(updatedItems);
      localStorage.setItem('restaurantMenu', JSON.stringify(updatedItems));
      
      // Trigger storage event to update other tabs
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'restaurantMenu',
        newValue: JSON.stringify(updatedItems)
      }));
    } else {
      // Adding new item
      const newItem = {
        ...editItem,
        id: `item-${Date.now()}`,
      };
      const updatedItems = [...currentMenuItems, newItem];
      setMenuItems(updatedItems);
      localStorage.setItem('restaurantMenu', JSON.stringify(updatedItems));
      
      // Trigger storage event to update other tabs
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'restaurantMenu',
        newValue: JSON.stringify(updatedItems)
      }));
    }
    
    setShowAddEdit(false);
    setEditItem(null);
  };

  const handleDeleteItem = (id) => {
    if (confirm("Are you sure you want to delete this item?")) {
      const itemToDelete = menuItems.find(item => item.id === id);
      const updatedItems = menuItems.filter(item => item.id !== id);
      setMenuItems(updatedItems);
      localStorage.setItem('restaurantMenu', JSON.stringify(updatedItems));
      
      // Trigger storage event to update other tabs
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'restaurantMenu',
        newValue: JSON.stringify(updatedItems)
      }));
      
      alert(`Menu item "${itemToDelete?.name || id}" has been deleted.`);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageLoading(true);
      
      // Simulate image upload with a timeout
      setTimeout(() => {
        // Create a mock image URL based on category
        let mockImageUrl;
        switch(editItem.category) {
          case 'starters':
            mockImageUrl = "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80";
            break;
          case 'desserts':
            mockImageUrl = "https://images.unsplash.com/photo-1565958011703-44f9829ba187?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80";
            break;
          case 'drinks':
            mockImageUrl = "https://images.unsplash.com/photo-1499638673689-79a0b5115d87?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80";
            break;
          default: // mains
            mockImageUrl = "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80";
        }
        
        setEditItem(prev => ({ ...prev, image_url: mockImageUrl }));
        setImageLoading(false);
        alert("Image uploaded successfully!");
      }, 1500);
    }
  };

  const filteredItems = activeCategory === "all" 
    ? menuItems 
    : menuItems.filter(item => item.category === activeCategory);

  const categories = ["all", "starters", "mains", "desserts", "drinks"];

  const handleAddToCart = (item) => {
    const existingItem = cartItems.find(cartItem => cartItem.id === item.id);
  
    if (existingItem) {
      setCartItems(cartItems.map(cartItem =>
        cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
      ));
    } else {
      setCartItems([...cartItems, { ...item, quantity: 1 }]);
    }
  };
  
  const handleRemoveFromCart = (itemId) => {
    setCartItems(cartItems.filter(item => item.id !== itemId));
  };
  
  const handleQuantityChange = (itemId, newQuantity) => {
    setCartItems(cartItems.map(item =>
      item.id === itemId ? { ...item, quantity: parseInt(newQuantity, 10) } : item
    ));
  };
  
  const calculateTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };
  
  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert("Your cart is empty.");
      return;
    }
    
    // Simulate PayPal redirection
    const payWithPaypal = confirm("Would you like to pay via PayPal?");
    
    if (payWithPaypal) {
      // Create a mock PayPal popup
      const width = 450;
      const height = 650;
      const left = window.innerWidth / 2 - width / 2;
      const top = window.innerHeight / 2 - height / 2;
      
      const paypalWindow = window.open('', 'PayPal Checkout', 
        `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=yes`);
      
      if (paypalWindow) {
        const total = calculateTotalPrice();
        
        // Create a simple PayPal-like interface in the popup
        paypalWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>PayPal Checkout</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body { font-family: 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 20px; color: #2c2e2f; }
              .paypal-header { text-align: center; padding-bottom: 20px; border-bottom: 1px solid #eee; }
              .paypal-logo { width: 150px; margin-bottom: 15px; }
              .paypal-content { padding: 20px 0; }
              .order-details { background: #f5f7fa; border-radius: 5px; padding: 15px; margin: 20px 0; }
              .amount { font-size: 22px; font-weight: bold; }
              .btn { background: #0070ba; color: white; border: none; padding: 12px 20px; border-radius: 25px; 
                    width: 100%; font-size: 16px; cursor: pointer; margin-top: 20px; }
              .btn:hover { background: #005ea6; }
              .cancel { text-align: center; margin-top: 15px; }
              .cancel a { color: #0070ba; text-decoration: none; }
              .currency { font-size: 0.9em; }
            </style>
          </head>
          <body>
            <div class="paypal-header">
              <img class="paypal-logo" src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_111x69.jpg" alt="PayPal Logo">
              <h2>PayPal Checkout</h2>
            </div>
            
            <div class="paypal-content">
              <h3>Complete Your Payment</h3>
              <p>You're paying to: Smart Service Flow</p>
              
              <div class="order-details">
                <p>Order details:</p>
                <p class="amount">${total.toFixed(2)} <span class="currency">₪</span></p>
              </div>
              
              <button class="btn" id="pay-btn">Pay Now</button>
              
              <div class="cancel">
                <a href="#" id="cancel-btn">Cancel and return</a>
              </div>
            </div>
            
            <script>
              document.getElementById('pay-btn').addEventListener('click', function() {
                // Show a loading indicator
                this.innerHTML = 'Processing...';
                this.disabled = true;
                // After a delay, show success and close window
                setTimeout(() => {
                  alert('Payment successful!');
                  window.opener.postMessage('paypal-success', '*');
                  window.close();
                }, 1500);
              });
              
              document.getElementById('cancel-btn').addEventListener('click', function(e) {
                e.preventDefault();
                window.opener.postMessage('paypal-cancel', '*');
                window.close();
              });
            </script>
          </body>
          </html>
        `);
        
        // Set up message listener for when PayPal window completes payment
        const messageHandler = (event) => {
          if (event.data === 'paypal-success') {
            alert("Payment completed successfully! Your cart has been cleared.");
            setCartItems([]);
            setShowCart(false);
            localStorage.removeItem('shoppingCart');
            window.removeEventListener('message', messageHandler);
          } else if (event.data === 'paypal-cancel') {
            alert("Payment was cancelled. Your items are still in your cart.");
            window.removeEventListener('message', messageHandler);
          }
        };
        
        window.addEventListener('message', messageHandler);
      } else {
        // If popup blocked, show fallback
        alert('Please allow popups to use PayPal checkout.');
      }
    } else {
      alert("Simulating credit card payment... Payment successful!");
      setCartItems([]);
      setShowCart(false);
      localStorage.removeItem('shoppingCart');
    }
  };

  useEffect(() => {
    const handleStorage = () => {
      const savedMenuItems = localStorage.getItem('restaurantMenu');
      if (savedMenuItems) {
        try {
          const parsedItems = JSON.parse(savedMenuItems);
          setMenuItems(parsedItems);
        } catch (error) {
          console.error('Error loading saved menu items:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  return (
    <div className="p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold">Menu Management</h1>
          <div className="flex gap-4">
            <Button onClick={handleAddItem} className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Add Menu Item
            </Button>
            <Button onClick={() => setShowCart(true)} className="w-full sm:w-auto relative">
              <ShoppingCart className="w-4 h-4 mr-2" />
              View Cart ({cartItems.length})
              {cartItems.length > 0 && (
                <div className="absolute top-[-5px] right-[-5px] bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {cartItems.length}
                </div>
              )}
            </Button>
          </div>
        </div>

        <Tabs 
          defaultValue="all" 
          value={activeCategory}
          onValueChange={setActiveCategory}
          className="mb-6"
        >
          <TabsList className="w-full overflow-x-auto flex whitespace-nowrap">
            {categories.map(category => (
              <TabsTrigger key={category} value={category} className="capitalize flex-shrink-0">
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {loading ? (
            <>
              {[1, 2, 3, 4, 5, 6].map(i => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-gray-200 rounded-md w-2/3"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-32 bg-gray-200 rounded-md mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded-md w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded-md w-3/4"></div>
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            <>
              {filteredItems.map(item => (
                <Card key={item.id} className="overflow-hidden">
                  {item.image_url && (
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={item.image_url} 
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                      <Badge 
                        className={`absolute top-2 right-2 ${
                          item.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {item.available ? 'Available' : 'Unavailable'}
                      </Badge>
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      <span>{item.name}</span>
                      <span className="text-green-600">₪{item.price.toFixed(2)}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{item.description}</p>
                    <Badge className="mt-2 capitalize">{item.category}</Badge>
                  </CardContent>
                  <CardFooter className="flex justify-between items-center bg-gray-50 border-t p-2">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-1"
                        onClick={() => handleEditItem(item)}
                      >
                        <Pencil className="w-3 h-3" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-1 text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteItem(item.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete
                      </Button>
                    </div>
                    <Button
                      size="sm"
                      className="flex items-center gap-1"
                      onClick={() => handleAddToCart(item)}
                    >
                      <ShoppingCart className="w-3 h-3" />
                      Add to Cart
                    </Button>
                  </CardFooter>
                </Card>
              ))}

              {filteredItems.length === 0 && (
                <div className="col-span-full text-center py-12 bg-white rounded-lg border">
                  <p className="text-gray-500">No menu items in this category</p>
                  <Button onClick={handleAddItem} className="mt-4">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Dialog open={showAddEdit} onOpenChange={setShowAddEdit}>
        <DialogContent className="sm:max-w-[500px] p-4 sm:p-6 max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>
              {editItem?.id ? 'Edit Menu Item' : 'Add Menu Item'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {editItem?.image_url && (
              <div className="mb-4">
                <img 
                  src={editItem.image_url} 
                  alt={editItem.name}
                  className="w-full h-48 object-cover rounded-md"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <Input
                value={editItem?.name || ''}
                onChange={e => setEditItem(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Item name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <Textarea
                value={editItem?.description || ''}
                onChange={e => setEditItem(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Item description"
                className="min-h-[100px]"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Price (₪)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={editItem?.price || ''}
                  onChange={e => setEditItem(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select 
                  className="w-full rounded-md border border-gray-300 p-2"
                  value={editItem?.category || ''}
                  onChange={e => setEditItem(prev => ({ ...prev, category: e.target.value }))}
                >
                  <option value="starters">Starters</option>
                  <option value="mains">Mains</option>
                  <option value="desserts">Desserts</option>
                  <option value="drinks">Drinks</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="available"
                checked={editItem?.available}
                onChange={e => setEditItem(prev => ({ ...prev, available: e.target.checked }))}
              />
              <label htmlFor="available">Item is available</label>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Image</label>
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={imageLoading}
                />
                {imageLoading && <span className="text-sm">Uploading...</span>}
              </div>
            </div>
          </div>
          <DialogFooter className="sm:justify-end gap-2">
            <Button variant="outline" onClick={() => setShowAddEdit(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveItem}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showCart} onOpenChange={() => setShowCart(false)}>
        <DialogContent className="sm:max-w-[500px] p-4 sm:p-6 max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Shopping Cart</DialogTitle>
          </DialogHeader>
          <div>
            {cartItems.length === 0 ? (
              <p>Your cart is empty.</p>
            ) : (
              <ul>
                {cartItems.map(item => (
                  <li key={item.id} className="flex items-center justify-between py-2 border-b">
                    <div className="flex items-center">
                      <img src={item.image_url} alt={item.name} className="w-16 h-16 object-cover rounded mr-4" />
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-gray-600">₪{item.price.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                        className="w-20 text-center"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="ml-2 text-red-600 hover:text-red-700"
                        onClick={() => handleRemoveFromCart(item.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <DialogFooter className="sm:justify-between">
            <div className="font-bold">Total: ₪{calculateTotalPrice().toFixed(2)}</div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowCart(false)}>
                Continue Shopping
              </Button>
              <Button onClick={handleCheckout} disabled={cartItems.length === 0}>
                Checkout
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
