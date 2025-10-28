import { useApi, useMutation } from './useApi';

// Types
export interface Schedule {
  _id: string;
  id: string;
  professionalId: string;
  title: string;
  description?: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  maxBookings: number;
  currentBookings: number;
  price: number;
  sessionType: 'one-on-one' | 'group' | 'workshop' | 'consultation';
  isRecurring: boolean;
  recurringPattern?: 'daily' | 'weekly' | 'monthly';
  recurringEndDate?: string;
  isActive: boolean;
  location: 'online' | 'in-person';
  meetingLink?: string;
  address?: string;
  requirements: string[];
  skills: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateScheduleData {
  professionalId: string;
  title: string;
  description?: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  maxBookings?: number;
  price: number;
  sessionType: 'one-on-one' | 'group' | 'workshop' | 'consultation';
  isRecurring?: boolean;
  recurringPattern?: 'daily' | 'weekly' | 'monthly';
  recurringEndDate?: string;
  location: 'online' | 'in-person';
  meetingLink?: string;
  address?: string;
  requirements?: string[];
  skills?: string[];
}

export interface UpdateScheduleData extends Partial<CreateScheduleData> {
  _id: string;
}

export interface OpenSlot {
  scheduleId: string;
  professionalId: string;
  title: string;
  description?: string;
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
  availableSpots: number;
  totalSpots: number;
  isAvailable: boolean;
}

// Hooks
export function useSchedules(professionalId?: string, date?: string, isActive?: boolean) {
  return useApi<Schedule[]>(async () => {
    const params = new URLSearchParams();
    if (professionalId) params.append('professionalId', professionalId);
    if (date) params.append('date', date);
    if (isActive !== undefined) params.append('isActive', isActive.toString());
    
    const url = `/api/schedules${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch schedules');
    }
    return response.json();
  }, { immediate: true });
}

export function useSchedule(id: string) {
  return useApi<Schedule>(async () => {
    const response = await fetch(`/api/schedules/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch schedule');
    }
    return response.json();
  }, { immediate: true });
}

export function useOpenSlots(professionalId: string, date: string, sessionType?: string) {
  return useApi<OpenSlot[]>(async () => {
    const params = new URLSearchParams();
    params.append('professionalId', professionalId);
    params.append('date', date);
    if (sessionType) params.append('sessionType', sessionType);
    
    const url = `/api/schedules/open-slots?${params.toString()}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch open slots');
    }
    return response.json();
  }, { immediate: true });
}

export function useCreateSchedule() {
  return useMutation<Schedule, CreateScheduleData>(async (data) => {
    const response = await fetch('/api/schedules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to create schedule');
    }
    return response.json();
  });
}

export function useUpdateSchedule() {
  return useMutation<Schedule, UpdateScheduleData>(async (data) => {
    const { _id, ...updateData } = data;
    const response = await fetch(`/api/schedules/${_id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData),
    });
    if (!response.ok) {
      throw new Error('Failed to update schedule');
    }
    return response.json();
  });
}

export function useDeleteSchedule() {
  return useMutation<void, string>(async (id) => {
    const response = await fetch(`/api/schedules/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete schedule');
    }
  });
}
