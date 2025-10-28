'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
  role: 'student' | 'mentor';
  userType: 'student_fresher' | 'working_professional_2_3_yr' | 'experienced_professional_4_6_yr' | 'industry_expert_8_plus_yr' | 'company';
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
  selectedModules: {
    moduleId: string;
    status: 'not_started' | 'in_progress' | 'completed';
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

  const fetchUser = async () => {
    try {
      // Real authentication - check for session cookie
      const response = await fetch('/api/user?current=true', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        // Construct name from firstName and lastName if not present
        if (data.user && !data.user.name && (data.user.firstName || data.user.lastName)) {
          data.user.name = `${data.user.firstName || ''} ${data.user.lastName || ''}`.trim();
        }
        
        // Fetch user points from wallet
        if (data.user && data.user._id) {
          try {
            const pointsResponse = await fetch(`/api/user/points?userId=${data.user._id}`);
            if (pointsResponse.ok) {
              const pointsData = await pointsResponse.json();
              data.user.points = pointsData.points || 0;
            } else {
              data.user.points = 0;
            }
          } catch (error) {
            console.error('Failed to fetch user points:', error);
            data.user.points = 0;
          }
        }
        
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      setUser(null);
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      await fetchUser();
      setIsLoading(false);
    };

    checkSession();
  }, []);

  const logout = async () => {
    try {
      // Bypass logout for development - just clear user and redirect
      setUser(null);
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!user) return false;
    
    try {
      console.log('AuthContext: Updating user with:', updates);
      
      // Make API call to update user in database
      const response = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updates)
      });

      console.log('AuthContext: API response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('AuthContext: Updated user data from server:', data.user);
        // Construct name from firstName and lastName if not present
        if (data.user && !data.user.name && (data.user.firstName || data.user.lastName)) {
          data.user.name = `${data.user.firstName || ''} ${data.user.lastName || ''}`.trim();
        }
        // Update local state with the updated user data from server
        setUser(data.user);
        return true;
      } else {
        const errorData = await response.json();
        console.error('AuthContext: API error:', errorData);
        throw new Error('Failed to update user');
      }
    } catch (error) {
      console.error('Profile update failed:', error);
      // Fallback: update local state even if API fails
      setUser({ ...user, ...updates });
      return false;
    }
  };

  const refreshUser = async () => {
    // Bypass refresh for development - just call fetchUser
    await fetchUser();
  };

  const value: AuthContextType = {
    user,
    isLoading,
    logout,
    updateUser,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
