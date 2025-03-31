import React from 'react';
import { Table2, GripHorizontal, X } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function ResizableTable({ table, onMove, onResize, onSelect, onRemove }) {
  const [isDragging, setIsDragging] = React.useState(false);
  const [isResizing, setIsResizing] = React.useState(false);
  const [startPos, setStartPos] = React.useState({ x: 0, y: 0 });
  const [startSize, setStartSize] = React.useState({ width: 0, height: 0 });

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
      onMove(table.id, newX, newY);
    } else if (isResizing) {
      const dx = e.clientX - startPos.x;
      const dy = e.clientY - startPos.y;
      onResize(
        table.id,
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

  return (
    <div
      className="absolute bg-white border-2 border-gray-300 rounded shadow-md cursor-move flex flex-col"
      style={{
        left: table.x,
        top: table.y,
        width: table.width,
        height: table.height
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="flex justify-between items-center p-2 bg-gray-50 border-b">
        <div className="flex items-center gap-2">
          <Table2 className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium">{table.id}</span>
        </div>
        <div className="flex items-center gap-1">
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