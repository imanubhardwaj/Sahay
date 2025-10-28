'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const USER_TYPES = [
  {
    id: 'student_fresher',
    title: 'Student / Fresher',
    description: 'Just starting your tech journey',
    icon: '🎓',
  },
  {
    id: 'working_professional_2_3_yr',
    title: 'Working Professional (2-3 Yrs)',
    description: 'Looking to advance your skills',
    icon: '💼',
  },
  {
    id: 'experienced_professional_4_6_yr',
    title: 'Experienced Professional (4-6 Yrs)',
    description: 'Ready for senior-level challenges',
    icon: '🚀',
  },
  {
    id: 'industry_expert_8_plus_yr',
    title: 'Industry Expert (8+ Yrs)',
    description: 'Leading technical strategy',
    icon: '👑',
  },
];

const DOMAINS = [
  'Web Development',
  'Mobile Development',
  'Data Science',
  'Machine Learning',
  'DevOps',
  'Cybersecurity',
];

const LEARNING_GOALS = [
  'Get a Job',
  'Build Projects',
  'Learn New Skills',
  'Career Change',
  'Academic Excellence',
  'Lead Teams',
  'Start a Company',
];

export default function SimplifiedOnboardingPage() {
  const { user, updateUser } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    userType: '',
    domain: '',
    learningGoals: [] as string[],
    careerGoals: '',
  });

  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else if (user.isOnboardingComplete) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleUserTypeSelect = (userType: string) => {
    setFormData(prev => ({ ...prev, userType }));
    setStep(2);
  };

  const handleGoalToggle = (goal: string) => {
    setFormData(prev => {
      const goals = prev.learningGoals.includes(goal)
        ? prev.learningGoals.filter(g => g !== goal)
        : [...prev.learningGoals, goal];
      return { ...prev, learningGoals: goals };
    });
  };

  const handleSubmit = async () => {
    if (!user) return;

    // Validate required fields
    if (!formData.firstName || !formData.userType || !formData.domain) {
      alert('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        userType: formData.userType as any,
        domain: formData.domain,
        username: user.email.split('@')[0],
        bio: formData.careerGoals || `Learning ${formData.domain}`,
        isOnboardingComplete: true,
        progress: {
          currentGoal: formData.careerGoals || formData.learningGoals.join(', '),
          completionRate: 0,
        },
        completionRate: 0,
      };

      const result = await updateUser(updateData);
      
      if (result) {
        router.push('/dashboard');
      } else {
        throw new Error('Failed to update user data');
      }
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      alert('Failed to complete onboarding. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Indicator */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  s < step
                    ? 'bg-green-500'
                    : s === step
                    ? 'bg-blue-500'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-gray-600">Step {step} of 4</p>
        </div>

        {/* Step 1: User Type Selection */}
        {step === 1 && (
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-gray-200/50">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome to Sahay! 🚀
              </h1>
              <p className="text-gray-600">
                Let's personalize your learning journey. Who are you?
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {USER_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => handleUserTypeSelect(type.id)}
                  className="p-6 rounded-2xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 hover:scale-105 text-left"
                >
                  <div className="text-4xl mb-3">{type.icon}</div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {type.title}
                  </h3>
                  <p className="text-sm text-gray-600">{type.description}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Personal Information */}
        {step === 2 && (
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-gray-200/50">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Tell us your name
              </h2>
              <p className="text-gray-600">We'll use this to personalize your experience</p>
            </div>

            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <Input
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  placeholder="John"
                  className="text-lg p-4 rounded-2xl"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <Input
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Doe"
                  className="text-lg p-4 rounded-2xl"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                variant="outline"
                onClick={() => setStep(1)}
                className="px-6 py-3 rounded-2xl"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!formData.firstName}
                className="px-6 py-3 rounded-2xl bg-blue-600 text-white hover:bg-blue-700"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Domain Selection */}
        {step === 3 && (
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-gray-200/50">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                What do you want to learn?
              </h2>
              <p className="text-gray-600">Choose your primary area of interest</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
              {DOMAINS.map((domain) => (
                <button
                  key={domain}
                  onClick={() => setFormData(prev => ({ ...prev, domain }))}
                  className={`p-4 text-left rounded-2xl border-2 transition-all duration-200 ${
                    formData.domain === domain
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {domain}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <button
                variant="outline"
                onClick={() => setStep(2)}
                className="px-6 py-3 rounded-2xl"
              >
                Back
              </button>
              <button
                onClick={() => setStep(4)}
                disabled={!formData.domain}
                className="px-6 py-3 rounded-2xl bg-blue-600 text-white hover:bg-blue-700"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Learning Goals */}
        {step === 4 && (
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-gray-200/50">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                What are your goals?
              </h2>
              <p className="text-gray-600">Select all that apply</p>
            </div>

            <div className="space-y-3 mb-6">
              {LEARNING_GOALS.map((goal) => {
                const selected = formData.learningGoals.includes(goal);
                return (
                  <button
                    key={goal}
                    onClick={() => handleGoalToggle(goal)}
                    className={`w-full p-4 text-left rounded-2xl border-2 transition-all duration-200 ${
                      selected
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{goal}</span>
                      {selected && <span className="text-blue-500">✓</span>}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tell us more about your career goals (optional)
              </label>
              <textarea
                value={formData.careerGoals}
                onChange={(e) => setFormData(prev => ({ ...prev, careerGoals: e.target.value }))}
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="I want to become a full-stack developer..."
              />
            </div>

            <div className="flex items-center justify-between">
              <button
                variant="outline"
                onClick={() => setStep(3)}
                className="px-6 py-3 rounded-2xl"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={isLoading || formData.learningGoals.length === 0}
                className="px-8 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
              >
                {isLoading ? 'Setting up...' : 'Complete Setup'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


