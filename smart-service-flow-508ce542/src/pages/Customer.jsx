import React, { useState, useEffect } from "react";
import { MenuItem } from "@/api/entities";
import { ServiceRequest } from "@/api/entities";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode, Users, TableProperties, LucideUtensils, Clipboard } from "lucide-react";
import MenuDisplay from "../components/customer/MenuDisplay";
import ServiceRequestDisplay from "../components/customer/ServiceRequestDisplay";

export default function Customer() {
  const [tableId, setTableId] = useState('demo-table');
  const [activeTab, setActiveTab] = useState("menu");

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Table Information Card */}
      <Card className="mb-6">
        <CardContent className="py-4">
          <div className="flex flex-wrap gap-6">
            <div>
              <p className="text-sm text-gray-500">Table ID</p>
              <p className="font-medium">Demo Table</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Seats</p>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4 text-gray-600" />
                <p className="font-medium">4</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="menu" className="text-base flex items-center gap-2">
            <LucideUtensils className="w-4 h-4" />
            Menu
          </TabsTrigger>
          <TabsTrigger value="service" className="text-base flex items-center gap-2">
            <Clipboard className="w-4 h-4" />
            Service
          </TabsTrigger>
        </TabsList>
        <TabsContent value="menu">
          <MenuDisplay tableId={tableId} />
        </TabsContent>
        <TabsContent value="service">
          <ServiceRequestDisplay tableId={tableId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}