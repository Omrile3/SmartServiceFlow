import React from 'react';
import { Button } from "@/components/ui/button";
import { Download, Copy } from "lucide-react";
import { useState, useEffect } from 'react';

export default function QRCode({ tableId }) {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [tableUrl, setTableUrl] = useState('');
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    generateQRCode();
  }, [tableId]);

  const generateQRCode = async () => {
    try {
      // Generate a direct URL that doesn't use hash navigation
      // This format works better with QR code generators
      const baseUrl = window.location.origin;
      // Make the URL compatible with the app's routing and ensure the exact table ID is passed
      const fullUrl = `${baseUrl}/Customer?table=${encodeURIComponent(tableId)}`;
      setTableUrl(fullUrl);
      
      // Use QR Server API for QR code generation - more reliable than Google Charts
      const qrServerUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(fullUrl)}&size=250x250`;
      setQrCodeUrl(qrServerUrl);
      setImageError(false);
    } catch (err) {
      console.error('Error generating QR code:', err);
      setImageError(true);
    } finally {
      setLoading(false);
    }
  };

  const downloadQR = () => {
    if (!qrCodeUrl || imageError) return;
    
    // Open the QR code in a new tab for downloading
    // This is more reliable than trying to download directly
    window.open(qrCodeUrl, '_blank');
    
    alert("QR Code opened in new tab. Right click and select 'Save image as...' to download.");
  };
  
  const copyUrl = () => {
    navigator.clipboard.writeText(tableUrl).then(() => {
      alert("Table URL copied to clipboard");
    });
  };

  // Alternative QR code generator using a different service
  const tryAlternativeQRCode = () => {
    // Fallback to a different QR service
    const backupQrUrl = `https://quickchart.io/qr?text=${encodeURIComponent(tableUrl)}&size=250`;
    setQrCodeUrl(backupQrUrl);
    setImageError(false);
  };

  if (loading) {
    return (
      <div className="p-4 flex flex-col items-center gap-4">
        <div className="w-48 h-48 bg-gray-100 animate-pulse rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="p-4 flex flex-col items-center gap-4">
      <div className="border rounded p-2 bg-white">
        {imageError ? (
          <div className="w-48 h-48 flex flex-col items-center justify-center text-center p-4 bg-gray-100 rounded">
            <p className="text-red-500 mb-2">QR code failed to load</p>
            <Button onClick={tryAlternativeQRCode} size="sm">
              Try Alternative Service
            </Button>
          </div>
        ) : (
          <img 
            src={qrCodeUrl} 
            alt={`QR Code for table ${tableId}`} 
            className="w-48 h-48"
            onError={(e) => {
              console.error("QR code image failed to load");
              setImageError(true);
            }}
          />
        )}
      </div>
      
      <div className="border rounded p-4 bg-white w-full">
        <p className="text-sm font-medium mb-2">Direct Link (no QR code needed):</p>
        <div className="bg-gray-100 p-2 rounded mb-2 overflow-hidden">
          <p className="font-mono text-xs break-all">{tableUrl}</p>
        </div>
        <Button onClick={copyUrl} variant="outline" className="w-full">
          <Copy className="w-4 h-4 mr-2" />
          Copy URL
        </Button>
      </div>
      
      <div className="flex gap-3 w-full">
        <Button 
          onClick={downloadQR} 
          className="flex-1"
          disabled={imageError}
        >
          <Download className="w-4 h-4 mr-2" />
          View & Download QR
        </Button>
      </div>
    </div>
  );
}