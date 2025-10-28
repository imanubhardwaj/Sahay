import { useApi, useMutation } from './useApi';

// Types
export interface Skill {
  _id: string;
  id: string;
  name: string;
  description: string;
  parentSkillId?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface CreateSkillData {
  name: string;
  description: string;
  parentSkillId?: string;
}

export interface UpdateSkillData extends Partial<CreateSkillData> {
  _id: string;
}

// Hooks
export function useSkills() {
  return useApi<Skill[]>(async () => {
    const response = await fetch('/api/skills');
    if (!response.ok) {
      throw new Error('Failed to fetch skills');
    }
    return response.json();
  }, { immediate: true });
}

export function useSkill(id: string) {
  return useApi<Skill>(async () => {
    const response = await fetch(`/api/skills/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch skill');
    }
    return response.json();
  }, { immediate: true });
}

export function useCreateSkill() {
  return useMutation<Skill, CreateSkillData>(async (data) => {
    const response = await fetch('/api/skills', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to create skill');
    }
    return response.json();
  });
}

export function useUpdateSkill() {
  return useMutation<Skill, UpdateSkillData>(async (data) => {
    const { _id, ...updateData } = data;
    const response = await fetch(`/api/skills/${_id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData),
    });
    if (!response.ok) {
      throw new Error('Failed to update skill');
    }
    return response.json();
  });
}

export function useDeleteSkill() {
  return useMutation<void, string>(async (id) => {
    const response = await fetch(`/api/skills/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete skill');
    }
  });
}
