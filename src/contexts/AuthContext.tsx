"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  ReactNode,
} from "react";
import { setToken, getAuthHeader } from "@/lib/token-storage";

interface User {
  _id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  bio?: string;
  location?: string;
  title?: string;
  yoe?: number;
  workosId: string;
  role: "student" | "mentor";
  userType: "student_fresher" | "working_professional";
  college?: string;
  year?: number;
  company?: string;
  experience?: number;
  domain: string;
  skills: string[];
  walletId?: string;
  points?: number; // This will be populated from wallet
  portfolio: string[];
  mentors: string[];
  progress: {
    currentGoal: string;
    completionRate: number;
  };
  completionRate: number;
  avatar?: string;
  isOnboardingComplete: boolean;
  profileCompletionPercentage?: number; // 0-100, used for gating features
  profileCompletionBonusAwarded?: boolean;
  hasStartedFirstCourse?: boolean;
  hasCompletedFirstMentorship?: boolean;
  signupBonusAwarded?: boolean;
  selectedModules: {
    moduleId: string;
    status: "not_started" | "in_progress" | "completed";
    startedAt?: string;
    completedAt?: string;
    progress: number;
  }[];
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<boolean>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      // Real authentication - check for session cookie or token
      const headers: HeadersInit = {
        credentials: "include",
      };

      // Add token to header if available
      const authHeader = getAuthHeader();
      if (authHeader) {
        headers["Authorization"] = authHeader;
      }

      const response = await fetch("/api/user?current=true", {
        headers,
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        // Construct name from firstName and lastName if not present
        if (
          data.user &&
          !data.user.name &&
          (data.user.firstName || data.user.lastName)
        ) {
          data.user.name = `${data.user.firstName || ""} ${
            data.user.lastName || ""
          }`.trim();
        }

        // Store token if provided in response (from verify-code endpoint)
        if (data.token) {
          setToken(data.token);
        }

        // Fetch user points from wallet
        if (data.user && data.user._id) {
          try {
            const pointsHeaders: HeadersInit = {};
            const authHeader = getAuthHeader();
            if (authHeader) {
              pointsHeaders["Authorization"] = authHeader;
            }

            const pointsResponse = await fetch(
              `/api/user/points?userId=${data.user._id}`,
              {
                headers: pointsHeaders,
                credentials: "include",
              },
            );
            if (pointsResponse.ok) {
              const pointsData = await pointsResponse.json();
              data.user.points = pointsData.points || 0;
              setUser(data.user);
            } else {
              data.user.points = 0;
              setUser(data.user);
            }
          } catch (error) {
            console.error("Failed to fetch user points:", error);
            data.user.points = 0;
            setUser(data.user);
          }
        } else {
          setUser(data.user);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const checkSession = async () => {
      // First, try to get token from API if we have a cookie but no token in localStorage
      const { getToken } = await import("@/lib/token-storage");
      if (!getToken()) {
        try {
          const tokenResponse = await fetch("/api/auth/token", {
            credentials: "include",
          });
          if (tokenResponse.ok) {
            const tokenData = await tokenResponse.json();
            if (tokenData.token) {
              const { setToken } = await import("@/lib/token-storage");
              setToken(tokenData.token);
            }
          }
        } catch (error) {
          console.error("Failed to get token:", error);
        }
      }

      await fetchUser();
      setIsLoading(false);
    };

    checkSession();
  }, [fetchUser]);

  // No polling - points/notifications refresh only when user triggers refreshUser()
  // or when returning from an action (quiz, booking, etc.)

  const logout = async () => {
    try {
      // Call logout API to clear server-side session cookies
      try {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
      } catch (apiError) {
        console.error("Logout API call failed:", apiError);
        // Continue with client-side cleanup even if API call fails
      }

      // Clear token from localStorage
      const { removeToken } = await import("@/lib/token-storage");
      removeToken();

      // Clear user state
      setUser(null);

      // Clear any other cookies as backup
      document.cookie =
        "user_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie =
        "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

      // Redirect to login
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed:", error);
      // Fallback: clear everything and redirect anyway
      const { removeToken } = await import("@/lib/token-storage");
      removeToken();
      document.cookie =
        "user_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie =
        "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      window.location.href = "/login";
    }
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!user) return false;

    try {
      // Make API call to update user in database
      const headers: HeadersInit = { "Content-Type": "application/json" };
      const authHeader = getAuthHeader();
      if (authHeader) {
        headers["Authorization"] = authHeader;
      }

      const response = await fetch("/api/user", {
        method: "PUT",
        headers,
        credentials: "include",
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const data = await response.json();
        // Construct name from firstName and lastName if not present
        if (
          data.user &&
          !data.user.name &&
          (data.user.firstName || data.user.lastName)
        ) {
          data.user.name = `${data.user.firstName || ""} ${
            data.user.lastName || ""
          }`.trim();
        }
        // Update local state with the updated user data from server
        setUser(data.user);
        return true;
      } else {
        const errorData = await response.json();
        console.error("AuthContext: API error:", errorData);
        throw new Error("Failed to update user");
      }
    } catch (error) {
      console.error("Profile update failed:", error);
      // Fallback: update local state even if API fails
      setUser({ ...user, ...updates });
      return false;
    }
  };

  const refreshUser = async () => {
    await fetchUser();
  };

  const value: AuthContextType = {
    user,
    isLoading,
    logout,
    updateUser,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
