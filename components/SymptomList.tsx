'use client';

import { format } from 'date-fns';

const SEVERITY_EMOJI = ['', '😊', '😐', '😟', '😢', '😭'];

interface SymptomListProps {
  symptoms: any[];
  onUpdate: () => void;
}

export default function SymptomList({ symptoms, onUpdate }: SymptomListProps) {
  const formatSymptomType = (type: string) => {
    return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  if (symptoms.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-12 text-center">
        <div className="text-6xl mb-4">📝</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No symptoms logged yet</h3>
        <p className="text-gray-600">
          Start tracking your PCOS symptoms to identify patterns and trends.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Recent Symptoms</h3>
      </div>

      <div className="divide-y divide-gray-200">
        {symptoms.map((symptom) => (
          <div key={symptom.id} className="px-6 py-4 hover:bg-gray-50 transition">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-2xl">{SEVERITY_EMOJI[symptom.severity]}</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {symptom.symptomType === 'OTHER' && symptom.otherSymptom
                        ? symptom.otherSymptom
                        : formatSymptomType(symptom.symptomType)}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {format(new Date(symptom.date), 'MMMM d, yyyy · h:mm a')}
                    </p>
                  </div>
                </div>

                <div className="ml-11 space-y-1">
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="text-gray-600">
                      Severity: <span className="font-medium text-gray-900">{symptom.severity}/5</span>
                    </span>
                    {symptom.location && (
                      <span className="text-gray-600">
                        Location: <span className="font-medium text-gray-900">{symptom.location}</span>
                      </span>
                    )}
                  </div>

                  {symptom.notes && (
                    <p className="text-sm text-gray-700 mt-2 p-2 bg-gray-50 rounded">
                      {symptom.notes}
                    </p>
                  )}
                </div>
              </div>

              {/* You can add edit/delete buttons here later */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
