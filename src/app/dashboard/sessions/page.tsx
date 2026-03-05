"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import Image from "next/image";

interface BookingData {
  _id: string;
  studentId?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    avatar?: string;
  };
  status: string;
  sessionDate: string;
  sessionTime: string;
  duration: number;
  price: number;
  sessionType: string;
  paymentStatus: string;
  studentNotes?: string;
  meetingLink?: string;
  feedback?: {
    studentRating?: number;
    studentReview?: string;
  };
}

const STATUS_FILTERS = [
  "all",
  "confirmed",
  "pending",
  "completed",
  "cancelled",
];

export default function SessionsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [selectedBooking, setSelectedBooking] = useState<BookingData | null>(
    null
  );
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedback, setFeedback] = useState({
    rating: 5,
    review: "",
  });

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        professionalId: user?._id || "",
      });

      if (filter !== "all") {
        params.append("status", filter);
      }

      const response = await fetch(`/api/bookings?${params}`);
      const result = await response.json();

      if (result.success) {
        setBookings(result.data);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  }, [user, filter]);

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user, filter, fetchBookings]);

  const handleCancelBooking = useCallback(
    async (bookingId: string) => {
      if (!confirm("Cancel this booking?")) return;

      const reason = prompt("Cancellation reason:");
      if (!reason) return;

      try {
        const response = await fetch("/api/bookings", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bookingId,
            status: "cancelled",
            cancelledBy: "mentor",
            cancellationReason: reason,
          }),
        });

        const result = await response.json();

        if (result.success) {
          alert("Booking cancelled");
          fetchBookings();
        } else {
          alert(result.error || "Failed to cancel");
        }
      } catch (error) {
        console.error("Error cancelling booking:", error);
        alert("An error occurred");
      }
    },
    [fetchBookings]
  );

  const handleCompleteBooking = useCallback(
    async (bookingId: string) => {
      setSelectedBooking(bookings.find((b) => b._id === bookingId) || null);
      setShowFeedbackModal(true);
    },
    [bookings]
  );

  const submitFeedback = useCallback(async () => {
    if (!selectedBooking) return;

    try {
      const response = await fetch("/api/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: selectedBooking._id,
          status: "completed",
          feedback: {
            professionalRating: feedback.rating,
            professionalReview: feedback.review,
          },
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert("Session completed!");
        setShowFeedbackModal(false);
        setSelectedBooking(null);
        setFeedback({ rating: 5, review: "" });
        fetchBookings();
      } else {
        alert(result.error || "Failed to complete");
      }
    } catch (error) {
      console.error("Error completing session:", error);
      alert("An error occurred");
    }
  }, [selectedBooking, feedback, fetchBookings]);

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-white text-black border-white";
      case "completed":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "cancelled":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      case "pending":
        return "bg-gray-800 text-gray-400 border-gray-700";
      default:
        return "bg-gray-800 text-gray-400 border-gray-700";
    }
  };

  const stats = useMemo(
    () => ({
      total: bookings.length,
      upcoming: bookings.filter((b) => b.status === "confirmed").length,
      completed: bookings.filter((b) => b.status === "completed").length,
      cancelled: bookings.filter((b) => b.status === "cancelled").length,
    }),
    [bookings]
  );

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-1">Sessions</h1>
          <p className="text-sm text-gray-500">
            Manage your mentorship sessions
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <div className="text-2xl font-bold text-white">{stats.total}</div>
            <div className="text-xs text-gray-500 mt-0.5">Total</div>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <div className="text-2xl font-bold text-white">
              {stats.upcoming}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">Upcoming</div>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <div className="text-2xl font-bold text-white">
              {stats.completed}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">Completed</div>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <div className="text-2xl font-bold text-white">
              {stats.cancelled}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">Cancelled</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-1 bg-gray-900 p-1 rounded-lg border border-gray-800 mb-6 w-fit">
          {STATUS_FILTERS.map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                filter === status
                  ? "bg-white text-black"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Bookings List */}
        {loading ? (
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
            <p className="text-sm text-gray-500">
              Your sessions will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map((booking) => (
              <div
                key={booking._id}
                className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden hover:border-gray-700 transition-colors"
              >
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <Image
                      width={48}
                      height={48}
                      src={
                        booking.studentId?.avatar ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          (booking.studentId?.firstName || "") +
                            " " +
                            (booking.studentId?.lastName || "")
                        )}&background=1f2937&color=9ca3af`
                      }
                      alt={`${booking.studentId?.firstName} ${booking.studentId?.lastName}`}
                      className="w-10 h-10 rounded-full object-cover border border-gray-700"
                    />

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="text-sm font-medium text-white">
                          {booking.studentId?.firstName}{" "}
                          {booking.studentId?.lastName}
                        </h3>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${getStatusStyles(
                            booking.status
                          )}`}
                        >
                          {booking.status.charAt(0).toUpperCase() +
                            booking.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {booking.studentId?.email}
                      </p>

                      {/* Session Details */}
                      <div className="mt-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                          <div>
                            <span className="text-gray-500 block mb-0.5">
                              Date
                            </span>
                            <span className="font-medium text-white">
                              {new Date(booking.sessionDate).toLocaleDateString(
                                "en-US",
                                {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                }
                              )}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500 block mb-0.5">
                              Time
                            </span>
                            <span className="font-medium text-white">
                              {booking.sessionTime}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500 block mb-0.5">
                              Duration
                            </span>
                            <span className="font-medium text-white">
                              {booking.duration} min
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500 block mb-0.5">
                              Price
                            </span>
                            <span className="font-medium text-amber-400">
                              {booking.price} pts
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Student Notes */}
                      {booking.studentNotes && (
                        <div className="mt-3 p-3 bg-gray-800/30 rounded-lg border border-gray-700/50">
                          <p className="text-xs text-gray-400">
                            <span className="text-gray-300">
                              Student notes:
                            </span>{" "}
                            {booking.studentNotes}
                          </p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2 mt-4">
                        {booking.status === "confirmed" &&
                          booking.meetingLink && (
                            <a
                              href={booking.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-black rounded-lg text-xs font-medium hover:bg-gray-100 transition-colors"
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
                              Start
                            </a>
                          )}
                        {booking.status === "confirmed" && (
                          <>
                            <button
                              onClick={() => handleCompleteBooking(booking._id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-xs font-medium hover:bg-emerald-600 transition-colors"
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
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                              Complete
                            </button>
                            <button
                              onClick={() => handleCancelBooking(booking._id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-700 text-gray-400 rounded-lg text-xs font-medium hover:border-rose-500/50 hover:text-rose-400 transition-colors"
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
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                              Cancel
                            </button>
                          </>
                        )}
                        {booking.status === "completed" && booking.feedback && (
                          <div className="w-full p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <svg
                                    key={star}
                                    className={`w-3.5 h-3.5 ${
                                      star <=
                                      (booking.feedback?.studentRating || 0)
                                        ? "text-amber-400"
                                        : "text-gray-600"
                                    }`}
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                              </div>
                              <span className="text-xs font-medium text-white">
                                {booking.feedback?.studentRating || "N/A"}/5
                              </span>
                            </div>
                            {booking.feedback?.studentReview && (
                              <p className="text-xs text-gray-400">
                                {booking.feedback.studentReview}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Side - Date/Time */}
                    <div className="text-right hidden sm:block">
                      <div className="text-xs text-gray-500">
                        {new Date(booking.sessionDate).toLocaleDateString(
                          "en-US",
                          {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </div>
                      <div className="text-base font-bold text-white">
                        {booking.sessionTime}
                      </div>
                      <div className="text-xs font-medium text-amber-400 mt-1">
                        {booking.price} pts
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Feedback Modal */}
        {showFeedbackModal && selectedBooking && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-xl max-w-md w-full p-6 border border-gray-800">
              <h2 className="text-lg font-semibold text-white mb-1">
                Complete Session
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                Session with {selectedBooking.studentId?.firstName}{" "}
                {selectedBooking.studentId?.lastName}
              </p>

              <div className="mb-5">
                <label className="block text-xs font-medium text-gray-400 mb-3">
                  Rate the Student
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedback({ ...feedback, rating: star })}
                      className="focus:outline-none"
                    >
                      <svg
                        className={`w-8 h-8 transition-colors ${
                          star <= feedback.rating
                            ? "text-amber-400"
                            : "text-gray-700"
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-xs font-medium text-gray-400 mb-2">
                  Feedback (Optional)
                </label>
                <textarea
                  value={feedback.review}
                  onChange={(e) =>
                    setFeedback({ ...feedback, review: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gray-600"
                  rows={3}
                  placeholder="Share your feedback..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowFeedbackModal(false);
                    setSelectedBooking(null);
                    setFeedback({ rating: 5, review: "" });
                  }}
                  className="flex-1 px-4 py-2.5 border border-gray-700 text-gray-400 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={submitFeedback}
                  className="flex-1 px-4 py-2.5 bg-white text-black rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
                >
                  Complete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
