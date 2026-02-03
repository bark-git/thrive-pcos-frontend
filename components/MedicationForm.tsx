'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

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

interface MedicationFormProps {
  onClose: () => void;
  onSuccess: () => void;
  editMedication?: Medication | null;
}

const COMMON_MEDICATIONS = [
  'Metformin',
  'Spironolactone',
  'Birth Control Pills',
  'Letrozole',
  'Clomid (Clomiphene)',
  'Inositol',
  'Vitamin D',
  'Berberine',
  'Ozempic',
  'Other'
];

const FREQUENCIES = [
  'Once daily',
  'Twice daily',
  'Three times daily',
  'Once weekly',
  'As needed',
  'Other'
];

export default function MedicationForm({ onClose, onSuccess, editMedication }: MedicationFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    customName: '',
    dosage: '',
    frequency: '',
    customFrequency: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    effectivenessRating: 0,
    sideEffects: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editMedication) {
      const isCommonMed = COMMON_MEDICATIONS.includes(editMedication.name);
      const isCommonFreq = FREQUENCIES.includes(editMedication.frequency || '');
      
      setFormData({
        name: isCommonMed ? editMedication.name : 'Other',
        customName: isCommonMed ? '' : editMedication.name,
        dosage: editMedication.dosage || '',
        frequency: isCommonFreq ? (editMedication.frequency || '') : 'Other',
        customFrequency: isCommonFreq ? '' : (editMedication.frequency || ''),
        startDate: editMedication.startDate.split('T')[0],
        endDate: editMedication.endDate ? editMedication.endDate.split('T')[0] : '',
        effectivenessRating: editMedication.effectivenessRating || 0,
        sideEffects: editMedication.sideEffects || '',
        notes: editMedication.notes || ''
      });
    }
  }, [editMedication]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const medicationName = formData.name === 'Other' ? formData.customName : formData.name;
    const medicationFrequency = formData.frequency === 'Other' ? formData.customFrequency : formData.frequency;

    if (!medicationName.trim()) {
      setError('Please enter a medication name');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        name: medicationName,
        dosage: formData.dosage || undefined,
        frequency: medicationFrequency || undefined,
        startDate: formData.startDate,
        endDate: formData.endDate || undefined,
        effectivenessRating: formData.effectivenessRating > 0 ? formData.effectivenessRating : undefined,
        sideEffects: formData.sideEffects || undefined,
        notes: formData.notes || undefined
      };

      if (editMedication) {
        await api.put(`/medications/${editMedication.id}`, payload);
      } else {
        await api.post('/medications', payload);
      }
      
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save medication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            {editMedication ? 'Edit Medication' : 'Add Medication'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Medication Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Medication Name *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-2">
              {COMMON_MEDICATIONS.map((med) => (
                <button
                  key={med}
                  type="button"
                  onClick={() => setFormData({ ...formData, name: med })}
                  className={`px-3 py-2 rounded-lg border text-sm transition text-gray-900 ${
                    formData.name === med
                      ? 'border-pink-500 bg-pink-50 font-medium'
                      : 'border-gray-200 hover:border-pink-300'
                  }`}
                >
                  {med}
                </button>
              ))}
            </div>
            {formData.name === 'Other' && (
              <input
                type="text"
                value={formData.customName}
                onChange={(e) => setFormData({ ...formData, customName: e.target.value })}
                placeholder="Enter medication name"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-pink-500 text-gray-900"
              />
            )}
          </div>

          {/* Dosage and Frequency */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dosage
              </label>
              <input
                type="text"
                value={formData.dosage}
                onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                placeholder="e.g., 500mg, 25mg"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-pink-500 text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Frequency
              </label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-pink-500 text-gray-900"
              >
                <option value="">Select frequency</option>
                {FREQUENCIES.map((freq) => (
                  <option key={freq} value={freq}>{freq}</option>
                ))}
              </select>
              {formData.frequency === 'Other' && (
                <input
                  type="text"
                  value={formData.customFrequency}
                  onChange={(e) => setFormData({ ...formData, customFrequency: e.target.value })}
                  placeholder="Enter frequency"
                  className="w-full mt-2 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-pink-500 text-gray-900"
                />
              )}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date *
              </label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-pink-500 text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date (leave blank if ongoing)
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                min={formData.startDate}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-pink-500 text-gray-900"
              />
            </div>
          </div>

          {/* Effectiveness Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Effectiveness Rating
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => setFormData({ 
                    ...formData, 
                    effectivenessRating: formData.effectivenessRating === rating ? 0 : rating 
                  })}
                  className={`w-12 h-12 rounded-lg border-2 transition text-xl ${
                    formData.effectivenessRating >= rating
                      ? 'border-yellow-400 bg-yellow-50 text-yellow-500'
                      : 'border-gray-200 hover:border-yellow-300 text-gray-300'
                  }`}
                >
                  ★
                </button>
              ))}
              <span className="flex items-center ml-2 text-sm text-gray-600">
                {formData.effectivenessRating > 0 ? `${formData.effectivenessRating}/5` : 'Not rated'}
              </span>
            </div>
          </div>

          {/* Side Effects */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Side Effects
            </label>
            <textarea
              value={formData.sideEffects}
              onChange={(e) => setFormData({ ...formData, sideEffects: e.target.value })}
              placeholder="Any side effects you've experienced..."
              rows={2}
              maxLength={500}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-pink-500 text-gray-900"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional notes..."
              rows={2}
              maxLength={1000}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-pink-500 text-gray-900"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition font-medium disabled:opacity-50"
            >
              {loading ? 'Saving...' : editMedication ? 'Update' : 'Add Medication'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
