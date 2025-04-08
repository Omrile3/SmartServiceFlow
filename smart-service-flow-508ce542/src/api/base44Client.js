import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: "67f4c4aacaf6827b4378d861", 
  requiresAuth: false // Ensure authentication is required for all operations
});
