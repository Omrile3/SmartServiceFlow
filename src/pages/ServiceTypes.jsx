import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  Plus,
  Pencil,
  Trash2,
  AlertCircle,
  Table2,
  GlassWater,
  UtensilsCrossed,
  Coffee,
  SlidersHorizontal,
  HelpCircle,
  HandHelping,
  Check,
  X
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ServiceTypes() {
  const [serviceTypes, setServiceTypes] = useState([]);
  const [showAddEdit, setShowAddEdit] = useState(false);
  const [editingType, setEditingType] = useState({
    name: "",
    description: "",
    icon: "help",
    active: false,
  });
  const [loading, setLoading] = useState(true);

  const availableIcons = [
    { id: "water", icon: <GlassWater className="w-4 h-4" />, label: "Water" },
    { id: "utensils", icon: <UtensilsCrossed className="w-4 h-4" />, label: "Utensils" },
    { id: "coffee", icon: <Coffee className="w-4 h-4" />, label: "Coffee" },
    { id: "napkins", icon: <Table2 className="w-4 h-4" />, label: "Napkins" },
    { id: "assistance", icon: <HandHelping className="w-4 h-4" />, label: "Assistance" },
    { id: "settings", icon: <SlidersHorizontal className="w-4 h-4" />, label: "Settings" },
    { id: "help", icon: <HelpCircle className="w-4 h-4" />, label: "Help" },
    { id: "other", icon: <AlertCircle className="w-4 h-4" />, label: "Other" }
  ];

  // Fetch service types from the backend
  useEffect(() => {
    fetch('/backend/read_service_types.php')
      .then(response => response.json())
      .then(data => setServiceTypes(data))
      .catch(error => console.error("Error fetching service types:", error))
      .finally(() => setLoading(false));
  }, []);

  const handleAddServiceType = () => {
    setEditingType({
      name: "",
      description: "",
      icon: "help",
      active: false,
    });
    setShowAddEdit(true);
  };

  const handleEditServiceType = (type) => {
    setEditingType({ ...type });
    setShowAddEdit(true);
  };

  const handleSaveServiceType = () => {
    const endpoint = editingType.id
      ? '/backend/update_service_type.php'
      : '/backend/create_service_type.php';
    const formData = new FormData();
    Object.keys(editingType).forEach((key) => {
      if (key === "icon") {
        formData.append(key, editingType[key] || "help");
      } else {
        if (key === "active") {
          formData.append(key, editingType[key] ? 1 : 0);
        } else {
          formData.append(key, editingType[key]);
        }
      }
    });

    fetch(endpoint, {
      method: 'POST',
      body: formData,
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          fetch('/backend/read_service_types.php')
            .then(response => response.json())
            .then(data => setServiceTypes(data))
            .catch(error => console.error("Error refreshing service types:", error));
        } else {
          console.error("Error saving service type:", data.message);
        }
      })
      .catch(error => console.error("Error saving service type:", error));
    
    setShowAddEdit(false);
    setEditingType(null);
  };

  const toggleServiceTypeStatus = (id) => {
    setServiceTypes(prev => 
      prev.map(type => 
        type.id === id ? { ...type, active: !type.active } : type
      )
    );
  };

  const handleDeleteServiceType = (id) => {
    if (confirm("Are you sure you want to delete this service type?")) {
      fetch('/backend/delete_service_type.php', {
        method: 'POST',
        body: new URLSearchParams({ id }),
      })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            setServiceTypes(prev => prev.filter(type => type.id !== id));
          } else {
            console.error("Error deleting service type:", data.message);
          }
        })
        .catch(error => console.error("Error deleting service type:", error));
    }
  };

  const getIconComponent = (iconId) => {
    const found = availableIcons.find(i => i.id === iconId);
    return found ? found.icon : <HelpCircle className="w-4 h-4" />;
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Service Type Management</h1>
            <p className="text-gray-500">Configure the types of services customers can request</p>
          </div>
          <Button onClick={handleAddServiceType} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Add Service Type
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : serviceTypes.length === 0 ? (
          <Card className="mb-6 text-center p-12">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">No Service Types Defined</h2>
            <p className="text-gray-500 mb-6">Create service types to allow customers to request specific services</p>
            <Button onClick={handleAddServiceType}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Service Type
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {serviceTypes.map(type => (
              <Card 
                key={type.id} 
                className={`overflow-hidden transition-colors ${
                  !type.active ? 'bg-gray-50 border-gray-200' : ''
                }`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-full ${type.active ? 'bg-blue-100' : 'bg-gray-100'}`}>
                        {getIconComponent(type.icon || "help")}
                      </div>
                      <CardTitle className={type.active ? '' : 'text-gray-500'}>
                        {type.name}
                      </CardTitle>
                    </div>
                    <Badge variant={type.active ? "default" : "secondary"}>
                      {type.active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className={`text-sm ${type.active ? 'text-gray-600' : 'text-gray-400'}`}>
                    {type.description}
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between items-center border-t bg-gray-50 p-2">
                  <div className="flex items-center gap-2">
                    <Switch 
                      checked={type.active} 
                      onCheckedChange={() => toggleServiceTypeStatus(type.id)}
                      aria-label={`Toggle ${type.name} active status`}
                    />
                    <span className="text-sm text-gray-500">
                      {type.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-8 px-2"
                      onClick={() => handleEditServiceType(type)}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-8 px-2 text-red-600 hover:text-red-700"
                      onClick={() => handleDeleteServiceType(type.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={showAddEdit} onOpenChange={setShowAddEdit}>
        <DialogContent className="sm:max-w-[500px] p-4 sm:p-6 max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>
              {editingType?.id ? 'Edit Service Type' : 'Add Service Type'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <Input
                value={editingType?.name || ''}
                onChange={e => setEditingType(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Service type name (e.g. Water)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <Textarea
                value={editingType?.description || ''}
                onChange={e => setEditingType(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what this service offers"
                className="min-h-[80px]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Icon</label>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {availableIcons.map(iconOption => (
                  <Button
                    key={iconOption.id}
                    type="button"
                    variant={editingType?.icon === iconOption.id ? "default" : "outline"}
                    className="flex flex-col items-center p-2 h-auto gap-1"
                    onClick={() => setEditingType(prev => ({ ...prev, icon: iconOption.id }))}
                  >
                    {iconOption.icon}
                    <span className="text-xs">{iconOption.label}</span>
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={editingType?.active !== undefined ? editingType.active : false}
                onCheckedChange={checked => setEditingType(prev => ({ ...prev, active: checked }))}
                id="service-active"
              />
              <label htmlFor="service-active" className="text-sm font-medium">
                Service type is active
              </label>
            </div>
          </div>
          <DialogFooter className="sm:justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowAddEdit(false);
                setEditingType(null);
              }}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button 
              onClick={handleSaveServiceType}
              disabled={!editingType?.name}
            >
              <Check className="w-4 h-4 mr-2" />
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
