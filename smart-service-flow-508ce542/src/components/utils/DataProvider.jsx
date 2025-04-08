import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { MenuItem } from '@/api/entities';
import { ServiceRequest } from '@/api/entities';
import { Order } from '@/api/entities';
import { Table } from '@/api/entities';

const DataContext = createContext({});

export const useData = () => useContext(DataContext);

export function DataProvider({ children }) {
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [tables, setTables] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [serviceRequests, setServiceRequests] = useState([]);
  const [orders, setOrders] = useState([]);
  const [userRole, setUserRole] = useState("customer");

  // Initialize data from entities and localStorage
  useEffect(() => {
    const initData = async () => {
      setIsLoading(true);
      try {
        // Try to get current user
        try {
          const user = await User.me();
          setCurrentUser(user);
          
          // Check if user has a saved role
          const savedRole = localStorage.getItem("userRoleType");
          if (savedRole) {
            setUserRole(savedRole);
          } else if (user?.role === "admin") {
            // Default admins to manager role
            setUserRole("manager");
            localStorage.setItem("userRoleType", "manager");
          }
        } catch (error) {
          console.log("Not authenticated or error getting user:", error);
        }

        // Load tables - first try localStorage for faster load
        const savedTables = localStorage.getItem('restaurantTables');
        if (savedTables) {
          setTables(JSON.parse(savedTables));
        } else {
          // Then try to load from database
          try {
            const dbTables = await Table.list();
            const formattedTables = dbTables.map(table => ({
              id: table.table_number,
              seats: table.seats,
              x: table.x || 50,
              y: table.y || 50,
              width: table.width || 100,
              height: table.height || 100
            }));
            setTables(formattedTables);
            localStorage.setItem('restaurantTables', JSON.stringify(formattedTables));
          } catch (error) {
            console.error("Error loading tables:", error);
          }
        }

        // Load menu items - first try localStorage for faster load
        const savedMenu = localStorage.getItem('restaurantMenu');
        if (savedMenu) {
          setMenuItems(JSON.parse(savedMenu));
        } else {
          // Then try to load from database
          try {
            const dbMenuItems = await MenuItem.list();
            setMenuItems(dbMenuItems);
            localStorage.setItem('restaurantMenu', JSON.stringify(dbMenuItems));
          } catch (error) {
            console.error("Error loading menu items:", error);
          }
        }

        // Load service requests - first try localStorage for faster load
        const savedRequests = localStorage.getItem('serviceRequests');
        if (savedRequests) {
          setServiceRequests(JSON.parse(savedRequests));
        } else {
          // Then try to load from database
          try {
            const dbRequests = await ServiceRequest.list();
            setServiceRequests(dbRequests);
            localStorage.setItem('serviceRequests', JSON.stringify(dbRequests));
          } catch (error) {
            console.error("Error loading service requests:", error);
          }
        }

        // Load orders - first try localStorage for faster load
        const savedOrders = localStorage.getItem('orders');
        if (savedOrders) {
          setOrders(JSON.parse(savedOrders));
        } else {
          // Then try to load from database
          try {
            const dbOrders = await Order.list();
            setOrders(dbOrders);
            localStorage.setItem('orders', JSON.stringify(dbOrders));
          } catch (error) {
            console.error("Error loading orders:", error);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    initData();
  }, []);

  // Provide methods to update data
  const updateTables = (newTables) => {
    setTables(newTables);
    localStorage.setItem('restaurantTables', JSON.stringify(newTables));
  };

  const updateMenuItems = (newMenuItems) => {
    setMenuItems(newMenuItems);
    localStorage.setItem('restaurantMenu', JSON.stringify(newMenuItems));
  };

  const updateServiceRequests = (newRequests) => {
    setServiceRequests(newRequests);
    localStorage.setItem('serviceRequests', JSON.stringify(newRequests));
  };

  const updateOrders = (newOrders) => {
    setOrders(newOrders);
    localStorage.setItem('orders', JSON.stringify(newOrders));
  };

  const setRole = (role) => {
    setUserRole(role);
    localStorage.setItem("userRoleType", role);
  };

  return (
    <DataContext.Provider value={{
      isLoading,
      currentUser,
      tables,
      menuItems,
      serviceRequests,
      orders,
      userRole,
      updateTables,
      updateMenuItems,
      updateServiceRequests,
      updateOrders,
      setRole
    }}>
      {children}
    </DataContext.Provider>
  );
}