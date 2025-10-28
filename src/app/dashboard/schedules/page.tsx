"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface Schedule {
  _id: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  price: number;
  sessionType: string;
  location: string;
  meetingLink?: string;
  address?: string;
  requirements: string[];
  skills: string[];
  maxBookings: number;
  currentBookings: number;
  isActive: boolean;
  isRecurring: boolean;
  recurringPattern?: string;
  recurringEndDate?: string;
  professionalId: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    company?: string;
    experience?: number;
    domain: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function SchedulesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filterDate, setFilterDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const [newSchedule, setNewSchedule] = useState({
    title: "",
    description: "",
    date: "",
    startTime: "",
    endTime: "",
    duration: 30,
    price: 0,
    sessionType: "one-on-one",
    location: "online",
    meetingLink: "",
    address: "",
    requirements: [] as string[],
    skills: [] as string[],
    maxBookings: 1,
    isRecurring: false,
    recurringPattern: "weekly",
    recurringEndDate: "",
  });

  const sessionTypes = useMemo(() => [
    { value: "one-on-one", label: "One-on-One" },
    { value: "group", label: "Group Session" },
    { value: "workshop", label: "Workshop" },
    { value: "consultation", label: "Consultation" },
  ], []);

  const locations = useMemo(() => [
    { value: "online", label: "Online" },
    { value: "in-person", label: "In-Person" },
  ], []);

  const commonSkills = useMemo(() => [
    "JavaScript",
    "Python",
    "React",
    "Node.js",
    "TypeScript",
    "Java",
    "C++",
    "Data Structures",
    "Algorithms",
    "System Design",
    "AWS",
    "Docker",
    "Kubernetes",
    "Machine Learning",
    "AI",
    "Web Development",
    "Mobile Development",
    "DevOps",
    "Cybersecurity",
    "Blockchain",
  ], []);

  const commonRequirements = useMemo(() => [
    "Laptop with stable internet",
    "Code editor installed",
    "Git installed",
    "Basic programming knowledge",
    "Specific project files",
    "Camera and microphone",
    "Quiet environment",
    "Notebook for notes",
    "Previous session materials",
  ], []);

  const loadSchedules = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      params.append("professionalId", user._id);

      if (filterDate) {
        params.append("date", filterDate);
      }

      if (filterStatus !== "all") {
        params.append("isActive", (filterStatus === "active").toString());
      }

      const response = await fetch(`/api/schedules?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch schedules");
      }
      const data = await response.json();
      setSchedules(data);
    } catch (error) {
      console.error("Failed to load schedules:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user, filterDate, filterStatus]);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (user.role !== "mentor") {
      router.push("/dashboard");
      return;
    }

    loadSchedules();
  }, [user, router, loadSchedules]);

  const handleCreateSchedule = useCallback(async () => {
    if (
      !user ||
      !newSchedule.title.trim() ||
      !newSchedule.date ||
      !newSchedule.startTime ||
      !newSchedule.endTime
    )
      return;

    try {
      const response = await fetch("/api/schedules", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newSchedule,
          professionalId: user._id,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create schedule");
      }

      setNewSchedule({
        title: "",
        description: "",
        date: "",
        startTime: "",
        endTime: "",
        duration: 30,
        price: 0,
        sessionType: "one-on-one",
        location: "online",
        meetingLink: "",
        address: "",
        requirements: [],
        skills: [],
        maxBookings: 1,
        isRecurring: false,
        recurringPattern: "weekly",
        recurringEndDate: "",
      });
      setShowCreateForm(false);
      loadSchedules();
    } catch (error) {
      console.error("Failed to create schedule:", error);
      alert(
        error instanceof Error ? error.message : "Failed to create schedule"
      );
    }
  }, [user, loadSchedules, newSchedule]);

  const handleDeleteSchedule = useCallback(
    async (scheduleId: string) => {
      if (!user || !confirm("Are you sure you want to delete this schedule?"))
        return;

      try {
        const response = await fetch(`/api/schedules/${scheduleId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ professionalId: user._id }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to delete schedule");
        }

        loadSchedules();
      } catch (error) {
        console.error("Failed to delete schedule:", error);
        alert(
          error instanceof Error ? error.message : "Failed to delete schedule"
        );
      }
    },
    [user, loadSchedules]
  );

  const toggleScheduleStatus = useCallback(
    async (scheduleId: string, isActive: boolean) => {
      if (!user) return;

      try {
        const response = await fetch(`/api/schedules/${scheduleId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            professionalId: user._id,
            isActive: !isActive,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to update schedule");
        }

        loadSchedules();
      } catch (error) {
        console.error("Failed to update schedule:", error);
        alert(
          error instanceof Error ? error.message : "Failed to update schedule"
        );
      }
    },
    [user, loadSchedules]
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (!user || user.role !== "mentor") {
    return <div>Loading...</div>;
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            My Schedules 📅
          </h1>
          <p className="text-xl text-white max-w-2xl mx-auto">
            Manage your availability and create sessions for students to book.
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
                <option value="all">All Schedules</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
              >
                {showCreateForm ? "Cancel" : "Create Schedule"}
              </button>
            </div>
          </div>
        </div>

        {/* Create Schedule Form */}
        {showCreateForm && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-6 border border-blue-200/50 shadow-lg">
            <h2 className="text-2xl font-bold text-black mb-6">
              Create New Schedule
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <Input
                  value={newSchedule.title}
                  onChange={(e) =>
                    setNewSchedule((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  placeholder="e.g., JavaScript Fundamentals Session"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Session Type
                </label>
                <select
                  value={newSchedule.sessionType}
                  onChange={(e) =>
                    setNewSchedule((prev) => ({
                      ...prev,
                      sessionType: e.target.value,
                    }))
                  }
                  className="w-full p-3 rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none"
                >
                  {sessionTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date *
                </label>
                <Input
                  type="date"
                  value={newSchedule.date}
                  onChange={(e) =>
                    setNewSchedule((prev) => ({
                      ...prev,
                      date: e.target.value,
                    }))
                  }
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time *
                </label>
                <Input
                  type="time"
                  value={newSchedule.startTime}
                  onChange={(e) =>
                    setNewSchedule((prev) => ({
                      ...prev,
                      startTime: e.target.value,
                    }))
                  }
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Time *
                </label>
                <Input
                  type="time"
                  value={newSchedule.endTime}
                  onChange={(e) =>
                    setNewSchedule((prev) => ({
                      ...prev,
                      endTime: e.target.value,
                    }))
                  }
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (minutes)
                </label>
                <Input
                  type="number"
                  value={newSchedule.duration}
                  onChange={(e) =>
                    setNewSchedule((prev) => ({
                      ...prev,
                      duration: parseInt(e.target.value) || 30,
                    }))
                  }
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (₹)
                </label>
                <Input
                  type="number"
                  value={newSchedule.price}
                  onChange={(e) =>
                    setNewSchedule((prev) => ({
                      ...prev,
                      price: parseInt(e.target.value) || 0,
                    }))
                  }
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <select
                  value={newSchedule.location}
                  onChange={(e) =>
                    setNewSchedule((prev) => ({
                      ...prev,
                      location: e.target.value,
                    }))
                  }
                  className="w-full p-3 rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none"
                >
                  {locations.map((location) => (
                    <option key={location.value} value={location.value}>
                      {location.label}
                    </option>
                  ))}
                </select>
              </div>

              {newSchedule.location === "online" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meeting Link
                  </label>
                  <Input
                    value={newSchedule.meetingLink}
                    onChange={(e) =>
                      setNewSchedule((prev) => ({
                        ...prev,
                        meetingLink: e.target.value,
                      }))
                    }
                    placeholder="https://meet.google.com/..."
                    className="w-full"
                  />
                </div>
              )}

              {newSchedule.location === "in-person" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <Input
                    value={newSchedule.address}
                    onChange={(e) =>
                      setNewSchedule((prev) => ({
                        ...prev,
                        address: e.target.value,
                      }))
                    }
                    placeholder="Enter meeting address"
                    className="w-full"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Bookings
                </label>
                <Input
                  type="number"
                  value={newSchedule.maxBookings}
                  onChange={(e) =>
                    setNewSchedule((prev) => ({
                      ...prev,
                      maxBookings: parseInt(e.target.value) || 1,
                    }))
                  }
                  className="w-full"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={newSchedule.description}
                onChange={(e) =>
                  setNewSchedule((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={3}
                className="w-full p-3 rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none resize-none"
                placeholder="Describe what this session will cover..."
              />
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Skills Covered
              </label>
              <div className="flex flex-wrap gap-2">
                {commonSkills.map((skill) => (
                  <button
                    key={skill}
                    onClick={() => {
                      const skills = newSchedule.skills.includes(skill)
                        ? newSchedule.skills.filter((s) => s !== skill)
                        : [...newSchedule.skills, skill];
                      setNewSchedule((prev) => ({ ...prev, skills }));
                    }}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                      newSchedule.skills.includes(skill)
                        ? "bg-blue-500 text-white shadow-lg"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Requirements
              </label>
              <div className="flex flex-wrap gap-2">
                {commonRequirements.map((req) => (
                  <button
                    key={req}
                    onClick={() => {
                      const requirements = newSchedule.requirements.includes(
                        req
                      )
                        ? newSchedule.requirements.filter((r) => r !== req)
                        : [...newSchedule.requirements, req];
                      setNewSchedule((prev) => ({ ...prev, requirements }));
                    }}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                      newSchedule.requirements.includes(req)
                        ? "bg-green-500 text-white shadow-lg"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {req}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                variant="outline"
                onClick={() => setShowCreateForm(false)}
                className="px-6 py-2 rounded-2xl"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSchedule}
                disabled={
                  !newSchedule.title.trim() ||
                  !newSchedule.date ||
                  !newSchedule.startTime ||
                  !newSchedule.endTime
                }
                className="px-6 py-2 rounded-2xl bg-gradient-to-r from-green-600 to-blue-600 text-white"
              >
                Create Schedule
              </button>
            </div>
          </div>
        )}

        {/* Schedules List */}
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
            {schedules.map((schedule) => (
              <div
                key={schedule._id}
                className="bg-white rounded-3xl p-6 shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {schedule.title}
                    </h3>
                    <p className="text-gray-600 mb-4">{schedule.description}</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Date:</span>
                        <p className="text-gray-600">
                          {formatDate(schedule.date)}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Time:</span>
                        <p className="text-gray-600">
                          {formatTime(schedule.startTime)} -{" "}
                          {formatTime(schedule.endTime)}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">
                          Price:
                        </span>
                        <p className="text-gray-600">₹{schedule.price}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">
                          Bookings:
                        </span>
                        <p className="text-gray-600">
                          {schedule.currentBookings}/{schedule.maxBookings}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          schedule.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {schedule.isActive ? "Active" : "Inactive"}
                      </span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                        {schedule.sessionType}
                      </span>
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                        {schedule.location}
                      </span>
                    </div>

                    {schedule.skills.length > 0 && (
                      <div className="mt-4">
                        <span className="text-sm font-medium text-gray-700">
                          Skills:
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {schedule.skills.map((skill) => (
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
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() =>
                        toggleScheduleStatus(schedule._id, schedule.isActive)
                      }
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                        schedule.isActive
                          ? "bg-red-100 text-red-700 hover:bg-red-200"
                          : "bg-green-100 text-green-700 hover:bg-green-200"
                      }`}
                    >
                      {schedule.isActive ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      onClick={() => handleDeleteSchedule(schedule._id)}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium hover:bg-red-200 transition-all duration-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {schedules.length === 0 && !isLoading && (
          <div className="text-center py-20">
            <div className="text-8xl mb-6">📅</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              No schedules found
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first schedule to start offering sessions to students.
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
            >
              Create First Schedule
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
