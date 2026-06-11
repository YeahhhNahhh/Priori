import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Connect to backend
    const newSocket = io('http://localhost:5001');

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
      
      // Join specific rooms based on role
      if (user.role === 'ADMIN' && user.hospitalId) {
        newSocket.emit('join_hospital', user.hospitalId);
      } else if (user.role === 'PATIENT') {
        newSocket.emit('join_session', user.id);
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user, isAuthenticated]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
