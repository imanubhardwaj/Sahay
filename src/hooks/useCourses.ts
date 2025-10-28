import { useApi, useMutation } from './useApi';

// Types
export interface Course {
  _id: string;
  id: string;
  name: string;
  description: string;
  skillIds: string[];
  duration: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  subModuleIds: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface CreateCourseData {
  name: string;
  description: string;
  skillIds: string[];
  duration: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  subModuleIds?: string[];
  tags?: string[];
}

export interface UpdateCourseData extends Partial<CreateCourseData> {
  _id: string;
}

// Hooks
export function useCourses(skillId?: string, level?: string) {
  return useApi<Course[]>(async () => {
    const params = new URLSearchParams();
    if (skillId) params.append('skillId', skillId);
    if (level) params.append('level', level);
    
    const url = `/api/courses${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch courses');
    }
    return response.json();
  }, { immediate: true });
}

export function useCourse(id: string) {
  return useApi<Course>(async () => {
    const response = await fetch(`/api/courses/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch course');
    }
    return response.json();
  }, { immediate: true });
}

export function useCreateCourse() {
  return useMutation<Course, CreateCourseData>(async (data) => {
    const response = await fetch('/api/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to create course');
    }
    return response.json();
  });
}

export function useUpdateCourse() {
  return useMutation<Course, UpdateCourseData>(async (data) => {
    const { _id, ...updateData } = data;
    const response = await fetch(`/api/courses/${_id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData),
    });
    if (!response.ok) {
      throw new Error('Failed to update course');
    }
    return response.json();
  });
}

export function useDeleteCourse() {
  return useMutation<void, string>(async (id) => {
    const response = await fetch(`/api/courses/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete course');
    }
  });
}
