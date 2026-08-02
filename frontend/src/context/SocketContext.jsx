import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io('http://localhost:3000');
    setSocket(newSocket);

    // Listen for online users updates
    newSocket.on('online_users_update', (users) => {
      setOnlineUsers(users);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    // Emit register_user when authenticated user changes
    if (socket && user?.id) {
      socket.emit('register_user', user.id);
    }
  }, [socket, user]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};
