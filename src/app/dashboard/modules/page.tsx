"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRequireAuth } from "@/hooks/useRequireAuth";

export default function ModulesPage() {
  const router = useRouter();
  const { user, isLoading } = useRequireAuth();

  useEffect(() => {
    if (isLoading || !user) return;
    router.replace("/dashboard/explore");
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-300 border-t-black" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <p className="text-gray-600">Redirecting to explore...</p>
      </div>
    </div>
  );
}
