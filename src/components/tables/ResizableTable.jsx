
import React from 'react';
import { Table2, GripHorizontal, X, Utensils, DollarSign } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function ResizableTable({ table, onMove, onResize, onSelect, onRemove, status }) {
  const [isDragging, setIsDragging] = React.useState(false);
  const [isResizing, setIsResizing] = React.useState(false);
  const [startPos, setStartPos] = React.useState({ x: 0, y: 0 });
  const [startSize, setStartSize] = React.useState({ width: 0, height: 0 });
  const [tableStatus, setTableStatus] = React.useState(null);

  React.useEffect(() => {
    // Get table status from localStorage
    const savedStatuses = localStorage.getItem('tableStatuses');
    if (savedStatuses) {
      try {
        const statuses = JSON.parse(savedStatuses);
        if (statuses[table.id]) {
          setTableStatus(statuses[table.id].status);
        }
      } catch (e) {
        console.error("Error loading table status:", e);
      }
    }

    // Check for orders that reference this table
    const savedOrders = localStorage.getItem('orders');
    if (savedOrders) {
      try {
        const orders = JSON.parse(savedOrders);
        const tableOrders = orders.filter(order => order.table_id === table.id);
        
        if (tableOrders.some(order => order.payment_status !== 'paid')) {
          setTableStatus('occupied');
        }
      } catch (e) {
        console.error("Error checking table orders:", e);
      }
    }
  }, [table.id]);

  const hasUnpaidOrders = status?.hasUnpaidOrders;
  const pendingOrderCount = status?.pendingOrderCount || 0;

  const handleMouseDown = (e) => {
    if (e.target.classList.contains('resize-handle')) {
      setIsResizing(true);
      setStartPos({ x: e.clientX, y: e.clientY });
      setStartSize({ width: table.width, height: table.height });
    } else {
      setIsDragging(true);
      setStartPos({ x: e.clientX - table.x, y: e.clientY - table.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const newX = Math.max(0, Math.min(e.clientX - startPos.x, 700));
      const newY = Math.max(0, Math.min(e.clientY - startPos.y, 500));
      onMove(table.table_number, newX, newY);
    } else if (isResizing) {
      const dx = e.clientX - startPos.x;
      const dy = e.clientY - startPos.y;
      onResize(
        table.table_number,
        Math.max(80, Math.min(startSize.width + dx, 200)),
        Math.max(80, Math.min(startSize.height + dy, 200))
      );
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  React.useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing]);

  // Determine the status color of the table
  const getTableStatusColor = () => {
    if (status?.hasUnpaidOrders || tableStatus === 'occupied') {
      return "border-orange-500 bg-orange-50"; // Occupied with unpaid bills
    } else if (status?.pendingOrderCount > 0) {
      return "border-blue-500 bg-blue-50"; // Has pending orders
    }
    return "border-green-500 bg-green-50"; // Free
  };

  return (
    <div
      className={`absolute border-2 rounded shadow-md cursor-move flex flex-col ${getTableStatusColor()}`}
      style={{
        left: table.x,
        top: table.y,
        width: table.width,
        height: table.height
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="flex justify-between items-center p-2 bg-white bg-opacity-90 border-b">
        <div className="flex items-center gap-2">
          <Table2 className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium">{table.table_number}</span>
        </div>
        <div className="flex items-center gap-1">
          {pendingOrderCount > 0 && (
            <div className="flex items-center text-blue-600">
              <Utensils className="w-3 h-3 mr-1" />
              <span className="text-xs">{pendingOrderCount}</span>
            </div>
          )}
          
          {hasUnpaidOrders && (
            <div className="flex items-center text-orange-600 ml-1">
              <DollarSign className="w-3 h-3" />
            </div>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 17L12 17.01M7 14H5V5H19V14H17M7 14V21L12 17.01L17 21V14M7 14H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-red-500 hover:text-red-700"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <span className="text-sm font-medium">{table.seats} seats</span>
      </div>
      <div className="resize-handle absolute bottom-0 right-0 w-6 h-6 cursor-se-resize flex items-center justify-center text-gray-400 hover:text-gray-600">
        <GripHorizontal className="w-4 h-4" />
      </div>
    </div>
  );
}
