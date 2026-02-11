'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api, { auth } from '@/lib/api';
import Header from '@/components/Header';
import MedicationForm from '@/components/MedicationForm';

interface Medication {
  id: string;
  name: string;
  dosage: string | null;
  frequency: string | null;
  startDate: string;
  endDate: string | null;
  effectivenessRating: number | null;
  sideEffects: string | null;
  notes: string | null;
}

export default function MedicationsPage() {
  const router = useRouter();
  const [user, setUser] = useState(auth.getUser());
  const [medications, setMedications] = useState<Medication[]>([]);
  const [activeMeds, setActiveMeds] = useState<Medication[]>([]);
  const [endedMeds, setEndedMeds] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMed, setEditingMed] = useState<Medication | null>(null);
  const [deletingMed, setDeletingMed] = useState<Medication | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showEnded, setShowEnded] = useState(false);
  
  // End medication modal state
  const [endingMed, setEndingMed] = useState<Medication | null>(null);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [endLoading, setEndLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }
    fetchMedications();
  }, [user, router]);

  const fetchMedications = async () => {
    try {
      const res = await api.get('/medications');
      setMedications(res.data.medications);
      setActiveMeds(res.data.active);
      setEndedMeds(res.data.ended);
    } catch (error) {
      console.error('Error loading medications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSuccess = () => {
    fetchMedications();
  };

  const handleDelete = async () => {
    if (!deletingMed) return;
    
    setDeleteLoading(true);
    try {
      await api.delete(`/medications/${deletingMed.id}`);
      setDeletingMed(null);
      fetchMedications();
    } catch (error) {
      console.error('Error deleting medication:', error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleEndMedication = async () => {
    if (!endingMed) return;
    
    setEndLoading(true);
    try {
      await api.put(`/medications/${endingMed.id}`, {
        endDate: endDate
      });
      setEndingMed(null);
      setEndDate(new Date().toISOString().split('T')[0]);
      fetchMedications();
    } catch (error) {
      console.error('Error ending medication:', error);
    } finally {
      setEndLoading(false);
    }
  };

  const handleResumeMedication = async (med: Medication) => {
    try {
      await api.put(`/medications/${med.id}`, {
        endDate: null
      });
      fetchMedications();
    } catch (error) {
      console.error('Error resuming medication:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDurationText = (startDate: string, endDate: string | null) => {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    const days = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    if (days < 7) return `${days} day${days !== 1 ? 's' : ''}`;
    if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) !== 1 ? 's' : ''}`;
    if (days < 365) return `${Math.floor(days / 30)} month${Math.floor(days / 30) !== 1 ? 's' : ''}`;
    return `${Math.floor(days / 365)} year${Math.floor(days / 365) !== 1 ? 's' : ''}`;
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-ivory via-sage-50 to-peach-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory via-sage-50 to-peach-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header currentPage="medications" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Medications</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Track your medications and supplements</p>
          </div>
          <button
            onClick={() => {
              setEditingMed(null);
              setShowForm(true);
            }}
            className="bg-gradient-to-r from-sage-500 to-sage-400 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition inline-flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Medication
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
            <div className="text-3xl font-bold text-sage-600">{activeMeds.length}</div>
            <div className="text-gray-600 dark:text-gray-400 text-sm">Active</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
            <div className="text-3xl font-bold text-gray-600 dark:text-gray-400">{endedMeds.length}</div>
            <div className="text-gray-600 dark:text-gray-400 text-sm">Ended</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
            <div className="text-3xl font-bold text-peach-600">{medications.length}</div>
            <div className="text-gray-600 dark:text-gray-400 text-sm">Total</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
            <div className="text-3xl font-bold text-yellow-500">
              {medications.filter(m => m.effectivenessRating).length > 0
                ? (medications.filter(m => m.effectivenessRating).reduce((sum, m) => sum + (m.effectivenessRating || 0), 0) / medications.filter(m => m.effectivenessRating).length).toFixed(1)
                : '-'}
            </div>
            <div className="text-gray-600 dark:text-gray-400 text-sm">Avg Rating</div>
          </div>
        </div>

        {/* Active Medications */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
            Active Medications ({activeMeds.length})
          </h3>
          
          {activeMeds.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p>No active medications</p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-3 text-sage-600 hover:text-sage-700 font-medium"
              >
                Add your first medication
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {activeMeds.map((med) => (
                <div key={med.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-sage-300 dark:hover:border-sage-600 transition">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h4 className="font-semibold text-gray-900 dark:text-white text-lg">{med.name}</h4>
                        {med.dosage && (
                          <span className="px-2 py-1 bg-sage-100 dark:bg-sage-900/40 text-sage-700 dark:text-sage-300 rounded text-sm">
                            {med.dosage}
                          </span>
                        )}
                        {med.frequency && (
                          <span className="px-2 py-1 bg-peach-100 dark:bg-peach-900/40 text-peach-700 dark:text-peach-300 rounded text-sm">
                            {med.frequency}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Started {formatDate(med.startDate)} • {getDurationText(med.startDate, null)}
                      </div>
                      {med.effectivenessRating && (
                        <div className="flex items-center gap-1 mt-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              className={star <= med.effectivenessRating! ? 'text-yellow-500' : 'text-gray-300 dark:text-gray-600'}
                            >
                              ★
                            </span>
                          ))}
                          <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">Effectiveness</span>
                        </div>
                      )}
                      {med.sideEffects && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                          <span className="font-medium">Side effects:</span> {med.sideEffects}
                        </p>
                      )}
                      {med.notes && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          <span className="font-medium">Notes:</span> {med.notes}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEndingMed(med);
                          setEndDate(new Date().toISOString().split('T')[0]);
                        }}
                        className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/30 rounded-lg transition"
                        title="End medication"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => {
                          setEditingMed(med);
                          setShowForm(true);
                        }}
                        className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition"
                        title="Edit"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setDeletingMed(med)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition"
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
          )}
        </div>

        {/* Past Medications */}
        {endedMeds.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <button
              onClick={() => setShowEnded(!showEnded)}
              className="w-full flex items-center justify-between text-left"
            >
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <span className="w-3 h-3 bg-gray-400 rounded-full"></span>
                Past Medications ({endedMeds.length})
              </h3>
              <svg
                className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform ${showEnded ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showEnded && (
              <div className="space-y-4 mt-4">
                {endedMeds.map((med) => (
                  <div key={med.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex-1 opacity-75">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h4 className="font-semibold text-gray-700 dark:text-gray-300 text-lg">{med.name}</h4>
                          {med.dosage && (
                            <span className="px-2 py-1 bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded text-sm">
                              {med.dosage}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {formatDate(med.startDate)} - {med.endDate ? formatDate(med.endDate) : 'Present'} 
                          • {getDurationText(med.startDate, med.endDate)}
                        </div>
                        {med.effectivenessRating && (
                          <div className="flex items-center gap-1 mt-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span
                                key={star}
                                className={star <= med.effectivenessRating! ? 'text-yellow-500' : 'text-gray-300 dark:text-gray-600'}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                        )}
                        {med.sideEffects && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                            <span className="font-medium">Side effects:</span> {med.sideEffects}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleResumeMedication(med)}
                          className="p-2 text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition"
                          title="Resume medication"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => {
                            setEditingMed(med);
                            setShowForm(true);
                          }}
                          className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition"
                          title="Edit"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setDeletingMed(med)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition"
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
            )}
          </div>
        )}
      </main>

      {/* Medication Form Modal */}
      {showForm && (
        <MedicationForm
          onClose={() => {
            setShowForm(false);
            setEditingMed(null);
          }}
          onSuccess={handleFormSuccess}
          editMedication={editingMed}
        />
      )}

      {/* End Medication Modal */}
      {endingMed && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">End Medication</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              When did you stop taking <strong className="text-gray-900 dark:text-white">{endingMed.name}</strong>?
            </p>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                min={endingMed.startDate.split('T')[0]}
                className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-sage-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setEndingMed(null);
                  setEndDate(new Date().toISOString().split('T')[0]);
                }}
                className="flex-1 px-4 py-2 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleEndMedication}
                disabled={endLoading}
                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-medium disabled:opacity-50"
              >
                {endLoading ? 'Saving...' : 'End Medication'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingMed && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Delete Medication</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete <strong className="text-gray-900 dark:text-white">{deletingMed.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingMed(null)}
                className="flex-1 px-4 py-2 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium disabled:opacity-50"
              >
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
