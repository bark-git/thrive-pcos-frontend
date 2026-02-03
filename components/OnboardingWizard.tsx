'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface OnboardingData {
  diagnosisStatus: string;
  diagnosisDate: string;
  phenotype: string;
  primaryConcerns: string[];
  goals: string[];
}

const PRIMARY_CONCERNS = [
  { id: 'irregular_periods', label: 'Irregular periods', icon: '📅' },
  { id: 'fertility', label: 'Fertility / Trying to conceive', icon: '👶' },
  { id: 'weight', label: 'Weight management', icon: '⚖️' },
  { id: 'acne', label: 'Acne / Skin issues', icon: '✨' },
  { id: 'hair_loss', label: 'Hair loss', icon: '💇' },
  { id: 'excess_hair', label: 'Excess hair growth', icon: '🪒' },
  { id: 'fatigue', label: 'Fatigue / Low energy', icon: '😴' },
  { id: 'mood', label: 'Mood / Mental health', icon: '🧠' },
  { id: 'insulin_resistance', label: 'Insulin resistance', icon: '🩸' },
  { id: 'sleep', label: 'Sleep issues', icon: '🌙' },
];

const GOALS = [
  { id: 'track_symptoms', label: 'Track symptoms for doctor visits', icon: '📋' },
  { id: 'understand_patterns', label: 'Understand my patterns', icon: '📊' },
  { id: 'improve_mental_health', label: 'Improve mental health', icon: '💜' },
  { id: 'manage_weight', label: 'Manage weight', icon: '🏃' },
  { id: 'prepare_pregnancy', label: 'Prepare for pregnancy', icon: '🤰' },
  { id: 'reduce_symptoms', label: 'Reduce symptoms naturally', icon: '🌿' },
  { id: 'medication_tracking', label: 'Track medication effectiveness', icon: '💊' },
  { id: 'cycle_prediction', label: 'Predict my cycles', icon: '🔮' },
];

const PHENOTYPE_QUESTIONS = [
  {
    id: 'q1',
    question: 'Do you have irregular or absent periods?',
    options: ['Yes, often', 'Sometimes', 'No, fairly regular']
  },
  {
    id: 'q2',
    question: 'Have you been told you have elevated androgens (testosterone, DHEA-S)?',
    options: ['Yes', 'Not sure', 'No']
  },
  {
    id: 'q3',
    question: 'Do you have symptoms of high androgens (acne, excess hair, hair loss)?',
    options: ['Yes, multiple', 'One or two mild', 'No']
  },
  {
    id: 'q4',
    question: 'Have you had an ultrasound showing polycystic ovaries?',
    options: ['Yes', 'Not sure / Not tested', 'No']
  },
];

