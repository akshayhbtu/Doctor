// frontend/src/contexts/SocketContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      const newSocket = io('http://localhost:5000', {
        transports: ['websocket'],
        withCredentials: true
      });

      newSocket.on('connect', () => {
        console.log('Socket connected');
      });

      newSocket.on('new-message', (data) => {
        // Trigger a custom event that components can listen to
        window.dispatchEvent(new CustomEvent('new-chat-message', { detail: data }));
        
        // Show notification
        if (data.senderId !== user._id) {
          toast.info(`📩 New message from ${data.senderName}`);
        }
      });

      newSocket.on('user-typing', (data) => {
        window.dispatchEvent(new CustomEvent('user-typing', { detail: data }));
      });

      newSocket.on('user-stop-typing', (data) => {
        window.dispatchEvent(new CustomEvent('user-stop-typing', { detail: data }));
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [isAuthenticated, user]);

  const joinChat = (appointmentId) => {
    if (socket) {
      socket.emit('join-chat', appointmentId);
    }
  };

  const leaveChat = (appointmentId) => {
    if (socket) {
      socket.emit('leave-chat', appointmentId);
    }
  };

  const sendMessage = (data) => {
    if (socket) {
      socket.emit('send-message', data);
    }
  };

  const sendTyping = (appointmentId, userId, name) => {
    if (socket) {
      socket.emit('typing', { appointmentId, userId, name });
    }
  };

  const sendStopTyping = (appointmentId, userId) => {
    if (socket) {
      socket.emit('stop-typing', { appointmentId, userId });
    }
  };

  return (
    <SocketContext.Provider value={{
      socket,
      joinChat,
      leaveChat,
      sendMessage,
      sendTyping,
      sendStopTyping
    }}>
      {children}
    </SocketContext.Provider>
  );
};