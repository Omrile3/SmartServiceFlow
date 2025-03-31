import React, { useState, useEffect } from "react";
import { Restaurant } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Plus, Minus, Table2 } from "lucide-react";
import QRCode from "../components/tables/QRCode";
import ResizableTable from "../components/tables/ResizableTable";

export default function Tables() {
  const [restaurant, setRestaurant] = useState(null);
  const [tables, setTables] = useState([]);
  const [showAddTable, setShowAddTable] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [newTable, setNewTable] = useState({ seats: 4 });

  useEffect(() => {
    loadRestaurant();
  }, []);

  const loadRestaurant = async () => {
    const restaurants = await Restaurant.list();
    const currentRestaurant = restaurants[0];
    setRestaurant(currentRestaurant);
    setTables(currentRestaurant?.layout?.tables || []);
  };

  const handleAddTable = () => {
    const tableId = `table-${tables.length + 1}`;
    const newTableData = {
      id: tableId,
      x: 50,
      y: 50,
      width: 100,
      height: 100,
      seats: newTable.seats
    };

    setTables([...tables, newTableData]);
    updateRestaurantLayout([...tables, newTableData]);
    setShowAddTable(false);
  };

  const handleTableMove = (tableId, x, y) => {
    const updatedTables = tables.map(table => 
      table.id === tableId ? { ...table, x, y } : table
    );
    setTables(updatedTables);
    updateRestaurantLayout(updatedTables);
  };

  const handleTableResize = (tableId, width, height) => {
    const updatedTables = tables.map(table => 
      table.id === tableId ? { ...table, width, height } : table
    );
    setTables(updatedTables);
    updateRestaurantLayout(updatedTables);
  };

  const updateRestaurantLayout = async (updatedTables) => {
    const layout = {
      width: 800,
      height: 600,
      tables: updatedTables
    };

    if (restaurant) {
      await Restaurant.update(restaurant.id, {
        layout
      });
    }
  };

  const removeTable = (tableId) => {
    const updatedTables = tables.filter(table => table.id !== tableId);
    setTables(updatedTables);
    updateRestaurantLayout(updatedTables);
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Table Management</h1>
          <Button onClick={() => setShowAddTable(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Table
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div 
            className="relative border-2 border-dashed rounded-lg"
            style={{ width: 800, height: 600 }}
          >
            {tables.map(table => (
              <ResizableTable
                key={table.id}
                table={table}
                onMove={handleTableMove}
                onResize={handleTableResize}
                onSelect={() => setSelectedTable(table)}
                onRemove={() => removeTable(table.id)}
              />
            ))}
          </div>
        </div>

        <Dialog open={showAddTable} onOpenChange={setShowAddTable}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Table</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4">
                <Table2 className="w-8 h-8" />
                <div>
                  <label className="block text-sm font-medium mb-1">Number of Seats</label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setNewTable(prev => ({ ...prev, seats: Math.max(1, prev.seats - 1) }))}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <Input
                      type="number"
                      value={newTable.seats}
                      onChange={(e) => setNewTable(prev => ({ ...prev, seats: parseInt(e.target.value) || 1 }))}
                      className="w-20 text-center"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setNewTable(prev => ({ ...prev, seats: prev.seats + 1 }))}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddTable(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddTable}>
                Add Table
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={!!selectedTable} onOpenChange={() => setSelectedTable(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Table QR Code</DialogTitle>
            </DialogHeader>
            {selectedTable && (
              <QRCode tableId={selectedTable.id} />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}