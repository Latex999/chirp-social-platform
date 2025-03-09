'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useDispatch } from 'react-redux';
import { useAuth } from './AuthContext';
import { addNotification } from '@/store/slices/notificationsSlice';
import { Post } from '@/store/slices/postsSlice';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const dispatch = useDispatch();
  
  useEffect(() => {
    // Only connect to socket if user is authenticated
    if (!isAuthenticated || !user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }
    
    // Connect to socket server
    const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000', {
      auth: {
        token: localStorage.getItem('token'),
      },
    });
    
    socketInstance.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
    });
    
    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });
    
    // Handle notifications
    socketInstance.on('notification', (notification) => {
      dispatch(addNotification(notification));
    });
    
    // Handle new posts in feed
    socketInstance.on('new_post', (post: Post) => {
      // This will be handled by the posts slice
      // We can dispatch an action to add the post to the feed
    });
    
    // Handle post updates (likes, comments, etc.)
    socketInstance.on('post_update', (updatedPost: Post) => {
      // This will be handled by the posts slice
      // We can dispatch an action to update the post in the feed
    });
    
    // Handle new messages
    socketInstance.on('new_message', (message) => {
      // This will be handled by the messages slice
      // We can dispatch an action to add the message to the conversation
    });
    
    setSocket(socketInstance);
    
    // Clean up on unmount
    return () => {
      socketInstance.disconnect();
    };
  }, [isAuthenticated, user, dispatch]);
  
  const value = {
    socket,
    isConnected,
  };
  
  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}