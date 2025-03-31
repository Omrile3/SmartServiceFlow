import React, { useRef, useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Camera } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function CameraScanner({ onScanSuccess }) {
  const videoRef = useRef(null);
  const [error, setError] = useState(null);
  const [scanning, setScanning] = useState(false);

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
            const mockQrCodeData = `${window.location.origin}/customer?table=table-1`;
            setScanning(false);
            stopCamera();
            onScanSuccess(mockQrCodeData);
          }, 3000);
        };
      }
    } catch (err) {
      console.error('Failed to access camera:', err);
      setError('Camera access denied. Please check your browser permissions.');
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
              </div>
            </div>
          )}
          
          <div className="absolute inset-0 border-2 border-white/50 m-12 rounded pointer-events-none"></div>
        </div>
        
        <Button 
          onClick={scanning ? stopCamera : startScanner} 
          className="w-full"
        >
          {scanning ? 'Stop Camera' : 'Start Scanner'}
        </Button>
      </CardContent>
    </Card>
  );
}