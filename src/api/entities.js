import { createClient } from './SSF';

const SSF = createClient({
  appId: "67f254a6ecd95f1fd2dae77f", 
  requiresAuth: true
});


export const Restaurant = SSF.entities.Restaurant;

export const MenuItem = SSF.entities.MenuItem;

export const ServiceRequest = SSF.entities.ServiceRequest;

export const Order = SSF.entities.Order;

export const ServiceType = SSF.entities.ServiceType;



// auth sdk:
export const User = SSF.auth;
