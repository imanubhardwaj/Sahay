"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { FaVideo, FaCheck, FaTimes, FaClock, FaStar } from "react-icons/fa";
import { MdPending } from "react-icons/md";

export default function SessionsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedback, setFeedback] = useState({
    rating: 5,
    review: "",
  });

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user, filter]);

  const fetchBookings = async () => {
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
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;

    const reason = prompt("Please provide a cancellation reason:");
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
        alert("Booking cancelled successfully");
        fetchBookings();
      } else {
        alert(result.error || "Failed to cancel booking");
      }
    } catch (error) {
      console.error("Error cancelling booking:", error);
      alert("An error occurred. Please try again.");
    }
  };

  const handleCompleteBooking = async (bookingId: string) => {
    setSelectedBooking(bookings.find((b) => b._id === bookingId));
    setShowFeedbackModal(true);
  };

  const submitFeedback = async () => {
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
        alert("Session marked as completed!");
        setShowFeedbackModal(false);
        setSelectedBooking(null);
        setFeedback({ rating: 5, review: "" });
        fetchBookings();
      } else {
        alert(result.error || "Failed to complete session");
      }
    } catch (error) {
      console.error("Error completing session:", error);
      alert("An error occurred. Please try again.");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <FaCheck className="mr-1" />;
      case "completed":
        return <FaCheck className="mr-1" />;
      case "cancelled":
        return <FaTimes className="mr-1" />;
      case "pending":
        return <MdPending className="mr-1" />;
      default:
        return <FaClock className="mr-1" />;
    }
  };

  const filteredBookings = bookings;

  const stats = {
    total: bookings.length,
    upcoming: bookings.filter((b) => b.status === "confirmed").length,
    completed: bookings.filter((b) => b.status === "completed").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            📅 My Sessions
          </h1>
          <p className="text-gray-400">
            Manage your mentorship sessions and track your progress
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
            <div className="text-3xl font-bold">{stats.total}</div>
            <div className="text-purple-100">Total Sessions</div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
            <div className="text-3xl font-bold">{stats.upcoming}</div>
            <div className="text-green-100">Upcoming</div>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <div className="text-3xl font-bold">{stats.completed}</div>
            <div className="text-blue-100">Completed</div>
          </div>
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white">
            <div className="text-3xl font-bold">{stats.cancelled}</div>
            <div className="text-red-100">Cancelled</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {["all", "confirmed", "pending", "completed", "cancelled"].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                variant={filter === status ? "default" : "outline"}
                size="sm"
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading sessions...</div>
        ) : filteredBookings.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <FaClock className="mx-auto text-gray-300 mb-4" size={64} />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Sessions Yet
            </h3>
            <p className="text-gray-500">
              Your booked sessions will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div
                key={booking._id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={booking.studentId?.avatar || `https://ui-avatars.com/api/?name=${booking.studentId?.firstName} ${booking.studentId?.lastName}`}
                        alt={`${booking.studentId?.firstName} ${booking.studentId?.lastName}`}
                        className="w-16 h-16 rounded-full ring-2 ring-purple-200"
                      />
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          {booking.studentId?.firstName} {booking.studentId?.lastName}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {booking.studentId?.email}
                        </p>
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold mt-2 ${getStatusColor(
                            booking.status
                          )}`}
                        >
                          {getStatusIcon(booking.status)}
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">
                        {new Date(booking.sessionDate).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                      <div className="text-lg font-bold text-gray-900">
                        {booking.sessionTime}
                      </div>
                      <div className="text-sm text-purple-600 font-semibold">
                        💰 {booking.price} points
                      </div>
                    </div>
                  </div>

                  {/* Session Details */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                      <div>
                        <span className="text-gray-600">Duration:</span>
                        <span className="ml-2 font-semibold text-gray-900">
                          {booking.duration} minutes
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Type:</span>
                        <span className="ml-2 font-semibold text-gray-900">
                          {booking.sessionType}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Payment:</span>
                        <span className="ml-2 font-semibold text-green-600">
                          {booking.paymentStatus}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Student Notes */}
                  {booking.studentNotes && (
                    <div className="bg-blue-50 rounded-lg p-4 mb-4">
                      <p className="text-sm font-semibold text-gray-700 mb-1">
                        Student Notes:
                      </p>
                      <p className="text-sm text-gray-600">{booking.studentNotes}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3">
                    {booking.status === "confirmed" && booking.zoomJoinUrl && (
                      <button
                        onClick={() => window.open(booking.zoomJoinUrl, "_blank")}
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                      >
                        <FaVideo className="mr-2" />
                        Start Meeting
                      </button>
                    )}
                    {booking.status === "confirmed" && (
                      <>
                        <button
                          onClick={() => handleCompleteBooking(booking._id)}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          <FaCheck className="mr-2" />
                          Complete
                        </button>
                        <button
                          onClick={() => handleCancelBooking(booking._id)}
                          variant="outline"
                          className="flex-1 text-red-600 border-red-600 hover:bg-red-50"
                        >
                          <FaTimes className="mr-2" />
                          Cancel
                        </button>
                      </>
                    )}
                    {booking.status === "completed" && booking.feedback && (
                      <div className="flex-1 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-3 border border-yellow-200">
                        <div className="flex items-center gap-2">
                          <FaStar className="text-yellow-500" />
                          <span className="font-semibold text-gray-900">
                            Rating: {booking.feedback.studentRating || "N/A"}/5
                          </span>
                        </div>
                        {booking.feedback.studentReview && (
                          <p className="text-sm text-gray-600 mt-2">
                            {booking.feedback.studentReview}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Feedback Modal */}
        {showFeedbackModal && selectedBooking && (
          <div className="fixed inset-0 bg-black/10 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Complete Session
              </h2>
              <p className="text-gray-600 mb-6">
                Session with {selectedBooking.studentId?.firstName} {selectedBooking.studentId?.lastName}
              </p>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Rate the Student
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedback({ ...feedback, rating: star })}
                      className="text-3xl focus:outline-none"
                    >
                      <FaStar
                        className={
                          star <= feedback.rating
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Feedback (Optional)
                </label>
                <textarea
                  value={feedback.review}
                  onChange={(e) => setFeedback({ ...feedback, review: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="Share your feedback about the session..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowFeedbackModal(false);
                    setSelectedBooking(null);
                    setFeedback({ rating: 5, review: "" });
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={submitFeedback}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  Complete Session
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

