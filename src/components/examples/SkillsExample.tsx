'use client';

import { useState } from 'react';
import { useSkills, useCreateSkill, useUpdateSkill, useDeleteSkill } from '@/hooks';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function SkillsExample() {
  const { data: skills, loading, error, refetch } = useSkills();
  const createSkill = useCreateSkill();
  const updateSkill = useUpdateSkill();
  const deleteSkill = useDeleteSkill();

  const [newSkill, setNewSkill] = useState({
    name: '',
    description: '',
    parentSkillId: '',
  });

  const handleCreateSkill = async () => {
    if (!newSkill.name.trim() || !newSkill.description.trim()) return;

    try {
      await createSkill.mutate({
        name: newSkill.name,
        description: newSkill.description,
        parentSkillId: newSkill.parentSkillId || undefined,
      });
      
      setNewSkill({ name: '', description: '', parentSkillId: '' });
      refetch();
    } catch (error) {
      console.error('Failed to create skill:', error);
    }
  };

  const handleDeleteSkill = async (id: string) => {
    if (!confirm('Are you sure you want to delete this skill?')) return;

    try {
      await deleteSkill.mutate(id);
      refetch();
    } catch (error) {
      console.error('Failed to delete skill:', error);
    }
  };

  if (loading) return <div>Loading skills...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-200/50">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Skills Management</h2>
        
        {/* Create Skill Form */}
        <div className="space-y-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-700">Add New Skill</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Skill name"
              value={newSkill.name}
              onChange={(e) => setNewSkill(prev => ({ ...prev, name: e.target.value }))}
            />
            <Input
              placeholder="Description"
              value={newSkill.description}
              onChange={(e) => setNewSkill(prev => ({ ...prev, description: e.target.value }))}
            />
            <select
              value={newSkill.parentSkillId}
              onChange={(e) => setNewSkill(prev => ({ ...prev, parentSkillId: e.target.value }))}
              className="px-4 py-2 rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none"
            >
              <option value="">No parent skill</option>
              {skills?.map(skill => (
                <option key={skill._id} value={skill._id}>{skill.name}</option>
              ))}
            </select>
            <button
              onClick={handleCreateSkill}
              disabled={createSkill.loading || !newSkill.name.trim() || !newSkill.description.trim()}
              className="bg-gradient-to-r from-green-600 to-blue-600 text-white"
            >
              {createSkill.loading ? 'Creating...' : 'Create Skill'}
            </button>
          </div>
        </div>

        {/* Skills List */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-700">All Skills</h3>
          {skills?.map((skill) => (
            <div key={skill._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
              <div>
                <h4 className="font-semibold text-gray-900">{skill.name}</h4>
                <p className="text-gray-600 text-sm">{skill.description}</p>
                {skill.parentSkillId && (
                  <p className="text-blue-600 text-xs">
                    Parent: {skills.find(s => s._id === skill.parentSkillId)?.name || 'Unknown'}
                  </p>
                )}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleDeleteSkill(skill._id)}
                  disabled={deleteSkill.loading}
                  className="bg-red-100 text-red-700 hover:bg-red-200 text-sm px-3 py-1"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {skills?.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No skills found. Create your first skill above.
          </div>
        )}
      </div>
    </div>
  );
}
