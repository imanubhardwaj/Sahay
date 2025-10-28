import { useApi, useMutation } from './useApi';

// Types
export interface Booking {
  _id: string;
  id: string;
  studentId: string;
  professionalId: string;
  scheduleId: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no-show';
  sessionDate: string;
  sessionTime: string;
  duration: number;
  price: number;
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'failed';
  paymentId?: string;
  studentNotes?: string;
  professionalNotes?: string;
  meetingLink?: string;
  location: 'online' | 'in-person';
  address?: string;
  sessionType: 'one-on-one' | 'group' | 'workshop' | 'consultation';
  skills: string[];
  requirements: string[];
  feedback?: {
    studentRating?: number;
    studentReview?: string;
    professionalRating?: number;
    professionalReview?: string;
    submittedAt?: string;
  };
  cancellationReason?: string;
  cancelledAt?: string;
  cancelledBy?: 'student' | 'professional' | 'system';
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingData {
  studentId: string;
  scheduleId: string;
  studentNotes?: string;
}

export interface UpdateBookingData {
  _id: string;
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no-show';
  professionalNotes?: string;
  meetingLink?: string;
  cancellationReason?: string;
}

export interface ConfirmBookingData {
  professionalId: string;
  professionalNotes?: string;
  meetingLink?: string;
}

// Hooks
export function useBookings(studentId?: string, professionalId?: string, status?: string) {
  return useApi<Booking[]>(async () => {
    const params = new URLSearchParams();
    if (studentId) params.append('studentId', studentId);
    if (professionalId) params.append('professionalId', professionalId);
    if (status) params.append('status', status);
    
    const url = `/api/bookings${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch bookings');
    }
    return response.json();
  }, { immediate: true });
}

export function useBooking(id: string) {
  return useApi<Booking>(async () => {
    const response = await fetch(`/api/bookings/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch booking');
    }
    return response.json();
  }, { immediate: true });
}

export function useCreateBooking() {
  return useMutation<Booking, CreateBookingData>(async (data) => {
    const response = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to create booking');
    }
    return response.json();
  });
}

export function useUpdateBooking() {
  return useMutation<Booking, UpdateBookingData>(async (data) => {
    const { _id, ...updateData } = data;
    const response = await fetch(`/api/bookings/${_id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData),
    });
    if (!response.ok) {
      throw new Error('Failed to update booking');
    }
    return response.json();
  });
}

export function useConfirmBooking() {
  return useMutation<Booking, { bookingId: string; data: ConfirmBookingData }>(async ({ bookingId, data }) => {
    const response = await fetch(`/api/bookings/${bookingId}/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to confirm booking');
    }
    return response.json();
  });
}

export function useDeleteBooking() {
  return useMutation<void, string>(async (id) => {
    const response = await fetch(`/api/bookings/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete booking');
    }
  });
}
