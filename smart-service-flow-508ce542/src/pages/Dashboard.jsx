import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, QrCode, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Dashboard() {
  return (
    <div className="p-6 pt-20">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Welcome to RestaurantQR</h1>
            <p className="text-gray-600">Manage your restaurant's digital services</p>
          </div>
        </div>

        <div className="mt-8 max-w-2xl mx-auto text-center">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <QrCode className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Get Started with Customer View</h2>
            <p className="text-gray-600 mb-6">
              Experience the customer view by scanning table QR codes or directly accessing the customer interface.
            </p>
            <Link to={createPageUrl("Customer")}>
              <Button className="w-full sm:w-auto py-2 px-6">
                Go to Customer View <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}