export default function OnboardingWizard({ onComplete }: { onComplete: () => void }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPhenotypeQuiz, setShowPhenotypeQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  
  const [data, setData] = useState<OnboardingData>({
    diagnosisStatus: '',
    diagnosisDate: '',
    phenotype: '',
    primaryConcerns: [],
    goals: [],
  });

  const totalSteps = 4;

  const handleSkip = async () => {
    // Save whatever data we have and complete
    await saveAndComplete();
  };

  const saveAndComplete = async () => {
    setLoading(true);
    try {
      await api.post('/auth/complete-onboarding', data);
      onComplete();
    } catch (error) {
      console.error('Error saving onboarding:', error);
      // Still complete even if save fails
      onComplete();
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      saveAndComplete();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const toggleConcern = (id: string) => {
    setData(prev => ({
      ...prev,
      primaryConcerns: prev.primaryConcerns.includes(id)
        ? prev.primaryConcerns.filter(c => c !== id)
        : [...prev.primaryConcerns, id]
    }));
  };

  const toggleGoal = (id: string) => {
    setData(prev => ({
      ...prev,
      goals: prev.goals.includes(id)
        ? prev.goals.filter(g => g !== id)
        : [...prev.goals, id]
    }));
  };

  const calculatePhenotype = () => {
    // Simple phenotype calculation based on Rotterdam criteria
    // Type A: Irregular periods + High androgens + Polycystic ovaries
    // Type B: Irregular periods + High androgens (no PCO)
    // Type C: High androgens + Polycystic ovaries (regular periods)
    // Type D: Irregular periods + Polycystic ovaries (no high androgens)
    
    const irregular = quizAnswers.q1 === 0; // "Yes, often"
    const highAndrogens = quizAnswers.q2 === 0 || quizAnswers.q3 === 0;
    const pco = quizAnswers.q4 === 0;

    let phenotype = '';
    if (irregular && highAndrogens && pco) phenotype = 'A';
    else if (irregular && highAndrogens && !pco) phenotype = 'B';
    else if (!irregular && highAndrogens && pco) phenotype = 'C';
    else if (irregular && !highAndrogens && pco) phenotype = 'D';
    else phenotype = 'UNKNOWN';

    setData(prev => ({ ...prev, phenotype }));
    setShowPhenotypeQuiz(false);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Thrive PCOS! 🌸</h2>
              <p className="text-gray-600">Let's personalize your experience. First, tell us about your diagnosis.</p>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What's your PCOS diagnosis status?
              </label>
              {[
                { value: 'CONFIRMED', label: 'Confirmed diagnosis', desc: 'Diagnosed by a healthcare provider' },
                { value: 'SUSPECTED', label: 'Suspected / Self-diagnosed', desc: 'Experiencing symptoms but not officially diagnosed' },
                { value: 'UNSURE', label: 'Not sure yet', desc: 'Still figuring things out' },
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => setData({ ...data, diagnosisStatus: option.value })}
                  className={`w-full p-4 rounded-xl border-2 text-left transition ${
                    data.diagnosisStatus === option.value
                      ? 'border-pink-500 bg-pink-50'
                      : 'border-gray-200 hover:border-pink-300'
                  }`}
                >
                  <div className="font-medium text-gray-900">{option.label}</div>
                  <div className="text-sm text-gray-500">{option.desc}</div>
                </button>
              ))}
            </div>

            {data.diagnosisStatus === 'CONFIRMED' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  When were you diagnosed? (optional)
                </label>
                <input
                  type="date"
                  value={data.diagnosisDate}
                  onChange={(e) => setData({ ...data, diagnosisDate: e.target.value })}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 text-gray-900"
                />
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">PCOS Phenotype</h2>
              <p className="text-gray-600">Understanding your phenotype helps us provide personalized insights.</p>
            </div>

            {!showPhenotypeQuiz ? (
              <div className="space-y-3">
                <button
                  onClick={() => setData({ ...data, phenotype: 'A' })}
                  className={`w-full p-4 rounded-xl border-2 text-left transition ${
                    data.phenotype === 'A' ? 'border-pink-500 bg-pink-50' : 'border-gray-200 hover:border-pink-300'
                  }`}
                >
                  <div className="font-medium text-gray-900">Type A (Classic)</div>
                  <div className="text-sm text-gray-500">Irregular periods + high androgens + polycystic ovaries</div>
                </button>
                <button
                  onClick={() => setData({ ...data, phenotype: 'B' })}
                  className={`w-full p-4 rounded-xl border-2 text-left transition ${
                    data.phenotype === 'B' ? 'border-pink-500 bg-pink-50' : 'border-gray-200 hover:border-pink-300'
                  }`}
                >
                  <div className="font-medium text-gray-900">Type B (Non-PCO)</div>
                  <div className="text-sm text-gray-500">Irregular periods + high androgens (no polycystic ovaries)</div>
                </button>
                <button
                  onClick={() => setData({ ...data, phenotype: 'C' })}
                  className={`w-full p-4 rounded-xl border-2 text-left transition ${
                    data.phenotype === 'C' ? 'border-pink-500 bg-pink-50' : 'border-gray-200 hover:border-pink-300'
                  }`}
                >
                  <div className="font-medium text-gray-900">Type C (Ovulatory)</div>
                  <div className="text-sm text-gray-500">Regular periods + high androgens + polycystic ovaries</div>
                </button>
                <button
                  onClick={() => setData({ ...data, phenotype: 'D' })}
                  className={`w-full p-4 rounded-xl border-2 text-left transition ${
                    data.phenotype === 'D' ? 'border-pink-500 bg-pink-50' : 'border-gray-200 hover:border-pink-300'
                  }`}
                >
                  <div className="font-medium text-gray-900">Type D (Non-Hyperandrogenic)</div>
                  <div className="text-sm text-gray-500">Irregular periods + polycystic ovaries (no high androgens)</div>
                </button>

                <div className="border-t border-gray-200 pt-4 mt-4">
                  <button
                    onClick={() => setShowPhenotypeQuiz(true)}
                    className="w-full p-4 rounded-xl border-2 border-purple-200 bg-purple-50 text-left hover:border-purple-400 transition"
                  >
                    <div className="font-medium text-purple-700">🔮 Not sure? Take a quick quiz</div>
                    <div className="text-sm text-purple-600">Answer a few questions to help determine your type</div>
                  </button>
                  <button
                    onClick={() => {
                      setData({ ...data, phenotype: 'SKIP' });
                      handleNext();
                    }}
                    className="w-full mt-2 text-gray-500 text-sm hover:text-gray-700"
                  >
                    Skip this step
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {PHENOTYPE_QUESTIONS.map((q, idx) => (
                  <div key={q.id}>
                    <div className="font-medium text-gray-900 mb-3">{idx + 1}. {q.question}</div>
                    <div className="space-y-2">
                      {q.options.map((option, optIdx) => (
                        <button
                          key={optIdx}
                          onClick={() => setQuizAnswers({ ...quizAnswers, [q.id]: optIdx })}
                          className={`w-full p-3 rounded-lg border-2 text-left transition ${
                            quizAnswers[q.id] === optIdx
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-gray-200 hover:border-purple-300'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowPhenotypeQuiz(false)}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition"
                  >
                    Back
                  </button>
                  <button
                    onClick={calculatePhenotype}
                    disabled={Object.keys(quizAnswers).length < 4}
                    className="flex-1 px-4 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition disabled:opacity-50"
                  >
                    See My Type
                  </button>
                </div>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">What concerns you most?</h2>
              <p className="text-gray-600">Select all that apply. This helps us personalize your dashboard.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {PRIMARY_CONCERNS.map(concern => (
                <button
                  key={concern.id}
                  onClick={() => toggleConcern(concern.id)}
                  className={`p-4 rounded-xl border-2 text-left transition ${
                    data.primaryConcerns.includes(concern.id)
                      ? 'border-pink-500 bg-pink-50'
                      : 'border-gray-200 hover:border-pink-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{concern.icon}</div>
                  <div className="text-sm font-medium text-gray-900">{concern.label}</div>
                </button>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">What are your goals?</h2>
              <p className="text-gray-600">Select all that apply. You can always change these later.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {GOALS.map(goal => (
                <button
                  key={goal.id}
                  onClick={() => toggleGoal(goal.id)}
                  className={`p-4 rounded-xl border-2 text-left transition ${
                    data.goals.includes(goal.id)
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{goal.icon}</div>
                  <div className="text-sm font-medium text-gray-900">{goal.label}</div>
                </button>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-white flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>Step {step} of {totalSteps}</span>
            <button onClick={handleSkip} className="text-pink-600 hover:text-pink-700">
              Skip for now
            </button>
          </div>
          <div className="h-2 bg-gray-200 rounded-full">
            <div 
              className="h-full bg-gradient-to-r from-pink-500 to-purple-600 rounded-full transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          {renderStep()}

          {/* Navigation Buttons */}
          {!showPhenotypeQuiz && (
            <div className="flex gap-3 mt-8">
              {step > 1 && (
                <button
                  onClick={handleBack}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition"
                >
                  Back
                </button>
              )}
              <button
                onClick={handleNext}
                disabled={loading || (step === 1 && !data.diagnosisStatus)}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-medium hover:from-pink-600 hover:to-purple-700 transition disabled:opacity-50"
              >
                {loading ? 'Saving...' : step === totalSteps ? 'Get Started! 🎉' : 'Continue'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
