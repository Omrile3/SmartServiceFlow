import React from 'react';
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import QRCodeLib from 'qrcode';
import { useState, useEffect } from 'react';

export default function QRCode({ tableId }) {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateQRCode();
  }, [tableId]);

  const generateQRCode = async () => {
    try {
      const url = `${window.location.origin}/customer?table=${tableId}`;
      const qrDataUrl = await QRCodeLib.toDataURL(url, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      });
      setQrCodeUrl(qrDataUrl);
    } catch (err) {
      console.error('Error generating QR code:', err);
    } finally {
      setLoading(false);
    }
  };

  const downloadQR = () => {
    if (!qrCodeUrl) return;
    
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `table-${tableId}-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
      <img src={qrCodeUrl} alt={`QR Code for table ${tableId}`} className="w-48 h-48" />
      <Button onClick={downloadQR} className="w-full">
        <Download className="w-4 h-4 mr-2" />
        Download QR Code
      </Button>
    </div>
  );
}