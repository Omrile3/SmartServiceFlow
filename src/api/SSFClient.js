import { createClient } from './SSF';

// Create a client with authentication required
export const SSF = createClient({
  appId: "67f254a6ecd95f1fd2dae77f", 
  requiresAuth: true // Ensure authentication is required for all operations
});
