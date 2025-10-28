'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import SeedDatabase from '@/components/admin/SeedDatabase';
import SkillsExample from '@/components/examples/SkillsExample';

export default function AdminPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            Admin Panel 🔧
          </h1>
          <p className="text-xl text-white max-w-2xl mx-auto">
            Manage database seeding and test API functionality.
          </p>
        </div>

        {/* Seed Database */}
        <SeedDatabase />

        {/* Skills Example */}
        <SkillsExample />
      </div>
    </DashboardLayout>
  );
}
