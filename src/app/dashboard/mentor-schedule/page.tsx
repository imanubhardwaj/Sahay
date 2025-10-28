"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaClock,
  FaCalendarAlt,
  FaUsers,
  FaVideo,
  FaCheckCircle,
  FaTimesCircle,
  FaGlobe,
} from "react-icons/fa";
import { MdCancel } from "react-icons/md";
import { Booking } from "@/hooks/useBookings";
import { Schedule } from "@/hooks/useSchedules";

export default function MentorSchedulePage() {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [activeTab, setActiveTab] = useState<"schedules" | "bookings">(
    "schedules"
  );
  const [formData, setFormData] = useState<Omit<Schedule, "_id">>({
    id: "",
    professionalId: "",
    title: "",
    description: "",
    date: new Date().toISOString(),
    startTime: "09:00",
    endTime: "17:00",
    duration: 60,
    maxBookings: 1,
    price: 100,
    sessionType: "one-on-one",
    isRecurring: false,
    recurringPattern: "weekly",
    recurringEndDate: new Date().toISOString(),
    location: "online",
    meetingLink: "",
    address: "",
    requirements: [],
    skills: [],
    currentBookings: 0,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  // Weekly availability state
  const [weeklyAvailability, setWeeklyAvailability] = useState({
    monday: [{ start: "09:00", end: "17:00" }],
    tuesday: [{ start: "09:00", end: "17:00" }],
    wednesday: [{ start: "09:00", end: "17:00" }],
    thursday: [{ start: "09:00", end: "17:00" }],
    friday: [{ start: "09:00", end: "17:00" }],
    saturday: [],
    sunday: [],
  });

  const [timezone, setTimezone] = useState("Asia/Kolkata");

  useEffect(() => {
    if (user) {
      fetchSchedules();
      fetchBookings();
    }
  }, [user]);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/schedules?professionalId=${user?._id}`
      );
      const result = await response.json();

      if (result.success) {
        setSchedules(result.data);
      }
    } catch (error) {
      console.error("Error fetching schedules:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      const response = await fetch(`/api/bookings?mentorId=${user?._id}`);
      const result = await response.json();

      if (result.success) {
        setBookings(result.data);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openModal = (schedule?: Schedule) => {
    if (schedule) {
      setEditingSchedule(schedule);
      setFormData({
        id: schedule.id,
        professionalId: schedule.professionalId,
        title: schedule.title,
        description: schedule.description || "",
        date: new Date(schedule.date).toISOString().split("T")[0],
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        duration: schedule.duration,
        maxBookings: schedule.maxBookings,
        price: schedule.price,
        sessionType: schedule.sessionType,
        isRecurring: schedule.isRecurring,
        recurringPattern: schedule.recurringPattern,
        recurringEndDate: schedule.recurringEndDate,
        location: schedule.location,
        meetingLink: schedule.meetingLink,
        address: schedule.address,
        requirements: schedule.requirements,
        skills: schedule.skills,
        currentBookings: schedule.currentBookings,
        isActive: schedule.isActive,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } else {
      setEditingSchedule(null);
      setFormData({
        id: "",
        professionalId: "",
        title: "",
        description: "",
        date: "",
        startTime: "",
        endTime: "",
        duration: 60,
        maxBookings: 1,
        price: 100,
        sessionType: "one-on-one",
        isRecurring: false,
        recurringPattern: "weekly",
        recurringEndDate: new Date().toISOString(),
        location: "online",
        meetingLink: "",
        address: "",
        requirements: [],
        skills: [],
        currentBookings: 0,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingSchedule(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingSchedule ? "/api/schedules" : "/api/schedules";

      const payload = editingSchedule
        ? { scheduleId: editingSchedule._id, ...formData }
        : { ...formData, professionalId: user?._id };

      const response = await fetch(url, {
        method: editingSchedule ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        alert(result.message);
        fetchSchedules();
        closeModal();
      } else {
        alert(result.error || "Failed to save schedule");
      }
    } catch (error) {
      console.error("Error saving schedule:", error);
      alert("An error occurred. Please try again.");
    }
  };

  const handleDelete = async (scheduleId: string) => {
    if (!confirm("Are you sure you want to delete this schedule?")) return;

    try {
      const response = await fetch(`/api/schedules?scheduleId=${scheduleId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        alert("Schedule deleted successfully");
        fetchSchedules();
      } else {
        alert(result.error || "Failed to delete schedule");
      }
    } catch (error) {
      console.error("Error deleting schedule:", error);
      alert("An error occurred. Please try again.");
    }
  };

  const toggleActive = async (scheduleId: string, currentStatus: boolean) => {
    try {
      const response = await fetch("/api/schedules", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scheduleId,
          isActive: !currentStatus,
        }),
      });

      const result = await response.json();

      if (result.success) {
        fetchSchedules();
      } else {
        alert(result.error || "Failed to update schedule");
      }
    } catch (error) {
      console.error("Error updating schedule:", error);
      alert("An error occurred. Please try again.");
    }
  };

  const getStatusColor = (schedule: Schedule) => {
    if (!schedule.isActive) return "bg-gray-500";
    if (schedule.currentBookings >= schedule.maxBookings) return "bg-red-500";
    return "bg-green-500";
  };

  const getStatusText = (schedule: Schedule) => {
    if (!schedule.isActive) return "Inactive";
    if (schedule.currentBookings >= schedule.maxBookings) return "Fully Booked";
    return "Available";
  };

  const getBookingStatusColor = (booking: Booking) => {
    switch (booking.status) {
      case "confirmed":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "cancelled":
        return "bg-red-500";
      case "completed":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const getBookingStatusText = (booking: Booking) => {
    switch (booking.status) {
      case "confirmed":
        return "Confirmed";
      case "pending":
        return "Pending";
      case "cancelled":
        return "Cancelled";
      case "completed":
        return "Completed";
      default:
        return "Unknown";
    }
  };

  const formatDateTime = (dateString: string, timeString: string) => {
    const date = new Date(`${dateString}T${timeString}`);
    return date.toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const addTimeSlot = (day: string) => {
    setWeeklyAvailability((prev) => ({
      ...prev,
      [day]: [
        ...prev[day as keyof typeof prev],
        { start: "09:00", end: "17:00" },
      ],
    }));
  };

  const removeTimeSlot = (day: string, index: number) => {
    setWeeklyAvailability((prev) => ({
      ...prev,
      [day]: prev[day as keyof typeof prev].filter((_, i) => i !== index),
    }));
  };

  const updateTimeSlot = (
    day: string,
    index: number,
    field: "start" | "end",
    value: string
  ) => {
    setWeeklyAvailability((prev) => ({
      ...prev,
      [day]: prev[day as keyof typeof prev].map((slot, i) =>
        i === index ? { ...slot, [field]: value } : slot
      ),
    }));
  };

  const copyTimeSlot = (day: string, index: number) => {
    const slot =
      weeklyAvailability[day as keyof typeof weeklyAvailability][index];
    setWeeklyAvailability((prev) => ({
      ...prev,
      [day]: [...prev[day as keyof typeof prev], { ...slot }],
    }));
  };

  const days = [
    { key: "monday", label: "Monday", short: "M" },
    { key: "tuesday", label: "Tuesday", short: "T" },
    { key: "wednesday", label: "Wednesday", short: "W" },
    { key: "thursday", label: "Thursday", short: "T" },
    { key: "friday", label: "Friday", short: "F" },
    { key: "saturday", label: "Saturday", short: "S" },
    { key: "sunday", label: "Sunday", short: "S" },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              📅 My Schedule
            </h1>
            <p className="text-gray-400">
              Manage your availability and session slots
            </p>
          </div>
          <button
            onClick={() => openModal()}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2"
          >
            <FaPlus />
            Add Time Slot
          </button>
        </div>

        {/* Weekly Hours Section - Calendly Style */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-sm">🔄</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Weekly hours</h2>
              <p className="text-gray-600">
                Set when you are typically available for meetings
              </p>
            </div>
          </div>

          {/* Days of the week */}
          <div className="space-y-4">
            {days.map((day) => {
              const daySlots =
                weeklyAvailability[day.key as keyof typeof weeklyAvailability];
              return (
                <div key={day.key} className="flex items-center gap-4">
                  {/* Day indicator */}
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {day.short}
                  </div>

                  {/* Day name */}
                  <div className="w-24 text-sm font-medium text-gray-700">
                    {day.label}
                  </div>

                  {/* Time slots */}
                  <div className="flex-1">
                    {daySlots.length === 0 ? (
                      <div className="flex items-center gap-3">
                        <span className="text-gray-500 text-sm">
                          Unavailable
                        </span>
                        <button
                          onClick={() => addTimeSlot(day.key)}
                          className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors"
                        >
                          <span className="text-gray-600 text-sm">+</span>
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {daySlots.map((slot, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <input
                              type="time"
                              value={slot.start}
                              onChange={(e) =>
                                updateTimeSlot(
                                  day.key,
                                  index,
                                  "start",
                                  e.target.value
                                )
                              }
                              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <span className="text-gray-500">-</span>
                            <input
                              type="time"
                              value={slot.end}
                              onChange={(e) =>
                                updateTimeSlot(
                                  day.key,
                                  index,
                                  "end",
                                  e.target.value
                                )
                              }
                              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <button
                              onClick={() => removeTimeSlot(day.key, index)}
                              className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors"
                            >
                              <span className="text-red-600 text-xs">×</span>
                            </button>
                            <button
                              onClick={() => addTimeSlot(day.key)}
                              className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors"
                            >
                              <span className="text-gray-600 text-sm">+</span>
                            </button>
                            <button
                              onClick={() => copyTimeSlot(day.key, index)}
                              className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center hover:bg-blue-200 transition-colors"
                            >
                              <span className="text-blue-600 text-xs">⧉</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Time Zone */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <FaGlobe className="text-gray-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Time zone
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-gray-600">
                    {new Date().toLocaleString("en-US", {
                      timeZone: timezone,
                      timeZoneName: "long",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Asia/Kolkata">India Standard Time</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="Europe/London">GMT</option>
                    <option value="Europe/Paris">Central European Time</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8 bg-gray-800 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab("schedules")}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              activeTab === "schedules"
                ? "bg-purple-600 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <FaCalendarAlt className="inline mr-2" />
            Time Slots
          </button>
          <button
            onClick={() => setActiveTab("bookings")}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              activeTab === "bookings"
                ? "bg-purple-600 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <FaUsers className="inline mr-2" />
            Bookings & Meetings
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {activeTab === "schedules" ? (
            <>
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                <div className="text-3xl font-bold">
                  {schedules.filter((s) => s.isActive).length}
                </div>
                <div className="text-blue-100">Active Slots</div>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
                <div className="text-3xl font-bold">
                  {schedules.reduce((sum, s) => sum + s.currentBookings, 0)}
                </div>
                <div className="text-green-100">Total Bookings</div>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                <div className="text-3xl font-bold">
                  {
                    schedules.filter(
                      (s) => s.currentBookings < s.maxBookings && s.isActive
                    ).length
                  }
                </div>
                <div className="text-purple-100">Available Slots</div>
              </div>
            </>
          ) : (
            <>
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                <div className="text-3xl font-bold">
                  {bookings.filter((b) => b.status === "confirmed").length}
                </div>
                <div className="text-blue-100">Confirmed Meetings</div>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
                <div className="text-3xl font-bold">
                  {bookings.filter((b) => b.status === "completed").length}
                </div>
                <div className="text-green-100">Completed Sessions</div>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                <div className="text-3xl font-bold">
                  {bookings.filter((b) => b.status === "pending").length}
                </div>
                <div className="text-purple-100">Pending Approval</div>
              </div>
            </>
          )}
        </div>

        {/* Content based on active tab */}
        {activeTab === "schedules" ? (
          /* Schedules List */
          loading ? (
            <div className="text-center py-12 text-gray-400">
              Loading schedules...
            </div>
          ) : schedules.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center">
              <FaCalendarAlt className="mx-auto text-gray-300 mb-4" size={64} />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No Schedules Yet
              </h3>
              <p className="text-gray-500 mb-6">
                Create your first time slot to start accepting bookings
              </p>
              <button
                onClick={() => openModal()}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-medium"
              >
                Create Your First Slot
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {schedules.map((schedule) => (
                <div
                  key={schedule._id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  {/* Status Badge */}
                  <div
                    className={`${getStatusColor(
                      schedule
                    )} text-white px-4 py-2 text-sm font-semibold`}
                  >
                    {getStatusText(schedule)}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {schedule.title}
                    </h3>
                    {schedule.description && (
                      <p className="text-sm text-gray-600 mb-4">
                        {schedule.description}
                      </p>
                    )}

                    {/* Details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <FaCalendarAlt className="mr-2 text-blue-500" />
                        {new Date(schedule.date).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <FaClock className="mr-2 text-green-500" />
                        {schedule.startTime} - {schedule.endTime}
                      </div>
                      <div className="text-sm text-gray-600">
                        ⏱️ Duration: {schedule.duration} minutes
                      </div>
                      <div className="text-sm text-gray-600">
                        👥 Bookings: {schedule.currentBookings}/
                        {schedule.maxBookings}
                      </div>
                      <div className="text-sm font-semibold text-purple-600">
                        💰 {schedule.price} points
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => openModal(schedule)}
                        className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                      >
                        <FaEdit />
                        Edit
                      </button>
                      <button
                        onClick={() =>
                          toggleActive(schedule._id, schedule.isActive)
                        }
                        className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                      >
                        {schedule.isActive ? <MdCancel /> : <FaCalendarAlt />}
                        {schedule.isActive ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        onClick={() => handleDelete(schedule._id)}
                        className="text-red-600 border border-red-300 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : /* Bookings List */
        loading ? (
          <div className="text-center py-12 text-gray-400">
            Loading bookings...
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <FaUsers className="mx-auto text-gray-300 mb-4" size={64} />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Bookings Yet
            </h3>
            <p className="text-gray-500 mb-6">
              You haven&apos;t received any booking requests yet. Create time
              slots to start getting bookings.
            </p>
            <button
              onClick={() => setActiveTab("schedules")}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-medium"
            >
              Create Time Slots
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookings.map((booking) => (
              <div
                key={booking._id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                {/* Status Badge */}
                <div
                  className={`${getBookingStatusColor(
                    booking
                  )} text-white px-4 py-2 text-sm font-semibold`}
                >
                  {getBookingStatusText(booking)}
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {booking.studentId}
                  </h3>

                  {/* Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <FaCalendarAlt className="mr-2 text-blue-500" />
                      {formatDateTime(booking.sessionDate, booking.sessionTime)}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <FaClock className="mr-2 text-green-500" />
                      {booking.duration} minutes
                    </div>
                    <div className="text-sm font-semibold text-purple-600">
                      💰 {booking.price} points
                    </div>
                    {booking.meetingLink && (
                      <div className="flex items-center text-sm text-blue-600">
                        <FaVideo className="mr-2" />
                        <a
                          href={booking.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          Join Meeting
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {booking.status === "pending" && (
                      <>
                        <button
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                          onClick={() => {
                            // Handle confirm booking
                            console.log("Confirm booking:", booking._id);
                          }}
                        >
                          <FaCheckCircle />
                          Confirm
                        </button>
                        <button
                          className="flex-1 border border-red-300 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                          onClick={() => {
                            // Handle reject booking
                            console.log("Reject booking:", booking._id);
                          }}
                        >
                          <FaTimesCircle />
                          Reject
                        </button>
                      </>
                    )}
                    {booking.status === "confirmed" && (
                      <button
                        className="w-full border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                        onClick={() => {
                          // Handle mark as completed
                          console.log("Mark as completed:", booking._id);
                        }}
                      >
                        <FaCheckCircle />
                        Mark as Completed
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/10 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {editingSchedule ? "Edit Time Slot" : "Create New Time Slot"}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Session Title *
                    </label>
                    <input
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="e.g., Career Guidance Session"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      placeholder="What will you cover in this session?"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Date *
                      </label>
                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        min={new Date().toISOString().split("T")[0]}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Start Time *
                      </label>
                      <input
                        type="time"
                        name="startTime"
                        value={formData.startTime}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        End Time *
                      </label>
                      <input
                        type="time"
                        name="endTime"
                        value={formData.endTime}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Duration (minutes) *
                      </label>
                      <input
                        type="number"
                        name="duration"
                        value={formData.duration}
                        onChange={handleInputChange}
                        min="15"
                        step="15"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Max Bookings *
                      </label>
                      <input
                        type="number"
                        name="maxBookings"
                        value={formData.maxBookings}
                        onChange={handleInputChange}
                        min="1"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Price (points) *
                      </label>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        min="0"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Session Type *
                    </label>
                    <select
                      name="sessionType"
                      value={formData.sessionType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="one-on-one">One-on-One</option>
                      <option value="group">Group</option>
                      <option value="workshop">Workshop</option>
                      <option value="consultation">Consultation</option>
                    </select>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="flex-1 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-medium"
                    >
                      {editingSchedule ? "Update Slot" : "Create Slot"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
