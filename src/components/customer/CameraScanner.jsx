import React, { useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function CameraScanner({ onScanSuccess }) {
  const scannerRef = useRef(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner("qr-reader", {
      fps: 10,
      qrbox: { width: 250, height: 250 },
    });

    scanner.render(
      (decodedText) => {
        onScanSuccess(decodedText);
      },
      (error) => {
        if (error.name === "NotAllowedError") {
          console.error("Camera access denied. Please allow camera permissions in your browser settings.");
          setError("Camera access denied. Please allow camera permissions in your browser settings.");
        } else if (error.name === "AbortError") {
          console.error("Camera initialization timed out. Please check your camera permissions or try again.");
          setError("Camera initialization timed out. Please check your camera permissions or try again.");
        } else {
          console.warn("QR Code scanning error:", error);
        }
      }
    );

    scannerRef.current = scanner;

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch((error) => {
          console.error("Failed to clear QR Code scanner:", error);
        });
      }
    };
  }, [onScanSuccess]);

  return (
    <div className="camera-scanner">
      <h2 className="text-lg font-bold mb-4">Scan table QR Code</h2>
      <div id="qr-reader" style={{ width: "100%" }}></div>
    </div>
  );
}
