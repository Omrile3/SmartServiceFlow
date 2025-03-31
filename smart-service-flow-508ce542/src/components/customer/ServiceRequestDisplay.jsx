
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertCircle, Clock, Plus, Check } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert"; // Ensure to import Alert and AlertDescription

export default function ServiceRequestDisplay({ requests, onNewRequest }) {
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newRequest, setNewRequest] = useState({
    type: 'water',
    details: ''
  });

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await onNewRequest(newRequest.type, newRequest.details);
      setShowNewRequest(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      setNewRequest({ type: 'water', details: '' });
    } catch (error) {
      console.error("Error submitting request:", error);
      setError("Failed to submit service request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'in_progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      default:
        return status;
    }
  };

  const requestTypeIcons = {
    water: '💧',
    napkins: '🧻',
    utensils: '🍴',
    assistance: '🙋',
    other: '📋'
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Service Requests</h2>
        <Button onClick={() => setShowNewRequest(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Request
        </Button>
      </div>

      <div className="space-y-4">
        {requests.map(request => (
          <Card key={request.id} className="border-l-4" style={{
            borderLeftColor: request.status === 'pending' 
              ? '#EAB308' 
              : request.status === 'in_progress' 
                ? '#2563EB' 
                : '#10B981'
          }}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="flex items-center">
                  <span className="mr-2 text-xl">{requestTypeIcons[request.type] || '📋'}</span>
                  <span className="capitalize">{request.type.replace('_', ' ')}</span>
                </CardTitle>
                <Badge className={getStatusColor(request.status)}>
                  {getStatusText(request.status)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {request.details && (
                <p className="text-gray-600 mb-4">{request.details}</p>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>
                  {new Date(request.created_date).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}

        {requests.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No active service requests</p>
            <p className="text-gray-400 text-sm mt-2">
              Tap the "New Request" button to request service
            </p>
          </div>
        )}
      </div>

      <Dialog open={showNewRequest} onOpenChange={setShowNewRequest}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Service Request</DialogTitle>
          </DialogHeader>
          
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium mb-2">Type of Request</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(requestTypeIcons).map(([type, emoji]) => (
                  <div
                    key={type}
                    onClick={() => setNewRequest(prev => ({ ...prev, type }))}
                    className={`flex items-center gap-2 p-3 rounded-lg cursor-pointer border ${
                      newRequest.type === type 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-xl">{emoji}</span>
                    <span className="capitalize">{type.replace('_', ' ')}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Additional Details (Optional)</label>
              <Textarea
                value={newRequest.details}
                onChange={(e) => setNewRequest(prev => ({ ...prev, details: e.target.value }))}
                placeholder="Any specific details about your request..."
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowNewRequest(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="sm:max-w-md">
          <div className="py-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Request Submitted</h3>
            <p className="text-gray-600">Our staff will attend to your request shortly.</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
