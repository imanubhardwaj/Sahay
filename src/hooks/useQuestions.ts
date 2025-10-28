import { useApi, useMutation } from './useApi';

// Types
export interface QuestionOption {
  id: string;
  type: 'Text' | 'Code';
  content: string;
}

export interface QuestionAnswer {
  type: 'Text' | 'Code';
  content: string;
  optionId?: string;
}

export interface Question {
  _id: string;
  id: string;
  type: 'MCQ' | 'Subjective' | 'Code';
  quizId: string;
  lessonId?: string;
  moduleId: string;
  options: QuestionOption[];
  answer: QuestionAnswer;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface CreateQuestionData {
  type: 'MCQ' | 'Subjective' | 'Code';
  quizId: string;
  lessonId?: string;
  moduleId: string;
  options: QuestionOption[];
  answer: QuestionAnswer;
}

export interface UpdateQuestionData extends Partial<CreateQuestionData> {
  _id: string;
}

// Hooks
export function useQuestions(quizId?: string) {
  return useApi<Question[]>(async () => {
    const url = quizId ? `/api/questions?quizId=${quizId}` : '/api/questions';
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch questions');
    }
    return response.json();
  }, { immediate: true });
}

export function useQuestion(id: string) {
  return useApi<Question>(async () => {
    const response = await fetch(`/api/questions/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch question');
    }
    return response.json();
  }, { immediate: true });
}

export function useCreateQuestion() {
  return useMutation<Question, CreateQuestionData>(async (data) => {
    const response = await fetch('/api/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to create question');
    }
    return response.json();
  });
}

export function useUpdateQuestion() {
  return useMutation<Question, UpdateQuestionData>(async (data) => {
    const { _id, ...updateData } = data;
    const response = await fetch(`/api/questions/${_id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData),
    });
    if (!response.ok) {
      throw new Error('Failed to update question');
    }
    return response.json();
  });
}

export function useDeleteQuestion() {
  return useMutation<void, string>(async (id) => {
    const response = await fetch(`/api/questions/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete question');
    }
  });
}
