import { useApi, useMutation } from './useApi';

// Types
export interface User {
  _id: string;
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  username?: string;
  workosId: string;
  role: 'student' | 'mentor';
  userType?: 'student_fresher' | 'working_professional';
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  collegeId?: string;
  bio?: string;
  resume?: string;
  yoe: number;
  title?: string;
  profilePictureAttachmentId?: string;
  location?: string;
  walletId?: string;
  visibility: 'public' | 'private' | 'connections';
  // Legacy fields
  name?: string;
  college?: string;
  year?: number;
  company?: string;
  experience?: number;
  domain: string;
  skills: string[];
  points: number;
  portfolio: string[];
  mentors: string[];
  progress: {
    currentGoal: string;
    completionRate: number;
  };
  completionRate: number;
  avatar?: string;
  isOnboardingComplete: boolean;
  selectedModules: Array<{
    moduleId: string;
    status: 'not_started' | 'in_progress' | 'completed';
    startedAt?: Date;
    completedAt?: Date;
    progress: number;
  }>;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface CreateUserData {
  firstName: string;
  lastName: string;
  email: string;
  username?: string;
  workosId: string;
  role: 'student' | 'mentor';
  userType?: 'student_fresher' | 'working_professional';
  bio?: string;
  yoe?: number;
  title?: string;
  location?: string;
  visibility?: 'public' | 'private' | 'connections';
}

export interface UpdateUserData extends Partial<CreateUserData> {
  _id: string;
}

// Hooks
export function useUsers(role?: string, status?: string) {
  return useApi<User[]>(async () => {
    const params = new URLSearchParams();
    if (role) params.append('role', role);
    if (status) params.append('status', status);
    
    const url = `/api/users${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }
    return response.json();
  }, { immediate: true });
}

export function useUser(id: string) {
  return useApi<User>(async () => {
    const response = await fetch(`/api/users/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch user');
    }
    return response.json();
  }, { immediate: true });
}

export function useCreateUser() {
  return useMutation<User, CreateUserData>(async (data) => {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to create user');
    }
    return response.json();
  });
}

export function useUpdateUser() {
  return useMutation<User, UpdateUserData>(async (data) => {
    const { _id, ...updateData } = data;
    const response = await fetch(`/api/users/${_id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData),
    });
    if (!response.ok) {
      throw new Error('Failed to update user');
    }
    return response.json();
  });
}

export function useDeleteUser() {
  return useMutation<void, string>(async (id) => {
    const response = await fetch(`/api/users/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete user');
    }
  });
}
