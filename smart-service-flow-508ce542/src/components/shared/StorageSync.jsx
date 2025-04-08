import React, { useEffect, useState } from 'react';

// This component ensures data persists between page navigation
export default function StorageSync() {
  useEffect(() => {
    // Initialize default data if not present
    initializeLocalStorage();
  }, []);

  const initializeLocalStorage = () => {
    // Check if menu items exist
    if (!localStorage.getItem('restaurantMenu')) {
      const defaultItems = [
        {
          id: "item1",
          name: "Classic Burger",
          description: "Beef patty with lettuce, tomato, and special sauce",
          price: 49.90,
          category: "mains",
          available: true,
          image_url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
        },
        {
          id: "item2",
          name: "Caesar Salad",
          description: "Fresh romaine lettuce, croutons, parmesan cheese with Caesar dressing",
          price: 38.90,
          category: "starters",
          available: true,
          image_url: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
        }
      ];
      localStorage.setItem('restaurantMenu', JSON.stringify(defaultItems));
    }

    // Initialize other data as needed
    if (!localStorage.getItem('serviceTypes')) {
      const defaultTypes = [
        {
          id: "water",
          name: "Water",
          description: "Request water service for the table",
          icon: "water",
          active: true
        },
        {
          id: "napkins",
          name: "Napkins",
          description: "Request additional napkins",
          icon: "napkins",
          active: true
        }
      ];
      localStorage.setItem('serviceTypes', JSON.stringify(defaultTypes));
    }

    // Initialize service requests if not present
    if (!localStorage.getItem('serviceRequests')) {
      const defaultRequests = [];
      localStorage.setItem('serviceRequests', JSON.stringify(defaultRequests));
    }
  };

  // No actual rendering, just side effects
  return null;
}