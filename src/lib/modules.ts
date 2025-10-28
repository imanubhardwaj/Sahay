import modulesData from '@/data/modules.json';

export interface Module {
  id: string;
  title: string;
  description: string;
  topics: string[];
  quizQuestions: {
    question: string;
    options: string[];
    answer: string;
  }[];
  codingChallenges: {
    title: string;
    description: string;
  }[];
  references: {
    title: string;
    url: string;
  }[];
}

export interface Domain {
  title: string;
  modules: Module[];
  frontend?: {
    title: string;
    modules: Module[];
  };
  backend?: {
    title: string;
    modules: Module[];
  };
}

export interface LearningPath {
  title: string;
  description: string;
  domains: {
    [key: string]: Domain;
  };
}

export interface ModulesData {
  learningPaths: {
    [key: string]: LearningPath;
  };
}

export function getModulesForUserType(userType: string): LearningPath | null {
  const modules = modulesData as ModulesData;
  return modules.learningPaths[userType] || null;
}

export function getAllModulesForUserType(userType: string): Module[] {
  const learningPath = getModulesForUserType(userType);
  if (!learningPath) return [];

  const allModules: Module[] = [];
  
  Object.values(learningPath.domains).forEach(domain => {
    if (domain.modules) {
      allModules.push(...domain.modules);
    }
    if (domain.frontend?.modules) {
      allModules.push(...domain.frontend.modules);
    }
    if (domain.backend?.modules) {
      allModules.push(...domain.backend.modules);
    }
  });

  return allModules;
}

export function getModuleById(moduleId: string, userType: string): Module | null {
  const allModules = getAllModulesForUserType(userType);
  return allModules.find(module => module.id === moduleId) || null;
}

export function getUserTypeDisplayName(userType: string): string {
  const displayNames: { [key: string]: string } = {
    'student_fresher': 'Student / Fresher',
    'working_professional_2_3_yr': 'Working Professional (2-3 Yrs)',
    'experienced_professional_4_6_yr': 'Experienced Professional (4-6 Yrs)',
    'industry_expert_8_plus_yr': 'Industry Expert (8+ Yrs)',
    'company': 'Company'
  };
  
  return displayNames[userType] || userType;
}
