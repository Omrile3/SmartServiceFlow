import React, { useState, useEffect } from "react";
import { MenuItem } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Image } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UploadFile } from "@/api/integrations";
import { Badge } from "@/components/ui/badge";

export default function Menu() {
  const [menuItems, setMenuItems] = useState([]);
  const [showAddEdit, setShowAddEdit] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

  useEffect(() => {
    loadMenuItems();
  }, []);

  const loadMenuItems = async () => {
    setLoading(true);
    const items = await MenuItem.list();
    setMenuItems(items);
    setLoading(false);
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
    try {
      if (editItem.id) {
        await MenuItem.update(editItem.id, editItem);
      } else {
        await MenuItem.create(editItem);
      }
      setShowAddEdit(false);
      loadMenuItems();
    } catch (error) {
      console.error("Error saving menu item:", error);
    }
  };

  const handleDeleteItem = async (id) => {
    if (confirm("Are you sure you want to delete this item?")) {
      await MenuItem.delete(id);
      loadMenuItems();
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageLoading(true);
      try {
        const { file_url } = await UploadFile({ file });
        setEditItem(prev => ({ ...prev, image_url: file_url }));
      } catch (error) {
        console.error("Error uploading image:", error);
      }
      setImageLoading(false);
    }
  };

  const filteredItems = activeCategory === "all" 
    ? menuItems 
    : menuItems.filter(item => item.category === activeCategory);

  const categories = ["all", "starters", "mains", "desserts", "drinks"];

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold">Menu Management</h1>
          <Button onClick={handleAddItem}>
            <Plus className="w-4 h-4 mr-2" />
            Add Menu Item
          </Button>
        </div>

        <Tabs 
          defaultValue="all" 
          value={activeCategory}
          onValueChange={setActiveCategory}
          className="mb-6"
        >
          <TabsList>
            {categories.map(category => (
              <TabsTrigger key={category} value={category} className="capitalize">
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    <span className="text-green-600">${item.price.toFixed(2)}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{item.description}</p>
                  <Badge className="mt-2 capitalize">{item.category}</Badge>
                </CardContent>
                <CardFooter className="flex justify-end gap-2 bg-gray-50 border-t p-2">
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
          </div>
        )}
      </div>

      <Dialog open={showAddEdit} onOpenChange={setShowAddEdit}>
        <DialogContent className="sm:max-w-md">
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
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Price ($)</label>
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddEdit(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveItem}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}