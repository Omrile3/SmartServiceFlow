
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

  useEffect(() => {
    fetch('/backend/read_menu_items.php')
      .then(response => response.json())
      .then(data => setMenuItems(data))
      .catch(error => console.error('Error fetching menu items:', error));
    setLoading(false);
  }, []);

  useEffect(() => {
  }, [menuItems, loading]);

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
        availability: true,
        image_url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
      },
      {
        id: "item2",
        name: "Caesar Salad",
        description: "Fresh romaine lettuce, croutons, parmesan cheese with Caesar dressing",
        price: 38.90,
        category: "starters",
        availability: true,
        image_url: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
      },
      {
        id: "item3",
        name: "Chocolate Cake",
        description: "Rich chocolate cake with ganache frosting",
        price: 29.90,
        category: "desserts",
        availability: true,
        image_url: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
      },
      {
        id: "item4",
        name: "Iced Tea",
        description: "Fresh brewed tea with lemon",
        price: 14.90,
        category: "drinks",
        availability: true,
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
      availability: true
    });
    setShowAddEdit(true);
  };

  const handleEditItem = (item) => {
    console.log("Editing item:", item); // Log the item being edited
    setEditItem(item); // Directly set the item as the editItem state
    setShowAddEdit(true);
  };

  const handleSaveItem = async () => {
    if (!editItem.name || editItem.name.trim() === "") {
      alert("Name is required.");
      return;
    }
    const endpoint = editItem.id ? '/backend/update_menu_item.php' : '/backend/create_menu_item.php';
    const formData = new FormData();
    Object.keys(editItem).forEach(key => {
      if (key === "image_url") {
        if (editItem[key]) {
          formData.append("image", editItem[key]);
        }
      } else if (key === "availability") {
        formData.append("availability", editItem[key] ? 1 : 0);
      } else {
        formData.append(key, editItem[key]);
      }
    });

    console.log("Saving menu item:", Object.fromEntries(formData.entries())); // Log form data
    fetch(endpoint, {
      method: 'POST',
      body: formData,
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          fetch('/backend/read_menu_items.php')
            .then(response => response.json())
            .then(data => {
              console.log("Updated menu items:", data); // Log updated menu items
              console.log("Updated menu items after save:", data); // Log updated menu items
              setMenuItems(data);
            })
            .catch(error => console.error('Error refreshing menu items:', error));
        } else {
          console.error('Error saving menu item:', data.message);
        }
      })
      .catch(error => console.error('Error saving menu item:', error));
    
    setShowAddEdit(false);
    setEditItem(null);
  };

  const handleDeleteItem = (id) => {
    if (confirm("Are you sure you want to delete this item?")) {
      const itemToDelete = menuItems.find(item => item.id === id);
      const formData = new FormData();
      formData.append('id', id);

      fetch('/backend/delete_menu_item.php', {
        method: 'POST',
        body: formData,
      })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            fetch('/backend/read_menu_items.php')
              .then(response => response.json())
              .then(data => setMenuItems(data))
              .catch(error => console.error('Error refreshing menu items:', error));
          } else {
            console.error('Error deleting menu item:', data.message);
          }
        })
        .catch(error => console.error('Error deleting menu item:', error));
      
      alert(`Menu item "${itemToDelete?.name || id}" has been deleted.`);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageLoading(true);
      
      const formData = new FormData();
      formData.append('image', file);

      fetch('/backend/upload_image.php', {
        method: 'POST',
        body: formData,
      })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            setEditItem(prev => ({ ...prev, image_url: data.url }));
            alert("Image uploaded successfully!");
          } else {
            alert("Image upload failed: " + data.message);
          }
        })
        .catch(error => {
          console.error("Error uploading image:", error);
          alert("Image upload failed.");
        })
        .finally(() => {
          setImageLoading(false);
        });
    }
  };

  const filteredItems = activeCategory === "all" 
    ? menuItems 
    : menuItems.filter(item => item.category === activeCategory);

  console.log("Filtered items for display:", filteredItems); // Log filtered items

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
    
alert("Simulating credit card payment... Payment successful!");
setCartItems([]);
setShowCart(false);
localStorage.removeItem('shoppingCart');
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

  console.log("Passing menu items to MenuDisplay:", menuItems); // Log menu items being passed
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
                          item.availability == 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {item.availability == 1 ? 'Available' : 'Unavailable'}
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
                id="availability"
                checked={editItem?.availability}
                onChange={e => setEditItem(prev => ({ ...prev, availability: e.target.checked }))}
              />
              <label htmlFor="availability">Item is available</label>
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

<Button
  onClick={async () => {
    try {
      const orderItems = cartItems.map(item => ({
        menu_item_id: item.id,
        quantity: item.quantity,
        special_instructions: ""
      }));
      const response = await fetch('/backend/create_order.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table_id: "manager-view",
          items: orderItems,
          total_amount: calculateTotalPrice()
        })
      });
      const result = await response.json();
      if (result.success) {
        alert("Order submitted successfully!");
        setCartItems([]);
        setShowCart(false);
        localStorage.removeItem('shoppingCart');
      } else {
        alert("Failed to submit order: " + result.message);
      }
    } catch (error) {
      console.error("Error submitting order:", error);
      alert("An error occurred while submitting the order.");
    }
  }}
  className="bg-blue-600 hover:bg-blue-700 text-white"
>
  Submit Order
</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
