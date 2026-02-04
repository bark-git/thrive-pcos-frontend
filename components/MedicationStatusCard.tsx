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
        <div className="text-center py-6">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">💊</span>
          </div>
          <p className="text-gray-900 font-medium mb-1">No medications tracked</p>
          <p className="text-gray-500 text-sm mb-4">
            Track your medications and supplements to monitor effectiveness
          </p>
          <a 
            href="/medications" 
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg text-sm font-medium hover:shadow-lg transition"
          >
            <span>+</span>
            <span>Add Medication</span>
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
