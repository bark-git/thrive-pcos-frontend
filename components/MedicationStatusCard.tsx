'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

interface Medication {
  id: string;
  name: string;
  dosage: string | null;
  frequency: string | null;
}

export default function MedicationStatusCard() {
  const [activeMeds, setActiveMeds] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMedications();
  }, []);

  const fetchMedications = async () => {
    try {
      const res = await api.get('/medications');
      setActiveMeds(res.data.active || []);
    } catch (error) {
      console.error('Error loading medications:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Active Medications</h3>
        <a 
          href="/medications" 
          className="text-pink-600 hover:text-pink-700 text-sm font-medium transition"
        >
          Manage →
        </a>
      </div>

      {activeMeds.length === 0 ? (
        <div className="text-center py-4">
          <div className="text-gray-400 mb-2">
            <svg className="w-10 h-10 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-gray-500 text-sm">No active medications</p>
          <a 
            href="/medications" 
            className="text-pink-600 hover:text-pink-700 text-sm font-medium mt-2 inline-block"
          >
            Add medication
          </a>
        </div>
      ) : (
        <div className="space-y-3">
          {activeMeds.slice(0, 4).map((med) => (
            <div key={med.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <div>
                <div className="font-medium text-gray-900">{med.name}</div>
                <div className="text-sm text-gray-500">
                  {[med.dosage, med.frequency].filter(Boolean).join(' • ') || 'No details'}
                </div>
              </div>
              <div className="w-2 h-2 bg-green-500 rounded-full" title="Active"></div>
            </div>
          ))}
          {activeMeds.length > 4 && (
            <div className="text-center pt-2">
              <a 
                href="/medications" 
                className="text-pink-600 hover:text-pink-700 text-sm font-medium"
              >
                +{activeMeds.length - 4} more
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
