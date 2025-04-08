import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const DEMO_MENU = [
  {
    id: "1",
    name: "Classic Burger",
    description: "Juicy beef patty with lettuce and tomato",
    price: 49.90,
    category: "mains"
  },
  {
    id: "2",
    name: "Caesar Salad",
    description: "Fresh romaine lettuce with our special dressing",
    price: 35.90,
    category: "starters"
  }
];

export default function MenuDisplay({ tableId }) {
  const [items] = useState(DEMO_MENU);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {items.map(item => (
        <Card key={item.id}>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle>{item.name}</CardTitle>
              <Badge>₪{item.price.toFixed(2)}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{item.description}</p>
            <Button>Add to Order</Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}