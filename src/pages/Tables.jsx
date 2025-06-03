import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Plus, Minus, Table2, Save } from "lucide-react";
import QRCode from "../components/tables/QRCode";
import ResizableTable from "../components/tables/ResizableTable";

export default function Tables() {
  const [tables, setTables] = useState([]);
  const [showAddTable, setShowAddTable] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [newTable, setNewTable] = useState({ seats: 4 });
  const [nextTableNumber, setNextTableNumber] = useState(1);
  const [saving, setSaving] = useState(false);
  const [tableStatuses, setTableStatuses] = useState({});

  useEffect(() => {
    // Load saved tables from localStorage or backend
    const savedTables = localStorage.getItem('tables');
    if (savedTables) {
      setTables(JSON.parse(savedTables));
    } else {
      fetch('https://lirfa.mtacloud.co.il/backend/read_tables.php')
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            setTables(data.tables);
            const highestNumber = data.tables.reduce((highest, table) => {
              const match = table.table_number.match(/table-(\d+)/);
              if (match) {
                const num = parseInt(match[1]);
                return num > highest ? num : highest;
              }
              return highest;
            }, 0);
            setNextTableNumber(highestNumber + 1);
          }
        })
        .catch(error => console.error("Error loading tables from backend:", error));
    }

    // Load orders to check table status
    loadTableStatuses();
  }, []);

  const loadTableStatuses = () => {
    const savedOrders = localStorage.getItem('orders');
    if (savedOrders) {
      try {
        const orders = JSON.parse(savedOrders);
        const statuses = {};
        
        // Group orders by table
        orders.forEach(order => {
          if (!statuses[order.table_id]) {
            statuses[order.table_id] = {
              hasUnpaidOrders: false,
              pendingOrderCount: 0
            };
          }
          
          if (order.payment_status !== 'paid') {
            statuses[order.table_id].hasUnpaidOrders = true;
          }
          
          if (order.status === 'pending' || order.status === 'confirmed' || order.status === 'preparing') {
            statuses[order.table_id].pendingOrderCount++;
          }
        });
        
        setTableStatuses(statuses);
      } catch (e) {
        console.error("Error parsing orders:", e);
      }
    }
  };

  const saveTables = (updatedTables) => {
    // Save tables to localStorage and backend
    localStorage.setItem('tables', JSON.stringify(updatedTables));
    Promise.all(
      updatedTables.map(table =>
        fetch('https://lirfa.mtacloud.co.il/backend/update_table.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(table),
        })
      )
    )
    .then(() => {
      console.log("All tables saved successfully.");
    })
    .catch(error => console.error("Error saving tables to backend:", error));
  };

  const handleAddTable = () => {
    const tempId = `temp-${Date.now()}`;
    const tableData = {
      id: tempId, // Temporary ID
      table_number: newTable.name || `table-${nextTableNumber}`,
      x: 50,
      y: 50,
      width: 100,
      height: 100,
      seats: newTable.seats,
      status: "active"
    };

    setTables(prevTables => [...prevTables, tableData]);

    fetch('https://lirfa.mtacloud.co.il/backend/create_table.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tableData),
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        setTables(prevTables => prevTables.map(table => 
          table.id === tempId ? { ...table, id: data.id, table_number: data.table_number } : table
        ));
        setNextTableNumber(nextTableNumber + 1);
        setShowAddTable(false);
        alert(`Table ${tableData.table_number} has been added successfully.`);
        fetch('https://lirfa.mtacloud.co.il/backend/read_tables.php')
          .then(response => response.json())
          .then(data => {
            if (data.success) {
              setTables(data.tables);
              localStorage.setItem('tables', JSON.stringify(data.tables));
            }
          })
          .catch(error => console.error("Error reloading tables from backend:", error));
      } else {
        alert(`Error: ${data.message}`);
      }
    })
    .catch(error => console.error("Error creating table:", error));
  };

  const handleTableMove = (tableId, x, y) => {
    const updatedTable = tables.find(table => table.table_number === tableId);
    if (updatedTable) {
      updatedTable.x = x;
      updatedTable.y = y;

      fetch('https://lirfa.mtacloud.co.il/backend/update_table.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTable),
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setTables(prevTables => prevTables.map(table => 
            table.table_number === tableId ? { ...table, x, y } : table
          ));
          localStorage.setItem('tables', JSON.stringify(tables));
        } else {
          alert(`Error: ${data.message}`);
        }
      })
      .catch(error => console.error("Error updating table:", error));
    }
  };

  const handleTableResize = (tableId, width, height) => {
    const updatedTable = tables.find(table => table.id === tableId);
    if (updatedTable) {
      updatedTable.width = width;
      updatedTable.height = height;

      fetch('https://lirfa.mtacloud.co.il/backend/update_table.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTable),
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setTables(prevTables => prevTables.map(table => 
            table.id === tableId ? { ...table, width, height } : table
          ));
          localStorage.setItem('tables', JSON.stringify(tables));
        } else {
          alert(`Error: ${data.message}`);
        }
      })
      .catch(error => console.error("Error updating table:", error));
    }
  };

  const removeTable = (tableId) => {
    // Check if there are any active orders for this table
    const savedOrders = localStorage.getItem('orders');
    if (savedOrders) {
      try {
        const orders = JSON.parse(savedOrders);
        const hasActiveOrders = orders.some(order => 
          order.table_id === tableId && 
          (order.status !== 'paid' || order.payment_status !== 'paid')
        );
        
        if (hasActiveOrders) {
          alert(`Cannot remove ${tableId} - it has active orders or unpaid bills.`);
          return;
        }
      } catch (e) {
        console.error("Error checking orders:", e);
      }
    }
  
    fetch('https://lirfa.mtacloud.co.il/backend/delete_table.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: tableId }),
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        setTables(prevTables => prevTables.filter(table => table.id !== tableId));
        localStorage.setItem('tables', JSON.stringify(tables));
        alert(`${tableId} has been removed from the floor plan.`);
      } else {
        alert(`Error: ${data.message}`);
      }
    })
    .catch(error => console.error("Error deleting table:", error));
  };
  
  const saveLayout = () => {
    setSaving(true);
    
    // Simulate a small delay to show the saving state
    setTimeout(() => {
      saveTables(tables);
      setSaving(false);
      
      alert("Your table layout has been saved successfully.");
    }, 800);
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold">Table Management</h1>
          <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
            <Button 
              onClick={() => setShowAddTable(true)}
              className="flex-1 sm:flex-initial"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Table
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-6">
          <div 
            className="relative border-2 border-dashed rounded-lg overflow-auto"
            style={{ width: '100%', height: '60vh', maxWidth: '100%' }}
          >
            {tables.map(table => (
              <ResizableTable
                key={table.id || table.table_number}
                table={table}
                status={tableStatuses[table.id]}
                onMove={handleTableMove}
                onResize={handleTableResize}
                onSelect={() => setSelectedTable({ ...table, isEditingName: false })}
                onRemove={() => removeTable(table.id)}
              />
            ))}
            
            {tables.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <Table2 className="w-12 h-12 mx-auto mb-3" />
                  <p>No tables yet. Click "Add Table" to create your first table.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <Dialog open={showAddTable} onOpenChange={setShowAddTable}>
          <DialogContent className="sm:max-w-[425px] p-4 sm:p-6 max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>Add New Table</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4">
                <Table2 className="w-6 h-6 sm:w-8 sm:h-8" />
                <div className="flex-1">
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
              <div>
                <label className="block text-sm font-medium">Table ID will be: </label>
                <Input
                  type="text"
                  value={newTable.name || `table-${nextTableNumber}`}
                  onChange={(e) => setNewTable(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full"
                  placeholder="Enter table name"
                />
              </div>
            </div>
            <DialogFooter className="sm:justify-end gap-2">
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
          <DialogContent className="sm:max-w-[425px] p-4 sm:p-6 max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>Table QR Code</DialogTitle>
            </DialogHeader>
            {selectedTable && (
              <div style={{ maxWidth: '100%', overflow: 'auto' }}>
                <QRCode tableId={selectedTable.id} />
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
