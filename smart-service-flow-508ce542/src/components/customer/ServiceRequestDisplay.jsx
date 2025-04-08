import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GlassWater, UtensilsCrossed, HandHelping } from "lucide-react";

const SERVICE_TYPES = [
  { id: "water", name: "Water", icon: GlassWater },
  { id: "utensils", name: "Utensils", icon: UtensilsCrossed },
  { id: "assistance", name: "Assistance", icon: HandHelping }
];

export default function ServiceRequestDisplay({ tableId }) {
  return (
    <div className="py-4">
      <h2 className="text-xl font-bold mb-4">Request Service</h2>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        {SERVICE_TYPES.map(type => {
          const Icon = type.icon;
          return (
            <Button
              key={type.id}
              variant="outline"
              className="h-auto flex flex-col p-4 gap-2 items-center justify-center"
            >
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <Icon className="w-5 h-5" />
              </div>
              <span>{type.name}</span>
            </Button>
          );
        })}
      </div>
      
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No active service requests</p>
      </div>
    </div>
  );
}