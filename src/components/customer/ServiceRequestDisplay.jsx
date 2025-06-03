import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Check, Clock, GlassWater, UtensilsCrossed, Coffee, Table2, HandHelping, HelpCircle, SlidersHorizontal } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

export default function ServiceRequestDisplay({ requests, onNewRequest }) {
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [serviceType, setServiceType] = useState(null);
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serviceTypes, setServiceTypes] = useState([]);

  // Load available service types from localStorage
  useEffect(() => {
    const savedTypes = localStorage.getItem('serviceTypes');
    if (savedTypes) {
      try {
        const parsedTypes = JSON.parse(savedTypes);
        // Only show active service types
        setServiceTypes(parsedTypes.filter(type => type.active));
      } catch (error) {
        console.error("Error loading service types:", error);
        loadDefaultServiceTypes();
      }
    } else {
      loadDefaultServiceTypes();
    }

    // Listen for storage events to update service types
    const handleStorageChange = (event) => {
      if (event.key === 'serviceTypes') {
        try {
          const updatedTypes = JSON.parse(event.newValue);
          setServiceTypes(updatedTypes.filter(type => type.active));
        } catch (error) {
          console.error("Error handling storage change:", error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const loadDefaultServiceTypes = () => {
    // Default service types if none are configured
    setServiceTypes([
      {
        id: "water",
        name: "Water",
        description: "Request water service for the table",
        icon: "water",
        active: true
      },
      {
        id: "napkins",
        name: "Napkins",
        description: "Request additional napkins",
        icon: "napkins",
        active: true
      },
      {
        id: "utensils",
        name: "Utensils",
        description: "Request additional or replacement utensils",
        icon: "utensils",
        active: true
      },
      {
        id: "assistance",
        name: "Assistance",
        description: "Request staff assistance for any other needs",
        icon: "assistance",
        active: true
      }
    ]);
  };

  const handleSelectServiceType = (type) => {
    setServiceType(type);
    setShowRequestDialog(true);
  };

  const handleSubmitRequest = async () => {
    if (!serviceType) return;
    
    setSubmitting(true);
    
    try {
      const result = await onNewRequest(serviceType.id, details);
      if (result) {
        setSuccess(true);
        setTimeout(() => {
          setShowRequestDialog(false);
          setSuccess(false);
          setDetails("");
          setServiceType(null);
        }, 2000);
      }
    } catch (error) {
      console.error("Error submitting request:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const getIconForType = (iconType) => {
    switch (iconType) {
      case 'water': return <GlassWater className="w-5 h-5" />;
      case 'utensils': return <UtensilsCrossed className="w-5 h-5" />;
      case 'coffee': return <Coffee className="w-5 h-5" />;
      case 'napkins': return <Table2 className="w-5 h-5" />;
      case 'assistance': return <HandHelping className="w-5 h-5" />;
      case 'settings': return <SlidersHorizontal className="w-5 h-5" />;
      default: return <HelpCircle className="w-5 h-5" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-orange-100 text-orange-800">Pending</Badge>;
      case "in_progress":
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  return (
    <div className="py-4">
      <h2 className="text-xl font-bold mb-4">Request Service</h2>
      
      {/* Service Type Selection */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        {serviceTypes.map(type => (
          <Button
            key={type.id}
            variant="outline"
            className="h-auto flex flex-col p-4 gap-2 items-center justify-center"
            onClick={() => handleSelectServiceType(type)}
          >
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              {getIconForType(type.icon)}
            </div>
            <span>{type.name}</span>
          </Button>
        ))}
        
        {serviceTypes.length === 0 && (
          <div className="col-span-full text-center py-6 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No service types are currently available</p>
          </div>
        )}
      </div>
      
      {/* Active Requests */}
      <h3 className="text-lg font-semibold mb-3">Your Active Requests</h3>
      <div className="space-y-4">
        {requests.length > 0 ? (
          requests.map(request => {
            const serviceTypeInfo = serviceTypes.find(type => type.id === request.type) || {
              name: request.type,
              icon: 'help'
            };
            
            return (
              <Card key={request.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-full bg-blue-50">
                        {getIconForType(serviceTypeInfo.icon)}
                      </div>
                      <CardTitle className="text-lg">{serviceTypeInfo.name}</CardTitle>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  {request.details && (
                    <p className="text-gray-600 mb-3">{request.details}</p>
                  )}
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>Requested at {new Date(request.created_date).toLocaleTimeString()}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No active service requests</p>
          </div>
        )}
      </div>

      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{serviceType?.name} Request</DialogTitle>
          </DialogHeader>
          
          {!success ? (
            <>
              <div className="py-4">
                <p className="text-gray-600 mb-4">{serviceType?.description}</p>
                <label className="block text-sm font-medium mb-1">Additional Details (optional)</label>
                <Textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Add any specific details about your request..."
                  className="min-h-[100px]"
                />
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowRequestDialog(false);
                    setDetails("");
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmitRequest}
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <div className="py-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-lg font-medium mb-2">Request Submitted</p>
              <p className="text-gray-600">Your service request has been sent to the staff</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}