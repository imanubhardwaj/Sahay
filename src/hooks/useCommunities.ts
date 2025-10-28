import { useApi, useMutation } from './useApi';

// Types
export interface Community {
  _id: string;
  id: string;
  name: string;
  description: string;
  userId: string;
  skillId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface CreateCommunityData {
  name: string;
  description: string;
  userId: string;
  skillId: string;
}

export interface UpdateCommunityData extends Partial<CreateCommunityData> {
  _id: string;
}

// Hooks
export function useCommunities(skillId?: string) {
  return useApi<Community[]>(async () => {
    const url = skillId ? `/api/communities?skillId=${skillId}` : '/api/communities';
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch communities');
    }
    return response.json();
  }, { immediate: true });
}

export function useCommunity(id: string) {
  return useApi<Community>(async () => {
    const response = await fetch(`/api/communities/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch community');
    }
    return response.json();
  }, { immediate: true });
}

export function useCreateCommunity() {
  return useMutation<Community, CreateCommunityData>(async (data) => {
    const response = await fetch('/api/communities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to create community');
    }
    return response.json();
  });
}

export function useUpdateCommunity() {
  return useMutation<Community, UpdateCommunityData>(async (data) => {
    const { _id, ...updateData } = data;
    const response = await fetch(`/api/communities/${_id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData),
    });
    if (!response.ok) {
      throw new Error('Failed to update community');
    }
    return response.json();
  });
}

export function useDeleteCommunity() {
  return useMutation<void, string>(async (id) => {
    const response = await fetch(`/api/communities/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete community');
    }
  });
}
