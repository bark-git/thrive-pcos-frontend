'use client';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  variant?: 'default' | 'mood' | 'symptom' | 'cycle' | 'medication' | 'lab';
}

const VARIANT_CONFIG = {
  default: {
    bgGradient: 'from-gray-50 to-gray-100',
    iconBg: 'bg-gray-200',
    buttonGradient: 'from-pink-500 to-purple-600',
    defaultIcon: '📊'
  },
  mood: {
    bgGradient: 'from-pink-50 to-rose-50',
    iconBg: 'bg-pink-100',
    buttonGradient: 'from-pink-500 to-rose-500',
    defaultIcon: '😊'
  },
  symptom: {
    bgGradient: 'from-purple-50 to-indigo-50',
    iconBg: 'bg-purple-100',
    buttonGradient: 'from-purple-500 to-indigo-500',
    defaultIcon: '📋'
  },
  cycle: {
    bgGradient: 'from-rose-50 to-pink-50',
    iconBg: 'bg-rose-100',
    buttonGradient: 'from-rose-500 to-pink-500',
    defaultIcon: '📅'
  },
  medication: {
    bgGradient: 'from-blue-50 to-cyan-50',
    iconBg: 'bg-blue-100',
    buttonGradient: 'from-blue-500 to-cyan-500',
    defaultIcon: '💊'
  },
  lab: {
    bgGradient: 'from-emerald-50 to-teal-50',
    iconBg: 'bg-emerald-100',
    buttonGradient: 'from-emerald-500 to-teal-500',
    defaultIcon: '🔬'
  }
};

export default function EmptyState({ 
  icon, 
  title, 
  description, 
  actionLabel, 
  onAction,
  variant = 'default'
}: EmptyStateProps) {
  const config = VARIANT_CONFIG[variant];
  const displayIcon = icon || config.defaultIcon;

  return (
    <div className={`bg-gradient-to-br ${config.bgGradient} rounded-xl p-8 text-center`}>
      <div className={`w-16 h-16 ${config.iconBg} rounded-full flex items-center justify-center mx-auto mb-4`}>
        <span className="text-3xl">{displayIcon}</span>
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      
      <p className="text-gray-600 mb-6 max-w-sm mx-auto">
        {description}
      </p>
      
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className={`bg-gradient-to-r ${config.buttonGradient} text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition`}
        >
          {actionLabel}
        </button>
      )}
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
      actionLabel="Log Your First Mood"
      onAction={onAction}
    />
  );
}

export function SymptomEmptyState({ onAction }: { onAction: () => void }) {
  return (
    <EmptyState
      variant="symptom"
      title="Track your symptoms"
      description="Keep a record of symptoms to share with your doctor and identify triggers."
      actionLabel="Log Your First Symptom"
      onAction={onAction}
    />
  );
}

export function CycleEmptyState({ onAction }: { onAction: () => void }) {
  return (
    <EmptyState
      variant="cycle"
      title="Log your period"
      description="Track your cycle to get predictions for your next period and understand your patterns."
      actionLabel="Log Your Period"
      onAction={onAction}
    />
  );
}

export function MedicationEmptyState({ onAction }: { onAction: () => void }) {
  return (
    <EmptyState
      variant="medication"
      title="Add your medications"
      description="Keep track of your medications, supplements, and treatments to monitor what's working."
      actionLabel="Add Medication"
      onAction={onAction}
    />
  );
}

export function LabEmptyState({ onAction }: { onAction: () => void }) {
  return (
    <EmptyState
      variant="lab"
      title="Track your lab results"
      description="Store your lab results to monitor trends over time and share with your healthcare team."
      actionLabel="Add Lab Result"
      onAction={onAction}
    />
  );
}
