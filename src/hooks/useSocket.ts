"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/contexts/AuthContext";

export function useSocket() {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const userId = user?._id || (user as any)?._id?.toString();
    if (!userId) return;

    const userIdStr = typeof userId === 'string' ? userId : userId.toString();
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 
                     (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
    
    const newSocket = io(socketUrl, {
      path: "/api/socket",
      transports: ["websocket", "polling"],
      autoConnect: true,
    });

    newSocket.on("connect", () => {
      console.log("✅ Socket connected:", newSocket.id);
      setIsConnected(true);
      
      // Join user's personal room
      newSocket.emit("join", userIdStr);
    });

    newSocket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
      setIsConnected(false);
    });

    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.emit("leave", userIdStr);
      newSocket.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
  }, [user?._id]);

  return { socket, isConnected };
}

