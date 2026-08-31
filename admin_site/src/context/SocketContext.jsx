import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const SocketContext = createContext();

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastNotification, setLastNotification] = useState(null);

  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 2000
    });

    newSocket.on('connect', () => {
      console.log('⚡ Connected to Real-time Sync Server');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('⚡ Disconnected from Real-time Sync Server');
      setIsConnected(false);
    });

    // Real-time listener for new order placement
    newSocket.on('order:created', (orderData) => {
      const customerName = orderData?.shippingAddress?.fullName || 'A customer';
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

      setLastNotification({ type: 'order', data: orderData, timestamp: Date.now() });
    });

    setSocket(newSocket);

    return () => {
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
