'use client';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  variant?: 'default' | 'mood' | 'symptom' | 'cycle' | 'medication' | 'lab';
  tips?: string[];
}

const VARIANT_CONFIG = {
  default: {
    bgGradient: 'from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700',
    iconBg: 'bg-gray-200 dark:bg-gray-600',
    buttonGradient: 'from-sage-500 to-sage-400',
    defaultIcon: '📊',
    accentColor: 'sage'
  },
  mood: {
    bgGradient: 'from-sage-50 to-peach-50 dark:from-sage-900/20 dark:to-peach-900/20',
    iconBg: 'bg-sage-100 dark:bg-sage-800/40',
    buttonGradient: 'from-sage-500 to-rose-500',
    defaultIcon: '😊',
    accentColor: 'sage'
  },
  symptom: {
    bgGradient: 'from-peach-50 to-indigo-50 dark:from-peach-900/20 dark:to-indigo-900/20',
    iconBg: 'bg-peach-100 dark:bg-peach-800/40',
    buttonGradient: 'from-peach-500 to-indigo-500',
    defaultIcon: '📋',
    accentColor: 'sage'
  },
  cycle: {
    bgGradient: 'from-peach-50 to-sage-50 dark:from-peach-900/20 dark:to-sage-900/20',
    iconBg: 'bg-rose-100 dark:bg-rose-800/40',
    buttonGradient: 'from-rose-500 to-sage-500',
    defaultIcon: '📅',
    accentColor: 'rose'
  },
  medication: {
    bgGradient: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20',
    iconBg: 'bg-blue-100 dark:bg-blue-800/40',
    buttonGradient: 'from-blue-500 to-cyan-500',
    defaultIcon: '💊',
    accentColor: 'blue'
  },
  lab: {
    bgGradient: 'from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20',
    iconBg: 'bg-emerald-100 dark:bg-emerald-800/40',
    buttonGradient: 'from-emerald-500 to-teal-500',
    defaultIcon: '🔬',
    accentColor: 'emerald'
  }
};

export default function EmptyState({ 
  icon, 
  title, 
  description, 
  actionLabel, 
  onAction,
  variant = 'default',
  tips
}: EmptyStateProps) {
  const config = VARIANT_CONFIG[variant];
  const displayIcon = icon || config.defaultIcon;

  return (
    <div className={`bg-gradient-to-br ${config.bgGradient} rounded-xl p-8 text-center border border-gray-100 dark:border-gray-700`}>
      {/* Animated Icon Container */}
      <div className="relative inline-block mb-4">
        <div className={`w-20 h-20 ${config.iconBg} rounded-full flex items-center justify-center mx-auto animate-pulse-slow`}>
          <span className="text-4xl">{displayIcon}</span>
        </div>
        {/* Decorative rings */}
        <div className={`absolute inset-0 w-20 h-20 rounded-full border-2 border-${config.accentColor}-200 dark:border-${config.accentColor}-700 opacity-50 animate-ping-slow`} />
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      
      <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-sm mx-auto">
        {description}
      </p>

      {/* Tips section */}
      {tips && tips.length > 0 && (
        <div className="mb-6 text-left max-w-xs mx-auto">
          <p className="text-xs text-gray-500 dark:text-gray-500 uppercase tracking-wide mb-2">Why track this?</p>
          <ul className="space-y-1.5">
            {tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span className="text-green-500 flex-shrink-0">✓</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className={`bg-gradient-to-r ${config.buttonGradient} text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all duration-200`}
        >
          {actionLabel}
        </button>
      )}

      <style jsx>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
        @keyframes ping-slow {
          0% { transform: scale(1); opacity: 0.5; }
          75%, 100% { transform: scale(1.3); opacity: 0; }
        }
        .animate-ping-slow {
          animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>
    </div>
  );
}

// Pre-built empty states for common scenarios
export function MoodEmptyState({ onAction }: { onAction: () => void }) {
  return (
    <EmptyState
      variant="mood"
      title="Start tracking your mood"
      description="Log how you're feeling each day to discover patterns and understand what affects your wellbeing."
      actionLabel="Log Your First Mood ✨"
      onAction={onAction}
      tips={[
        "Spot patterns between your cycle and emotions",
        "Identify triggers that affect your mood",
        "Share accurate data with your doctor"
      ]}
    />
  );
}

export function SymptomEmptyState({ onAction }: { onAction: () => void }) {
  return (
    <EmptyState
      variant="symptom"
      title="Track your symptoms"
      description="Keep a record of symptoms to share with your doctor and identify triggers."
      actionLabel="Log Your First Symptom 📝"
      onAction={onAction}
      tips={[
        "See which symptoms cluster together",
        "Track severity changes over time",
        "Correlate symptoms with your cycle phase"
      ]}
    />
  );
}

export function CycleEmptyState({ onAction }: { onAction: () => void }) {
  return (
    <EmptyState
      variant="cycle"
      title="Log your period"
      description="Track your cycle to get predictions for your next period and understand your patterns."
      actionLabel="Log Your Period 📅"
      onAction={onAction}
      tips={[
        "Get predictions for your next period",
        "Identify your fertile window",
        "Understand your unique cycle patterns"
      ]}
    />
  );
}

export function MedicationEmptyState({ onAction }: { onAction: () => void }) {
  return (
    <EmptyState
      variant="medication"
      title="Add your medications"
      description="Keep track of your medications, supplements, and treatments to monitor what's working."
      actionLabel="Add Medication 💊"
      onAction={onAction}
      tips={[
        "Track effectiveness over time",
        "Log side effects to discuss with your doctor",
        "See mood/symptom changes since starting"
      ]}
    />
  );
}

export function LabEmptyState({ onAction }: { onAction: () => void }) {
  return (
    <EmptyState
      variant="lab"
      title="Track your lab results"
      description="Store your lab results to monitor trends over time and share with your healthcare team."
      actionLabel="Add Lab Result 🔬"
      onAction={onAction}
      tips={[
        "Visualize hormone trends over time",
        "Flag abnormal values automatically",
        "Generate reports for doctor visits"
      ]}
    />
  );
}

