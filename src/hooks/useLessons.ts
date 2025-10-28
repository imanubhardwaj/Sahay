import { useApi, useMutation } from './useApi';

// Types
export interface Lesson {
  _id: string;
  id: string;
  name: string;
  contentArray: string[];
  type: 'Text' | 'Code';
  content: string;
  moduleId: string;
  skillId: string;
  duration: number;
  points: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface CreateLessonData {
  name: string;
  contentArray: string[];
  type: 'Text' | 'Code';
  content: string;
  moduleId: string;
  skillId: string;
  duration: number;
  points: number;
}

export interface UpdateLessonData extends Partial<CreateLessonData> {
  _id: string;
}

// Hooks
export function useLessons(moduleId?: string) {
  return useApi<Lesson[]>(async () => {
    const url = moduleId ? `/api/lessons?moduleId=${moduleId}` : '/api/lessons';
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch lessons');
    }
    return response.json();
  }, { immediate: true });
}

export function useLesson(id: string) {
  return useApi<Lesson>(async () => {
    const response = await fetch(`/api/lessons/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch lesson');
    }
    return response.json();
  }, { immediate: true });
}

export function useCreateLesson() {
  return useMutation<Lesson, CreateLessonData>(async (data) => {
    const response = await fetch('/api/lessons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to create lesson');
    }
    return response.json();
  });
}

export function useUpdateLesson() {
  return useMutation<Lesson, UpdateLessonData>(async (data) => {
    const { _id, ...updateData } = data;
    const response = await fetch(`/api/lessons/${_id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData),
    });
    if (!response.ok) {
      throw new Error('Failed to update lesson');
    }
    return response.json();
  });
}

export function useDeleteLesson() {
  return useMutation<void, string>(async (id) => {
    const response = await fetch(`/api/lessons/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete lesson');
    }
  });
}
