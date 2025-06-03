import axios from "axios";

/**
 * Generates a QR code using the QRServer API.
 * @param {string} tableId - The table ID to encode in the QR code.
 * @returns {Promise<string>} - A URL to the generated QR code image.
 */
export const generateQRCode = async (tableId) => {
  if (!tableId) {
    throw new Error("Table ID is required to generate a QR code.");
  }

  const baseUrl = window.location.origin;
  const fullUrl = `${baseUrl}/Customer?table=${tableId}`;
  const qrServerUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(fullUrl)}&size=250x250`;

  try {
    return qrServerUrl;
  } catch (error) {
    console.error("Error generating QR code:", error);
    throw error;
  }
};
