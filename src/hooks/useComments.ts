import { useApi, useMutation } from './useApi';

// Types
export interface Comment {
  _id: string;
  id: string;
  content: string;
  userId: string;
  postId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface CreateCommentData {
  content: string;
  userId: string;
  postId: string;
}

export interface UpdateCommentData extends Partial<CreateCommentData> {
  _id: string;
}

// Hooks
export function useComments(postId?: string) {
  return useApi<Comment[]>(async () => {
    const url = postId ? `/api/comments?postId=${postId}` : '/api/comments';
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch comments');
    }
    return response.json();
  }, { immediate: true });
}

export function useComment(id: string) {
  return useApi<Comment>(async () => {
    const response = await fetch(`/api/comments/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch comment');
    }
    return response.json();
  }, { immediate: true });
}

export function useCreateComment() {
  return useMutation<Comment, CreateCommentData>(async (data) => {
    const response = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to create comment');
    }
    return response.json();
  });
}

export function useUpdateComment() {
  return useMutation<Comment, UpdateCommentData>(async (data) => {
    const { _id, ...updateData } = data;
    const response = await fetch(`/api/comments/${_id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData),
    });
    if (!response.ok) {
      throw new Error('Failed to update comment');
    }
    return response.json();
  });
}

export function useDeleteComment() {
  return useMutation<void, string>(async (id) => {
    const response = await fetch(`/api/comments/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete comment');
    }
  });
}
