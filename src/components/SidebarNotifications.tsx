"use client";

import { useState, useEffect } from "react";
import { FaBell, FaTimes, FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaChevronRight } from "react-icons/fa";
import { useAuth } from "@/contexts/AuthContext";
import { useSocket } from "@/hooks/useSocket";
import { useRouter } from "next/navigation";
import { getAuthHeaders } from "@/lib/token-storage";

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  read: boolean;
  createdAt: string;
}

export function SidebarNotifications() {
  const { user } = useAuth();
  const router = useRouter();
  const { socket, isConnected } = useSocket();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showPanel, setShowPanel] = useState(false);

  useEffect(() => {
    if (user?._id) {
      fetchNotifications();
    }
  }, [user]);

  // Listen for real-time notifications via Socket.io
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleNotification = (notification: Notification) => {
      console.log("📬 New notification received:", notification);
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    };

    socket.on("notification", handleNotification);

    return () => {
      socket.off("notification", handleNotification);
    };
  }, [socket, isConnected]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/notifications?unreadOnly=false&limit=5", {
        headers: getAuthHeaders(),
        credentials: "include",
      });
      const result = await response.json();

      if (result.success) {
        setNotifications(result.data || []);
        setUnreadCount(result.unreadCount || 0);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        credentials: "include",
        body: JSON.stringify({ notificationId }),
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) =>
            n._id === notificationId ? { ...n, read: true } : n
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleViewAll = () => {
    setShowPanel(false);
    router.push("/dashboard/profile?tab=notifications");
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "booking_confirmed":
      case "booking_completed":
        return <FaCheckCircle className="text-green-500" />;
      case "booking_cancelled":
        return <FaExclamationCircle className="text-red-500" />;
      case "payment_received":
        return <FaCheckCircle className="text-blue-500" />;
      default:
        return <FaInfoCircle className="text-blue-500" />;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (!user) return null;

  return (
    <>
      <button
        onClick={() => setShowPanel(!showPanel)}
        className={`relative flex items-center mx-auto w-full rounded-xl justify-center p-3 text-white hover:bg-green-50 hover:text-gray-900 transition-all duration-300 cursor-pointer ${
          showPanel ? "bg-green-50 text-gray-900" : ""
        }`}
        title="Notifications"
      >
        <div className="relative">
          <FaBell className="text-xl" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
          {/* Connection status indicator */}
          <span
            className={`absolute bottom-0 right-0 w-2 h-2 rounded-full ${
              isConnected ? "bg-green-500" : "bg-yellow-500"
            }`}
          />
        </div>
      </button>

      {/* Notification Panel */}
      {showPanel && (
        <div className="fixed inset-0 z-50 lg:relative lg:inset-auto">
          {/* Backdrop for mobile */}
          <div
            className="fixed inset-0 bg-black/50 lg:hidden"
            onClick={() => setShowPanel(false)}
          />
          
          {/* Panel */}
          <div className="fixed left-10 top-0 h-full w-96 bg-white shadow-2xl lg:absolute lg:right-0 lg:top-auto lg:h-auto lg:max-h-[600px] lg:rounded-lg lg:border lg:border-gray-200 flex flex-col z-50">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-black text-white">
              <h3 className="font-semibold text-lg">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <span className="bg-white/20 text-white px-2 py-1 rounded-full text-xs">
                    {unreadCount} new
                  </span>
                )}
                <button
                  onClick={() => setShowPanel(false)}
                  className="text-white hover:text-gray-200 cursor-pointer"
                >
                  <FaTimes />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <FaBell className="mx-auto text-4xl mb-2 text-gray-300" />
                  <p>No notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => (
                    <div
                      key={notification._id}
                      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                        !notification.read ? "bg-blue-50 border-l-4 border-blue-500" : ""
                      }`}
                      onClick={() => {
                        if (!notification.read) {
                          markAsRead(notification._id);
                        }
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1 flex-shrink-0">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm font-medium ${
                              !notification.read
                                ? "text-gray-900"
                                : "text-gray-600"
                            }`}
                          >
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatTime(notification.createdAt)}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={handleViewAll}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-black cursor-pointer text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors font-medium"
              >
                View All Notifications
                <FaChevronRight />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


