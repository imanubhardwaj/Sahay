import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Skill, Module } from '@/models';
import { seedSkills } from '../../../../scripts/seed/skills';
import { seedModules } from '../../../../scripts/seed/modules';
import { seedLessonsWithContent } from '../../../../scripts/seed/lessons-with-content';

export async function POST() {
  try {
    await connectDB();
    console.log('🌱 Starting lessons content seeding via API...');

    // Clear collections
    await Promise.all([
      Skill.deleteMany({}),
      Module.deleteMany({}),
    ]);
    console.log('🗑️  Cleared collections.');

    // Seed skills first
    const skills = await seedSkills();
    console.log(`✅ Seeded ${skills.length} skills`);

    // Seed modules
    const modules = await seedModules();
    console.log(`✅ Seeded ${modules.length} modules`);

    // Seed lessons with detailed content and quizzes
    const result = await seedLessonsWithContent(modules, skills);
    console.log(`✅ Seeded ${result.lessons.length} lessons, ${result.quizzes.length} quizzes, ${result.questions.length} questions`);

    return NextResponse.json({
      success: true,
      message: 'Lessons with detailed content and quizzes seeded successfully!',
      stats: {
        skills: skills.length,
        modules: modules.length,
        lessons: result.lessons.length,
        quizzes: result.quizzes.length,
        questions: result.questions.length
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error seeding lessons content:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
