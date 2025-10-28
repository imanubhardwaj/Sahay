import { useApi, useMutation } from './useApi';

// Types
export interface Module {
  _id: string;
  id: string;
  name: string;
  description: string;
  skillId: string;
  duration: number;
  points: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface CreateModuleData {
  name: string;
  description: string;
  skillId: string;
  duration: number;
  points: number;
}

export interface UpdateModuleData extends Partial<CreateModuleData> {
  _id: string;
}

// Hooks
export function useModules(skillId?: string) {
  return useApi<Module[]>(async () => {
    const url = skillId ? `/api/modules?skillId=${skillId}` : '/api/modules';
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch modules');
    }
    return response.json();
  }, { immediate: true });
}

export function useModule(id: string) {
  return useApi<Module>(async () => {
    const response = await fetch(`/api/modules/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch module');
    }
    return response.json();
  }, { immediate: true });
}

export function useCreateModule() {
  return useMutation<Module, CreateModuleData>(async (data) => {
    const response = await fetch('/api/modules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to create module');
    }
    return response.json();
  });
}

export function useUpdateModule() {
  return useMutation<Module, UpdateModuleData>(async (data) => {
    const { _id, ...updateData } = data;
    const response = await fetch(`/api/modules/${_id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData),
    });
    if (!response.ok) {
      throw new Error('Failed to update module');
    }
    return response.json();
  });
}

export function useDeleteModule() {
  return useMutation<void, string>(async (id) => {
    const response = await fetch(`/api/modules/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete module');
    }
  });
}
