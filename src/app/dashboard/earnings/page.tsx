"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  FaMoneyBillWave,
  FaChartLine,
  FaClock,
  FaTrophy,
} from "react-icons/fa";
import { Transaction } from "@/models";
import Wallet from "@/models/Wallet";
import Image from "next/image";

interface Transaction {
  _id: string;
  createdAt: string;
  amount: number;
  description: string;
}

interface MentorProfile {
  _id: string;
  totalEarnings: number;
  completedSessions: number;
  averageRating: number;
}

interface Wallet {
  _id: string;
  balance: number;
  totalEarnings: number;
  totalSpent: number;
}

interface Booking {
  _id: string;
  studentId: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  price: number;
  feedback?: {
    studentRating?: number;
  };
}

interface StudentSession {
  student: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  count: number;
  totalEarnings: number;
  averageRating: number;
  ratings: number[];
}

export default function EarningsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [mentorProfile, setMentorProfile] = useState<MentorProfile | null>(
    null
  );
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch mentor profile
      const profileResponse = await fetch(
        `/api/mentor-profile?userId=${user?._id}`
      );
      const profileResult = await profileResponse.json();
      if (profileResult.success) {
        setMentorProfile(profileResult.data);
      }

      // Fetch transactions
      const transactionsResponse = await fetch(
        `/api/transactions?userId=${user?._id}&limit=50`
      );
      const transactionsResult = await transactionsResponse.json();
      if (transactionsResult.success) {
        setTransactions(
          transactionsResult.data.filter(
            (t: Record<string, unknown>) => t.type === "credit"
          )
        );
      }

      // Fetch wallet
      const walletResponse = await fetch(`/api/wallet?userId=${user?._id}`);
      const walletResult = await walletResponse.json();
      if (walletResult.success) {
        setWallet(walletResult.data);
      }

      // Fetch bookings
      const bookingsResponse = await fetch(
        `/api/bookings?professionalId=${user?._id}&status=completed`
      );
      const bookingsResult = await bookingsResponse.json();
      if (bookingsResult.success) {
        setBookings(bookingsResult.data);
      }
    } catch (error) {
      console.error("Error fetching earnings data:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, fetchData]);

  // Calculate stats
  const totalEarnings = mentorProfile?.totalEarnings || 0;
  const currentBalance = wallet?.balance || 0;
  const completedSessions = mentorProfile?.completedSessions || 0;
  const averageRating = mentorProfile?.averageRating || 0;

  // Calculate earnings by month
  const earningsByMonth = transactions.reduce(
    (acc: Record<string, number>, transaction: Transaction) => {
      const date = new Date(transaction.createdAt as string);
      const monthYear = `${date.toLocaleString("default", {
        month: "short",
      })} ${date.getFullYear()}`;

      if (!acc[monthYear]) {
        acc[monthYear] = 0;
      }
      acc[monthYear] += transaction.amount;

      return acc;
    },
    {}
  );

  const monthlyData = Object.entries(earningsByMonth).slice(-6);

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">💰 My Earnings</h1>
          <p className="text-gray-400">
            Track your mentorship earnings and financial progress
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400">
            Loading earnings data...
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <FaMoneyBillWave size={32} className="opacity-80" />
                </div>
                <div className="text-3xl font-bold mb-1">{totalEarnings}</div>
                <div className="text-green-100 text-sm">Total Earnings</div>
              </div>

              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <FaChartLine size={32} className="opacity-80" />
                </div>
                <div className="text-3xl font-bold mb-1">{currentBalance}</div>
                <div className="text-blue-100 text-sm">Current Balance</div>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <FaClock size={32} className="opacity-80" />
                </div>
                <div className="text-3xl font-bold mb-1">
                  {completedSessions}
                </div>
                <div className="text-purple-100 text-sm">
                  Sessions Completed
                </div>
              </div>

              <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <FaTrophy size={32} className="opacity-80" />
                </div>
                <div className="text-3xl font-bold mb-1">
                  {averageRating.toFixed(1)} ⭐
                </div>
                <div className="text-yellow-100 text-sm">Average Rating</div>
              </div>
            </div>

            {/* Earnings Chart */}
            {monthlyData.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Monthly Earnings Trend
                </h2>
                <div className="space-y-4">
                  {monthlyData.map(([month, amount]: [string, number]) => {
                    const maxAmount = Math.max(
                      ...(Object.values(earningsByMonth) as number[])
                    );
                    const percentage = (amount / maxAmount) * 100;

                    return (
                      <div key={month}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">
                            {month}
                          </span>
                          <span className="text-sm font-bold text-green-600">
                            {amount} points
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Transactions */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Recent Earnings
                </h2>
                {transactions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No earnings yet
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transactions.slice(0, 10).map((transaction) => (
                      <div
                        key={transaction._id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <FaMoneyBillWave className="text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {transaction.description}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(
                                transaction.createdAt
                              ).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600">
                            +{transaction.amount}
                          </p>
                          <p className="text-xs text-gray-500">points</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Top Students */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Top Students
                </h2>
                {bookings.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No completed sessions yet
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(() => {
                      // Group bookings by student
                      const studentSessions = bookings.reduce(
                        (
                          acc: Record<string, StudentSession>,
                          booking: Booking
                        ) => {
                          const studentId = booking.studentId._id;
                          if (!acc[studentId]) {
                            acc[studentId] = {
                              student: booking.studentId,
                              count: 0,
                              totalEarnings: 0,
                              averageRating: 0,
                              ratings: [],
                            };
                          }
                          acc[studentId].count += 1;
                          acc[studentId].totalEarnings += booking.price;
                          if (booking.feedback?.studentRating) {
                            acc[studentId].ratings.push(
                              booking.feedback.studentRating
                            );
                          }
                          return acc;
                        },
                        {}
                      );

                      // Calculate average ratings
                      Object.values(studentSessions).forEach(
                        (session: StudentSession) => {
                          if (session.ratings.length > 0) {
                            session.averageRating =
                              session.ratings.reduce(
                                (sum: number, r: number) => sum + r,
                                0
                              ) / session.ratings.length;
                          }
                        }
                      );

                      // Sort by earnings
                      const topStudents = Object.values(studentSessions)
                        .sort(
                          (a: StudentSession, b: StudentSession) =>
                            b.totalEarnings - a.totalEarnings
                        )
                        .slice(0, 5);

                      return topStudents.map(
                        (data: StudentSession, index: number) => (
                          <div
                            key={data.student._id}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <Image
                                  src={
                                    data.student.avatar ||
                                    `https://ui-avatars.com/api/?name=${data.student.firstName} ${data.student.lastName}`
                                  }
                                  alt={`${data.student.firstName} ${data.student.lastName}`}
                                  className="w-12 h-12 rounded-full ring-2 ring-purple-200"
                                />
                                {index < 3 && (
                                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-xs font-bold">
                                    {index + 1}
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-900">
                                  {data.student.firstName}{" "}
                                  {data.student.lastName}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {data.count} sessions
                                  {data.averageRating > 0 && (
                                    <span className="ml-2">
                                      ⭐ {data.averageRating.toFixed(1)}
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-purple-600">
                                {data.totalEarnings}
                              </p>
                              <p className="text-xs text-gray-500">points</p>
                            </div>
                          </div>
                        )
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>

            {/* Insights */}
            <div className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                💡 Insights & Tips
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Average per Session
                  </h3>
                  <p className="text-2xl font-bold text-purple-600">
                    {completedSessions > 0
                      ? Math.round(totalEarnings / completedSessions)
                      : 0}{" "}
                    points
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Completion Rate
                  </h3>
                  <p className="text-2xl font-bold text-green-600">
                    {mentorProfile?.completedSessions &&
                    mentorProfile.completedSessions > 0
                      ? Math.round(
                          (completedSessions /
                            mentorProfile.completedSessions) *
                            100
                        )
                      : 0}
                    %
                  </p>
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-600">
                <p className="mb-2">
                  🌟 Maintain a high rating to attract more students
                </p>
                <p className="mb-2">
                  📅 Add more availability slots to increase bookings
                </p>
                <p>
                  💬 Provide detailed session descriptions for better
                  conversions
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
