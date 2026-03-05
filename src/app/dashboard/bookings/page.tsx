"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Input } from "@/components/ui/Input";
import Loader from "@/components/Loader";
import { Button } from "../../../../packages/ui";

interface Booking {
  _id: string;
  studentId: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    college?: string;
    year?: number;
  };
  professionalId: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    company?: string;
    experience?: number;
    domain: string;
  };
  scheduleId: {
    _id: string;
    title: string;
    description: string;
    sessionType: string;
    location: string;
  };
  status: "pending" | "confirmed" | "cancelled" | "completed" | "no-show";
  sessionDate: string;
  sessionTime: string;
  duration: number;
  price: number;
  paymentStatus: "pending" | "paid" | "refunded" | "failed";
  studentNotes?: string;
  professionalNotes?: string;
  meetingLink?: string;
  location: "online" | "in-person";
  address?: string;
  sessionType: string;
  skills: string[];
  requirements: string[];
  feedback?: {
    studentRating?: number;
    studentReview?: string;
    professionalRating?: number;
    professionalReview?: string;
    submittedAt?: string;
  };
  cancellationReason?: string;
  cancelledAt?: string;
  cancelledBy?: "student" | "professional" | "system";
  createdAt: string;
  updatedAt: string;
}

export default function BookingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDate, setFilterDate] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [professionalNotes, setProfessionalNotes] = useState("");
  const [meetingLink, setMeetingLink] = useState("");

  const loadBookings = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();

      if (user?.role === "mentor") {
        params.append("professionalId", user?._id);
      } else {
        params.append("studentId", user?._id || "");
      }

      if (filterStatus !== "all") {
        params.append("status", filterStatus);
      }

      if (filterDate) {
        params.append("date", filterDate);
      }

      const response = await fetch(`/api/bookings?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch bookings");
      }
      const data = await response.json();
      setBookings(data);
    } catch (error) {
      console.error("Failed to load bookings:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user, filterStatus, filterDate]);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    loadBookings();
  }, [user, router, filterStatus, filterDate, loadBookings]);

  const handleConfirmBooking = useCallback(
    async (bookingId: string) => {
      if (!user || !professionalNotes.trim()) return;

      try {
        const response = await fetch(`/api/bookings/${bookingId}/confirm`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            professionalId: user?._id,
            professionalNotes,
            meetingLink,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to confirm booking");
        }

        setShowConfirmModal(false);
        setSelectedBooking(null);
        setProfessionalNotes("");
        setMeetingLink("");
        loadBookings();
      } catch (error) {
        console.error("Failed to confirm booking:", error);
        alert(
          error instanceof Error ? error.message : "Failed to confirm booking"
        );
      }
    },
    [user, professionalNotes, meetingLink, loadBookings]
  );

  const handleCancelBooking = useCallback(
    async (bookingId: string, reason: string) => {
      if (!user || !confirm("Are you sure you want to cancel this booking?"))
        return;

      try {
        const response = await fetch(`/api/bookings/${bookingId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user._id,
            userRole: user.role,
            status: "cancelled",
            cancellationReason: reason,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to cancel booking");
        }

        loadBookings();
      } catch (error) {
        console.error("Failed to cancel booking:", error);
        alert(
          error instanceof Error ? error.message : "Failed to cancel booking"
        );
      }
    },
    [user, loadBookings]
  );

  const handleDeleteBooking = useCallback(
    async (bookingId: string) => {
      if (!user || !confirm("Are you sure you want to delete this booking?"))
        return;

      try {
        const response = await fetch(`/api/bookings/${bookingId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user._id,
            userRole: user.role,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to delete booking");
        }

        loadBookings();
      } catch (error) {
        console.error("Failed to delete booking:", error);
        alert(
          error instanceof Error ? error.message : "Failed to delete booking"
        );
      }
    },
    [user, loadBookings]
  );

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, []);

  const formatTime = useCallback((timeString: string) => {
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  }, []);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "confirmed":
        return "bg-green-100 text-green-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      case "completed":
        return "bg-blue-100 text-blue-700";
      case "no-show":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  }, []);

  const getPaymentStatusColor = useCallback((status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "paid":
        return "bg-green-100 text-green-700";
      case "refunded":
        return "bg-blue-100 text-blue-700";
      case "failed":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  }, []);

  if (!user) {
    return <Loader message="Loading bookings data..." />;
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            {user.role === "mentor" ? "My Bookings 📚" : "My Sessions 📚"}
          </h1>
          <p className="text-xl text-white max-w-2xl mx-auto">
            {user.role === "mentor"
              ? "Manage your session bookings and confirmations."
              : "View and manage your booked sessions."}
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-200/50">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1">
              <Input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full"
                placeholder="Filter by date"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none"
              >
                <option value="all">All Bookings</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
                <option value="no-show">No Show</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bookings List */}
        {isLoading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-3xl p-6 shadow-lg border border-gray-200/50 animate-pulse"
              >
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div
                key={booking._id}
                className="bg-white rounded-3xl p-6 shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-lg font-bold">
                        {user.role === "mentor"
                          ? booking.studentId.name.charAt(0)
                          : booking.professionalId.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {user.role === "mentor"
                            ? booking.studentId.name
                            : booking.professionalId.name}
                        </h3>
                        <p className="text-gray-600">
                          {user.role === "mentor"
                            ? booking.studentId.email
                            : booking.professionalId.email}
                        </p>
                        {user.role === "mentor" &&
                          booking.studentId.college && (
                            <p className="text-sm text-gray-500">
                              {booking.studentId.college}{" "}
                              {booking.studentId.year &&
                                `- Year ${booking.studentId.year}`}
                            </p>
                          )}
                      </div>
                    </div>

                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      {booking.scheduleId.title}
                    </h4>
                    <p className="text-gray-600 mb-4">
                      {booking.scheduleId.description}
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                      <div>
                        <span className="font-medium text-gray-700">Date:</span>
                        <p className="text-gray-600">
                          {formatDate(booking.sessionDate)}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Time:</span>
                        <p className="text-gray-600">
                          {formatTime(booking.sessionTime)}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">
                          Duration:
                        </span>
                        <p className="text-gray-600">
                          {booking.duration} minutes
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">
                          Price:
                        </span>
                        <p className="text-gray-600">₹{booking.price}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          booking.status
                        )}`}
                      >
                        {booking.status.charAt(0).toUpperCase() +
                          booking.status.slice(1)}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(
                          booking.paymentStatus
                        )}`}
                      >
                        {booking.paymentStatus.charAt(0).toUpperCase() +
                          booking.paymentStatus.slice(1)}
                      </span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                        {booking.sessionType}
                      </span>
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                        {booking.location}
                      </span>
                    </div>

                    {booking.studentNotes && (
                      <div className="bg-blue-50 rounded-2xl p-4 mb-4">
                        <h5 className="font-medium text-blue-900 mb-2">
                          Student Notes:
                        </h5>
                        <p className="text-blue-800 text-sm">
                          {booking.studentNotes}
                        </p>
                      </div>
                    )}

                    {booking.professionalNotes && (
                      <div className="bg-green-50 rounded-2xl p-4 mb-4">
                        <h5 className="font-medium text-green-900 mb-2">
                          Professional Notes:
                        </h5>
                        <p className="text-green-800 text-sm">
                          {booking.professionalNotes}
                        </p>
                      </div>
                    )}

                    {booking.meetingLink && (
                      <div className="bg-gray-50 rounded-2xl p-4 mb-4">
                        <h5 className="font-medium text-gray-900 mb-2">
                          Meeting Link:
                        </h5>
                        <a
                          href={booking.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm break-all"
                        >
                          {booking.meetingLink}
                        </a>
                      </div>
                    )}

                    {booking.skills.length > 0 && (
                      <div className="mb-4">
                        <span className="text-sm font-medium text-gray-700">
                          Skills:
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {booking.skills.map((skill) => (
                            <span
                              key={skill}
                              className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {booking.cancellationReason && (
                      <div className="bg-red-50 rounded-2xl p-4">
                        <h5 className="font-medium text-red-900 mb-2">
                          Cancellation Reason:
                        </h5>
                        <p className="text-red-800 text-sm">
                          {booking.cancellationReason}
                        </p>
                        <p className="text-red-600 text-xs mt-1">
                          Cancelled by {booking.cancelledBy} on{" "}
                          {booking.cancelledAt &&
                            new Date(booking.cancelledAt).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col space-y-2 ml-4">
                    {user.role === "mentor" && booking.status === "pending" && (
                      <Button
                        variant="contained"
                        onClick={() => {
                          setSelectedBooking(booking);
                          setShowConfirmModal(true);
                        }}
                        className="!px-4 !py-2 !rounded-2xl !bg-gradient-to-r !from-green-600 !to-blue-600 !text-white !text-sm"
                      >
                        Confirm
                      </Button>
                    )}

                    {booking.status === "pending" && (
                      <Button
                        variant="contained"
                        onClick={() => {
                          const reason = prompt(
                            "Please provide a reason for cancellation:"
                          );
                          if (reason) {
                            handleCancelBooking(booking._id, reason);
                          }
                        }}
                        className="!px-4 !py-2 !rounded-2xl !text-red-600 !border-red-200 !hover:bg-red-50 !text-sm"
                      >
                        Cancel
                      </Button>
                    )}

                    {["pending", "cancelled"].includes(booking.status) && (
                      <Button
                        variant="contained"
                        onClick={() => handleDeleteBooking(booking._id)}
                        className="!px-4 !py-2 !rounded-2xl !bg-red-100 !text-red-700 !hover:bg-red-200 !text-sm"
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {bookings.length === 0 && !isLoading && (
          <div className="text-center py-20">
            <div className="text-8xl mb-6">📚</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              No bookings found
            </h3>
            <p className="text-gray-600 mb-6">
              {user.role === "mentor"
                ? "You don't have any bookings yet. Create schedules to start receiving bookings."
                : "You haven't booked any sessions yet. Browse available schedules to book your first session."}
            </p>
            {user.role === "mentor" && (
              <Button
                variant="contained"
                onClick={() => router.push("/dashboard/schedules")}
                className="!bg-gradient-to-r !from-blue-600 !to-purple-600 !text-white"
              >
                Create Schedules
              </Button>
            )}
          </div>
        )}

        {/* Confirm Booking Modal */}
        {showConfirmModal && selectedBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Confirm Booking
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Professional Notes
                  </label>
                  <textarea
                    value={professionalNotes}
                    onChange={(e) => setProfessionalNotes(e.target.value)}
                    rows={3}
                    className="w-full p-3 rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none resize-none"
                    placeholder="Add any notes for the student..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meeting Link (if online)
                  </label>
                  <Input
                    value={meetingLink}
                    onChange={(e) => setMeetingLink(e.target.value)}
                    placeholder="https://meet.google.com/..."
                    className="w-full"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 mt-6">
                <Button
                  variant="contained"
                  onClick={() => {
                    setShowConfirmModal(false);
                    setSelectedBooking(null);
                    setProfessionalNotes("");
                    setMeetingLink("");
                  }}
                  className="!px-6 !py-2 !rounded-2xl"
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  onClick={() => handleConfirmBooking(selectedBooking._id)}
                  disabled={!professionalNotes.trim()}
                  className="!px-6 !py-2 !rounded-2xl !bg-gradient-to-r !from-green-600 !to-blue-600 !text-white"
                >
                  Confirm Booking
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
