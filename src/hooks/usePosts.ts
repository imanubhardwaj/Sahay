import { useApi, useMutation } from './useApi';

// Types
export interface PostAttachment {
  type: string;
  attachmentId?: string;
  content: string;
}

export interface Post {
  _id: string;
  id: string;
  userId: string;
  content: string;
  communityId: string;
  skillIds: string[];
  postAttachments: PostAttachment[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface CreatePostData {
  userId: string;
  content: string;
  communityId: string;
  skillIds: string[];
  postAttachments?: PostAttachment[];
}

export interface UpdatePostData extends Partial<CreatePostData> {
  _id: string;
}

// Hooks
export function usePosts(communityId?: string, skillId?: string) {
  return useApi<Post[]>(async () => {
    const params = new URLSearchParams();
    if (communityId) params.append('communityId', communityId);
    if (skillId) params.append('skillId', skillId);
    
    const url = `/api/posts${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch posts');
    }
    return response.json();
  }, { immediate: true });
}

export function usePost(id: string) {
  return useApi<Post>(async () => {
    const response = await fetch(`/api/posts/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch post');
    }
    return response.json();
  }, { immediate: true });
}

export function useCreatePost() {
  return useMutation<Post, CreatePostData>(async (data) => {
    const response = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to create post');
    }
    return response.json();
  });
}

export function useUpdatePost() {
  return useMutation<Post, UpdatePostData>(async (data) => {
    const { _id, ...updateData } = data;
    const response = await fetch(`/api/posts/${_id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData),
    });
    if (!response.ok) {
      throw new Error('Failed to update post');
    }
    return response.json();
  });
}

export function useDeletePost() {
  return useMutation<void, string>(async (id) => {
    const response = await fetch(`/api/posts/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete post');
    }
  });
}
