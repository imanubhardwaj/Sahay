"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { getAuthHeaders } from "@/lib/token-storage";
import { usePolling } from "@/hooks/usePolling";

interface Booking {
  _id: string;
  studentId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
  professionalId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
    title?: string;
  };
  scheduleId: {
    _id: string;
    title?: string;
    description?: string;
  };
  status: "pending" | "confirmed" | "cancelled" | "completed" | "no-show";
  sessionDate: string;
  sessionTime: string;
  duration: number;
  price: number;
  paymentStatus: "Pending" | "Paid" | "Refunded" | "Failed";
  studentNotes?: string;
  professionalNotes?: string;
  meetingLink?: string;
  meetingUrl?: string;
  location: "online" | "in-person";
  address?: string;
  sessionType: string;
  approvalStatus: "Pending" | "Approved" | "Rejected";
  createdAt: string;
  updatedAt: string;
}

const STATUS_FILTERS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "confirmed", label: "Confirmed" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

export default function MySessionsPage() {
  const { user, refreshUser, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [markingComplete, setMarkingComplete] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadBookings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const params = new URLSearchParams();

      if (user?._id) {
        params.append("studentId", user._id);
      }

      if (filterStatus !== "all") {
        params.append("status", filterStatus);
      }

      const response = await fetch(`/api/bookings?${params}`, {
        headers: getAuthHeaders(),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch bookings");
      }

      const data = await response.json();
      if (data.success) {
        const newBookings = data.data || [];
        setBookings((prevBookings) => {
          if (
            prevBookings.length !== newBookings.length ||
            prevBookings.some((b, idx) => {
              const newB = newBookings[idx];
              return !newB || b._id !== newB._id || b.status !== newB.status;
            })
          ) {
            return newBookings;
          }
          return prevBookings;
        });
      } else {
        throw new Error(data.error || "Failed to fetch bookings");
      }
    } catch (error) {
      console.error("Failed to load bookings:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load sessions",
      );
    } finally {
      setIsLoading(false);
    }
  }, [user, filterStatus]);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push(
        `/login?redirect=${encodeURIComponent("/dashboard/my-sessions")}`,
      );
      return;
    }

    loadBookings();
  }, [user, router, filterStatus, loadBookings, authLoading]);

  usePolling(loadBookings, {
    enabled: !!user && !authLoading,
    interval: 30000,
  });

  const handleMarkComplete = useCallback(
    async (bookingId: string) => {
      if (
        !confirm(
          "Mark this session as complete? Points will be credited to the mentor.",
        )
      ) {
        return;
      }

      try {
        setMarkingComplete(bookingId);
        setError(null);

        const response = await fetch("/api/bookings", {
          method: "PATCH",
          headers: {
            ...getAuthHeaders(),
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            bookingId,
            status: "completed",
          }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || "Failed to mark session as complete");
        }

        setBookings((prevBookings) =>
          prevBookings.map((booking) =>
            booking._id === bookingId
              ? { ...booking, status: "completed" as const }
              : booking,
          ),
        );

        if (refreshUser) {
          await refreshUser();
        }
      } catch (error) {
        console.error("Failed to mark session as complete:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Failed to mark session as complete",
        );
        await loadBookings();
      } finally {
        setMarkingComplete(null);
      }
    },
    [loadBookings, refreshUser],
  );

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-gray-800 text-gray-400 border-gray-700";
      case "confirmed":
        return "bg-white text-black border-white";
      case "completed":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "cancelled":
        return "bg-gray-800/50 text-gray-500 border-gray-700";
      case "no-show":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      default:
        return "bg-gray-800 text-gray-400 border-gray-700";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const canMarkComplete = (booking: Booking) => {
    return booking.status === "confirmed" || booking.status === "pending";
  };

  // Calculate stats
  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === "pending").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    completed: bookings.filter((b) => b.status === "completed").length,
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-1">My Sessions</h1>
          <p className="text-sm text-gray-500">
            Manage your mentoring sessions
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <div className="text-2xl font-bold text-white">{stats.total}</div>
            <div className="text-xs text-gray-500 mt-0.5">Total</div>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <div className="text-2xl font-bold text-white">{stats.pending}</div>
            <div className="text-xs text-gray-500 mt-0.5">Pending</div>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <div className="text-2xl font-bold text-white">
              {stats.confirmed}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">Confirmed</div>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <div className="text-2xl font-bold text-white">
              {stats.completed}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">Completed</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-1 bg-gray-900 p-1 rounded-lg border border-gray-800 mb-6 w-fit">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setFilterStatus(filter.key)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                filterStatus === filter.key
                  ? "bg-white text-black"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm">
            {error}
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border border-gray-700 border-t-white" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-gray-900 rounded-xl p-12 text-center border border-gray-800">
            <div className="w-14 h-14 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-700">
              <svg
                className="w-6 h-6 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-base font-medium text-white mb-2">
              No Sessions
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              {filterStatus === "all"
                ? "You haven't booked any sessions yet."
                : `No ${filterStatus} sessions found.`}
            </p>
            <button
              onClick={() => router.push("/dashboard/mentors")}
              className="px-5 py-2 bg-white text-black cursor-pointer rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
            >
              Find Mentors
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map((booking) => (
              <div
                key={booking._id}
                className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden hover:border-gray-700 transition-colors"
              >
                <div className="p-5">
                  <div className="flex flex-col md:flex-row md:items-start gap-5">
                    {/* Mentor Info */}
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-sm font-medium text-gray-400 border border-gray-700">
                          {booking.professionalId?.firstName?.charAt(0) || "M"}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h3 className="text-sm font-medium text-white">
                              {booking.professionalId?.firstName}{" "}
                              {booking.professionalId?.lastName}
                            </h3>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${getStatusStyles(booking.status)}`}
                            >
                              {booking.status.charAt(0).toUpperCase() +
                                booking.status.slice(1)}
                            </span>
                          </div>
                          {booking.professionalId?.title && (
                            <p className="text-xs text-gray-500">
                              {booking.professionalId.title}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Session Details */}
                      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div>
                          <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">
                            Date
                          </div>
                          <div className="text-xs font-medium text-white">
                            {formatDate(booking.sessionDate)}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">
                            Time
                          </div>
                          <div className="text-xs font-medium text-white">
                            {booking.sessionTime}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">
                            Duration
                          </div>
                          <div className="text-xs font-medium text-white">
                            {booking.duration} min
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">
                            Price
                          </div>
                          <div className="text-xs font-medium text-amber-400">
                            {booking.price} pts
                          </div>
                        </div>
                      </div>

                      {/* Notes */}
                      {(booking.studentNotes || booking.professionalNotes) && (
                        <div className="mt-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
                          {booking.studentNotes && (
                            <p className="text-xs text-gray-400">
                              <span className="text-gray-300">Notes:</span>{" "}
                              {booking.studentNotes}
                            </p>
                          )}
                          {booking.professionalNotes && (
                            <p className="text-xs text-gray-400 mt-1">
                              <span className="text-gray-300">Mentor:</span>{" "}
                              {booking.professionalNotes}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Meeting Link */}
                      {booking.meetingLink &&
                        booking.status === "confirmed" && (
                          <div className="mt-4">
                            <a
                              href={booking.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg text-xs font-medium hover:bg-gray-100 transition-colors"
                            >
                              <svg
                                className="w-3.5 h-3.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1.5}
                                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                                />
                              </svg>
                              Join Meeting
                            </a>
                          </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 md:min-w-[140px]">
                      {canMarkComplete(booking) && (
                        <button
                          onClick={() => handleMarkComplete(booking._id)}
                          disabled={markingComplete === booking._id}
                          className="px-4 py-2 bg-white text-black cursor-pointer rounded-lg text-xs font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                        >
                          {markingComplete === booking._id ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border border-gray-300 border-t-black" />
                              Processing
                            </>
                          ) : (
                            <>
                              <svg
                                className="w-3.5 h-3.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1.5}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                              Complete
                            </>
                          )}
                        </button>
                      )}
                      {booking.status === "completed" && (
                        <div className="px-4 py-2 bg-emerald-500/10 text-emerald-400 rounded-lg text-xs font-medium text-center border border-emerald-500/20">
                          ✓ Completed
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
