
import React, { useRef, useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Camera, QrCode } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";

export default function CameraScanner({ onScanSuccess }) {
  const videoRef = useRef(null);
  const [error, setError] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [manualTableId, setManualTableId] = useState("");

  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  const startScanner = async () => {
    setError(null);
    setScanning(true);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // When video is ready, start scanning
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          
          // In a real implementation, we would detect QR codes here
          // For demo purposes, we'll simulate finding a QR code after 3 seconds
          setTimeout(() => {
            // Simulate finding a QR code with a table ID
            // Use the most accurate URL format for consistent parsing
            const mockQrCodeData = `${window.location.origin}/Customer?table=table-1`;
            setScanning(false);
            stopCamera();
            onScanSuccess(mockQrCodeData);
          }, 3000);
        };
      }
    } catch (err) {
      console.error('Failed to access camera:', err);
      setError('Camera access denied. Please check your browser permissions and try entering the table ID manually.');
      setScanning(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setScanning(false);
  };

  const handleManualEntry = () => {
    if (manualTableId) {
      onScanSuccess(manualTableId);
    } else {
      setError("Please enter a valid table ID");
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="relative aspect-video rounded-lg overflow-hidden bg-black mb-4">
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            playsInline
          />
          
          {!scanning && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="text-white text-center">
                <Camera className="w-12 h-12 mx-auto mb-2" />
                <p>Camera is inactive</p>
                <p className="text-sm mt-2">Smart Service Flow</p>
              </div>
            </div>
          )}
          
          <div className="absolute inset-0 border-2 border-white/50 m-12 rounded pointer-events-none"></div>
        </div>
        
        <Button 
          onClick={scanning ? stopCamera : startScanner} 
          className="w-full mb-4"
        >
          {scanning ? 'Stop Camera' : 'Start Scanner'}
        </Button>
        
        <div className="mt-6 border-t pt-4">
          <p className="text-sm mb-3 font-medium">Or enter table ID manually:</p>
          <div className="flex gap-2">
            <Input 
              placeholder="e.g. table-1" 
              value={manualTableId} 
              onChange={(e) => setManualTableId(e.target.value)}
            />
            <Button onClick={handleManualEntry}>Enter</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
