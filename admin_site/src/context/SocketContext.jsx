import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const SocketContext = createContext();

const getSocketURL = () => {
  if (import.meta.env.VITE_SOCKET_URL) return import.meta.env.VITE_SOCKET_URL;
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '');
  if (typeof window !== 'undefined') {
    if (window.location.hostname.includes('render.com')) {
      return 'https://saha-backend-api.onrender.com';
    }
    if (window.location.hostname.includes('vercel.app')) {
      return 'https://customersite-psi.vercel.app';
    }
  }
  return 'http://localhost:5000';
};

const SOCKET_URL = getSocketURL();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastNotification, setLastNotification] = useState(null);

  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 20,
      reconnectionDelay: 2000
    });

    newSocket.on('connect', () => {
      console.log('⚡ Connected to Real-time Sync Server at:', SOCKET_URL);
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('⚡ Disconnected from Real-time Sync Server');
      setIsConnected(false);
    });

    // Real-time listener for new order placement
    const handleOrderCreated = (orderData) => {
      if (!orderData) return;

      // Persist immediately to admin localStorage cache so orders never disappear
      try {
        const cached = JSON.parse(localStorage.getItem('saha_admin_orders_cache') || '[]');
        const key = String(orderData.orderId || orderData._id || '').replace(/^ORD-/, '');
        const exists = cached.some(o => String(o.orderId || o._id || '').replace(/^ORD-/, '') === key);
        if (!exists) {
          localStorage.setItem('saha_admin_orders_cache', JSON.stringify([orderData, ...cached]));
        }
      } catch (e) {}

      const customerName = orderData?.shippingAddress?.fullName || orderData?.user?.name || 'A customer';
      const amount = orderData?.totalPrice ? `₹${orderData.totalPrice}` : '';
      
      toast((t) => (
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => {
          toast.dismiss(t.id);
          window.location.href = `/orders?id=${orderData._id}`;
        }}>
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg">
            🛒
          </div>
          <div>
            <p className="font-semibold text-sm text-slate-100">New Order Received!</p>
            <p className="text-xs text-slate-300">{customerName} placed order {amount}</p>
          </div>
        </div>
      ), { duration: 6000, position: 'top-right' });

      setLastNotification({ type: 'order_created', data: orderData, timestamp: Date.now() });
    };

    const handleOrderUpdated = (orderData) => {
      setLastNotification({ type: 'order_updated', data: orderData, timestamp: Date.now() });
    };

    newSocket.on('order:created', handleOrderCreated);
    newSocket.on('order:updated', handleOrderUpdated);
    newSocket.on('order:status_updated', handleOrderUpdated);

    setSocket(newSocket);

    return () => {
      newSocket.off('order:created', handleOrderCreated);
      newSocket.off('order:updated', handleOrderUpdated);
      newSocket.off('order:status_updated', handleOrderUpdated);
      newSocket.close();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected, lastNotification }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
