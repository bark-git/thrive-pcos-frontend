'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { symptom as symptomApi } from '@/lib/api';

const SEVERITY_EMOJI = ['', '😊', '😐', '😟', '😢', '😭'];

interface Symptom {
  id: string;
  symptomType: string;
  severity: number;
  location?: string;
  notes?: string;
  otherSymptom?: string;
  date: string;
}

interface SymptomListProps {
  symptoms: Symptom[];
  onUpdate: () => void;
  onEdit?: (symptom: Symptom) => void;
}

export default function SymptomList({ symptoms, onUpdate, onEdit }: SymptomListProps) {
  const [deletingSymptom, setDeletingSymptom] = useState<Symptom | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const formatSymptomType = (type: string) => {
    return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const handleDelete = async () => {
    if (!deletingSymptom) return;
    
    setDeleteLoading(true);
    try {
      await symptomApi.delete(deletingSymptom.id);
      setDeletingSymptom(null);
      onUpdate();
    } catch (error) {
      console.error('Error deleting symptom:', error);
    } finally {
      setDeleteLoading(false);
    }
  };

  if (symptoms.length === 0) {
    return null; // Parent handles empty state
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Symptoms</h3>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {symptoms.map((symptom) => (
            <div key={symptom.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-2xl">{SEVERITY_EMOJI[symptom.severity]}</span>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {symptom.symptomType === 'OTHER' && symptom.otherSymptom
                          ? symptom.otherSymptom
                          : formatSymptomType(symptom.symptomType)}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {format(new Date(symptom.date), 'MMMM d, yyyy · h:mm a')}
                      </p>
                    </div>
                  </div>

                  <div className="ml-11 space-y-1">
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Severity: <span className="font-medium text-gray-900 dark:text-white">{symptom.severity}/5</span>
                      </span>
                      {symptom.location && (
                        <span className="text-gray-600 dark:text-gray-400">
                          Location: <span className="font-medium text-gray-900 dark:text-white">{symptom.location}</span>
                        </span>
                      )}
                    </div>

                    {symptom.notes && (
                      <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                        {symptom.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Edit/Delete Buttons */}
                <div className="flex gap-2 ml-4">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(symptom)}
                      className="p-2 text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition"
                      title="Edit"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  )}
                  <button
                    onClick={() => setDeletingSymptom(symptom)}
                    className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition"
                    title="Delete"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deletingSymptom && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Delete Symptom Entry?</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete this{' '}
              <strong className="text-gray-900 dark:text-white">
                {deletingSymptom.symptomType === 'OTHER' && deletingSymptom.otherSymptom
                  ? deletingSymptom.otherSymptom
                  : formatSymptomType(deletingSymptom.symptomType)}
              </strong>{' '}
              entry from {format(new Date(deletingSymptom.date), 'MMMM d')}?
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingSymptom(null)}
                className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium disabled:opacity-50"
              >
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
