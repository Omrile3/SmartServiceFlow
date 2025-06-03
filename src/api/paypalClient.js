import axios from 'axios';

const PAYPAL_PROXY_API = '/backend/paypal_proxy.php';

export const createOrder = async (totalAmount) => {
  try {
    const payload = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'ILS',
            value: totalAmount.toFixed(2), // Use total_amount from the database
          },
        },
      ],
    };

    console.log('PayPal Order Payload:', JSON.stringify(payload, null, 2)); // Log the payload for debugging

    const order = await axios.post(`${PAYPAL_PROXY_API}/v2/checkout/orders`, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const approvalUrl = order.data.links.find(link => link.rel === "approve")?.href;
    if (!approvalUrl) {
      throw new Error("Approval URL not found in PayPal response");
    }
    return approvalUrl;
  } catch (error) {
    console.error('Error creating PayPal order:', error.response ? error.response.data : error);
    throw error;
  }
};

export const captureOrder = async (orderId) => {
  try {
    const capture = await axios.post(
      `${PAYPAL_PROXY_API}/v2/checkout/orders/${orderId}/capture`,
      {},
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return capture.data;
  } catch (error) {
    console.error('Error capturing PayPal order:', error);
    throw error;
  }
};
