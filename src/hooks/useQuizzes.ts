import { useApi, useMutation } from './useApi';

// Types
export interface Quiz {
  _id: string;
  id: string;
  name: string;
  description: string;
  duration: number;
  moduleId: string;
  lessonId?: string;
  numberOfQuestions: number;
  points: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface CreateQuizData {
  name: string;
  description: string;
  duration: number;
  moduleId: string;
  lessonId?: string;
  numberOfQuestions: number;
  points: number;
}

export interface UpdateQuizData extends Partial<CreateQuizData> {
  _id: string;
}

// Hooks
export function useQuizzes(moduleId?: string) {
  return useApi<Quiz[]>(async () => {
    const url = moduleId ? `/api/quizzes?moduleId=${moduleId}` : '/api/quizzes';
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch quizzes');
    }
    return response.json();
  }, { immediate: true });
}

export function useQuiz(id: string) {
  return useApi<Quiz>(async () => {
    const response = await fetch(`/api/quizzes/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch quiz');
    }
    return response.json();
  }, { immediate: true });
}

export function useCreateQuiz() {
  return useMutation<Quiz, CreateQuizData>(async (data) => {
    const response = await fetch('/api/quizzes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to create quiz');
    }
    return response.json();
  });
}

export function useUpdateQuiz() {
  return useMutation<Quiz, UpdateQuizData>(async (data) => {
    const { _id, ...updateData } = data;
    const response = await fetch(`/api/quizzes/${_id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData),
    });
    if (!response.ok) {
      throw new Error('Failed to update quiz');
    }
    return response.json();
  });
}

export function useDeleteQuiz() {
  return useMutation<void, string>(async (id) => {
    const response = await fetch(`/api/quizzes/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete quiz');
    }
  });
}
