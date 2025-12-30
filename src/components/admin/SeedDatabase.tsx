"use client";

import { useState, useCallback } from "react";

export default function SeedDatabase() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleSeedDatabase = useCallback(async () => {
    setIsSeeding(true);
    setResult(null);

    try {
      const response = await fetch("/api/seed", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : "An error occurred",
      });
    } finally {
      setIsSeeding(false);
    }
  }, []);

  return (
    <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-200/50">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Database Seeding
      </h2>

      <p className="text-gray-600 mb-6">
        This will clear the database and populate it with sample data for
        testing and development.
      </p>

      <div className="space-y-4">
        <button
          onClick={handleSeedDatabase}
          disabled={isSeeding}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
        >
          {isSeeding ? "Seeding Database..." : "Seed Database"}
        </button>

        {result && (
          <div
            className={`p-4 rounded-2xl ${
              result.success
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            <h3 className="font-semibold mb-2">
              {result.success ? "✅ Success!" : "❌ Error"}
            </h3>
            <p>{result.message}</p>
          </div>
        )}
      </div>
    </div>
  );
}
