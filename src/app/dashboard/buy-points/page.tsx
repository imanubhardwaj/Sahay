"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { getAuthHeader } from "@/lib/token-storage";
import { Button } from "../../../../packages/ui";

interface PointPackage {
  id: string;
  points: number;
  price: number;
  bonus?: number;
  popular?: boolean;
}

const POINT_PACKAGES: PointPackage[] = [
  { id: "1", points: 100, price: 4.99, bonus: 0 },
  { id: "2", points: 250, price: 9.99, bonus: 25, popular: true },
  { id: "3", points: 500, price: 18.99, bonus: 75 },
  { id: "4", points: 1000, price: 34.99, bonus: 200 },
  { id: "5", points: 2500, price: 79.99, bonus: 600 },
  { id: "6", points: 5000, price: 149.99, bonus: 1500 },
];

export default function BuyPointsPage() {
  const { user, refreshUser } = useAuth();
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handlePurchase = async (pkg: PointPackage) => {
    if (!user) {
      setMessage({ type: "error", text: "Please login to purchase points" });
      return;
    }

    setIsProcessing(true);
    setMessage(null);

    try {
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };
      const authHeader = getAuthHeader();
      if (authHeader) {
        headers["Authorization"] = authHeader;
      }

      // For testing: directly add points to wallet
      const response = await fetch(`/api/user/${user._id}/points`, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({
          points: pkg.points + (pkg.bonus || 0),
          source: "purchase", // Will be converted to TRANSACTION_SOURCE.Purchase in API
          description: `Purchased ${pkg.points} points${pkg.bonus ? ` + ${pkg.bonus} bonus` : ""}`,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage({
          type: "success",
          text: `Successfully added ${pkg.points + (pkg.bonus || 0)} points to your wallet!`,
        });
        // Refresh user data to update points
        if (refreshUser) {
          await refreshUser();
        }
        // Reset selection after 2 seconds
        setTimeout(() => {
          setSelectedPackage(null);
          setMessage(null);
        }, 2000);
      } else {
        setMessage({
          type: "error",
          text: data.error || "Failed to add points. Please try again.",
        });
      }
    } catch (error) {
      console.error("Error purchasing points:", error);
      setMessage({
        type: "error",
        text: "An error occurred. Please try again.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Buy Points</h1>
          <p className="text-gray-400">
            Purchase points to unlock courses, book mentor sessions, and more
          </p>
        </div>

        {/* Current Balance */}
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl p-6 mb-8 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm mb-1">Current Balance</p>
              <p className="text-4xl font-bold text-white">
                {user?.points || 0} points
              </p>
            </div>
            <div className="text-5xl">⭐</div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === "success"
                ? "bg-green-500/20 border border-green-500 text-green-400"
                : "bg-red-500/20 border border-red-500 text-red-400"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Point Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {POINT_PACKAGES.map((pkg) => (
            <div
              key={pkg.id}
              className={`relative bg-gray-900 border-2 rounded-xl p-6 transition-all duration-300 hover:scale-105 ${
                pkg.popular
                  ? "border-yellow-500 shadow-lg shadow-yellow-500/20"
                  : "border-gray-700 hover:border-gray-600"
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-yellow-500 text-black px-4 py-1 rounded-full text-xs font-bold">
                    MOST POPULAR
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <div className="text-5xl mb-2">⭐</div>
                <div className="text-3xl font-bold text-white mb-1">
                  {pkg.points.toLocaleString()}
                </div>
                <div className="text-gray-400 text-sm">points</div>
                {pkg.bonus && (
                  <div className="mt-2 text-green-400 text-sm font-semibold">
                    +{pkg.bonus} bonus points
                  </div>
                )}
              </div>

              <div className="text-center mb-6">
                <div className="text-2xl font-bold text-white mb-1">
                  ${pkg.price.toFixed(2)}
                </div>
                <div className="text-gray-400 text-sm">
                  ${(pkg.price / (pkg.points + (pkg.bonus || 0))).toFixed(4)} per point
                </div>
              </div>

              <Button
                onClick={() => handlePurchase(pkg)}
                disabled={isProcessing || selectedPackage === pkg.id}
                className={`!w-full !py-3 !rounded-lg !font-semibold !transition-all !duration-200 ${
                  pkg.popular
                    ? "!bg-gradient-to-r !from-yellow-500 !to-orange-500 !text-black !hover:!from-yellow-600 !hover:!to-orange-600"
                    : "!bg-gradient-to-r !from-blue-600 !to-purple-600 !text-white !hover:!from-blue-700 !hover:!to-purple-700"
                } !disabled:!opacity-50 !disabled:!cursor-not-allowed`}
              >
                {isProcessing && selectedPackage === pkg.id
                  ? "Processing..."
                  : `Buy ${pkg.points + (pkg.bonus || 0)} Points`}
              </Button>
            </div>
          ))}
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-gray-900 rounded-xl p-6 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4">How Points Work</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-400">
            <div>
              <h3 className="text-white font-semibold mb-2">What can you do with points?</h3>
              <ul className="space-y-1 text-sm">
                <li>• Unlock premium courses</li>
                <li>• Book mentor sessions</li>
                <li>• Access exclusive content</li>
                <li>• Participate in challenges</li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-2">Earn points for free</h3>
              <ul className="space-y-1 text-sm">
                <li>• Complete lessons (+10-50 pts)</li>
                <li>• Pass quizzes (+10-100 pts)</li>
                <li>• Solve coding problems (+10-30 pts)</li>
                <li>• Complete your profile (+50 pts)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

