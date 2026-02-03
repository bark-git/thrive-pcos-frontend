'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

interface LabTest {
  code: string;
  name: string;
  category: string;
  unit: string;
  refRangeLow: number;
  refRangeHigh: number;
  description?: string;
}

interface LabResult {
  id: string;
  testDate: string;
  testName: string;
  testCode: string | null;
  value: number;
  unit: string | null;
  refRangeLow: number | null;
  refRangeHigh: number | null;
  referenceRange: string | null;
  flagStatus: string;
  category: string | null;
  labName: string | null;
  notes: string | null;
}

interface LabFormProps {
  onClose: () => void;
  onSuccess: () => void;
  editResult?: LabResult | null;
}

const CATEGORIES = [
  { value: 'HORMONES', label: 'Hormones' },
  { value: 'METABOLIC', label: 'Metabolic' },
  { value: 'THYROID', label: 'Thyroid' },
  { value: 'VITAMINS', label: 'Vitamins & Minerals' },
  { value: 'LIPIDS', label: 'Lipids' },
  { value: 'OTHER', label: 'Other' }
];

export default function LabForm({ onClose, onSuccess, editResult }: LabFormProps) {
  const [commonTests, setCommonTests] = useState<LabTest[]>([]);
  const [testsByCategory, setTestsByCategory] = useState<Record<string, LabTest[]>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('HORMONES');
  const [isCustomTest, setIsCustomTest] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    testDate: new Date().toISOString().split('T')[0],
    testCode: '',
    testName: '',
    value: '',
    unit: '',
    refRangeLow: '',
    refRangeHigh: '',
    category: 'HORMONES',
    labName: '',
    notes: '',
    flagStatus: ''
  });

  useEffect(() => {
    fetchCommonTests();
  }, []);

  useEffect(() => {
    if (editResult) {
      setFormData({
        testDate: editResult.testDate.split('T')[0],
        testCode: editResult.testCode || '',
        testName: editResult.testName,
        value: editResult.value.toString(),
        unit: editResult.unit || '',
        refRangeLow: editResult.refRangeLow?.toString() || '',
        refRangeHigh: editResult.refRangeHigh?.toString() || '',
        category: editResult.category || 'OTHER',
        labName: editResult.labName || '',
        notes: editResult.notes || '',
        flagStatus: editResult.flagStatus
      });
      setSelectedCategory(editResult.category || 'OTHER');
      
      // Check if it's a custom test (not in common tests)
      const isKnownTest = commonTests.some(t => t.code === editResult.testCode);
      setIsCustomTest(!isKnownTest && commonTests.length > 0);
    }
  }, [editResult, commonTests]);

  const fetchCommonTests = async () => {
    try {
      const res = await api.get('/labs/tests');
      setCommonTests(res.data.tests);
      setTestsByCategory(res.data.byCategory);
    } catch (err) {
      console.error('Error fetching tests:', err);
    }
  };

  const handleSelectTest = (test: LabTest) => {
    setFormData({
      ...formData,
      testCode: test.code,
      testName: test.name,
      unit: test.unit,
      refRangeLow: test.refRangeLow.toString(),
      refRangeHigh: test.refRangeHigh.toString(),
      category: test.category
    });
    setIsCustomTest(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.testName.trim()) {
      setError('Please select or enter a test name');
      setLoading(false);
      return;
    }

    if (!formData.value) {
      setError('Please enter a value');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        testDate: formData.testDate,
        testCode: formData.testCode || undefined,
        testName: formData.testName,
        value: parseFloat(formData.value),
        unit: formData.unit || undefined,
        refRangeLow: formData.refRangeLow ? parseFloat(formData.refRangeLow) : undefined,
        refRangeHigh: formData.refRangeHigh ? parseFloat(formData.refRangeHigh) : undefined,
        category: formData.category,
        labName: formData.labName || undefined,
        notes: formData.notes || undefined,
        flagStatus: formData.flagStatus || undefined
      };

      if (editResult) {
        await api.put(`/labs/${editResult.id}`, payload);
      } else {
        await api.post('/labs', payload);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save lab result');
    } finally {
      setLoading(false);
    }
  };

  const getFlagColor = (value: number, low: number | null, high: number | null) => {
    if (low === null || high === null) return 'text-gray-600';
    if (value < low) return 'text-blue-600';
    if (value > high) return 'text-red-600';
    return 'text-green-600';
  };

  const getFlagLabel = (value: number, low: number | null, high: number | null) => {
    if (low === null || high === null) return '';
    if (value < low) return '↓ Low';
    if (value > high) return '↑ High';
    return '✓ Normal';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            {editResult ? 'Edit Lab Result' : 'Add Lab Result'}
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
          {/* Test Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Test Date *
            </label>
            <input
              type="date"
              required
              value={formData.testDate}
              onChange={(e) => setFormData({ ...formData, testDate: e.target.value })}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-pink-500 text-gray-900"
            />
          </div>

          {/* Test Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Test *
              </label>
              <button
                type="button"
                onClick={() => {
                  setIsCustomTest(!isCustomTest);
                  if (!isCustomTest) {
                    setFormData({ ...formData, testCode: '', testName: '', unit: '', refRangeLow: '', refRangeHigh: '' });
                  }
                }}
                className="text-sm text-pink-600 hover:text-pink-700"
              >
                {isCustomTest ? 'Select from common tests' : 'Enter custom test'}
              </button>
            </div>

            {!isCustomTest ? (
              <>
                {/* Category Tabs */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setSelectedCategory(cat.value)}
                      className={`px-3 py-1 rounded-full text-sm transition ${
                        selectedCategory === cat.value
                          ? 'bg-pink-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Test Buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1">
                  {(testsByCategory[selectedCategory] || []).map((test) => (
                    <button
                      key={test.code}
                      type="button"
                      onClick={() => handleSelectTest(test)}
                      className={`px-3 py-2 rounded-lg border text-sm text-left transition ${
                        formData.testCode === test.code
                          ? 'border-pink-500 bg-pink-50 text-gray-900'
                          : 'border-gray-200 hover:border-pink-300 text-gray-700'
                      }`}
                    >
                      <div className="font-medium">{test.name}</div>
                      <div className="text-xs text-gray-500">{test.refRangeLow}-{test.refRangeHigh} {test.unit}</div>
                    </button>
                  ))}
                </div>

                {formData.testName && (
                  <div className="mt-3 p-3 bg-pink-50 rounded-lg">
                    <div className="font-medium text-gray-900">Selected: {formData.testName}</div>
                    <div className="text-sm text-gray-600">
                      Reference: {formData.refRangeLow}-{formData.refRangeHigh} {formData.unit}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-3">
                <input
                  type="text"
                  value={formData.testName}
                  onChange={(e) => setFormData({ ...formData, testName: e.target.value })}
                  placeholder="Enter test name"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-pink-500 text-gray-900"
                />
                <div className="grid grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="Unit (e.g., ng/dL)"
                    className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-pink-500 text-gray-900"
                  />
                  <input
                    type="number"
                    step="any"
                    value={formData.refRangeLow}
                    onChange={(e) => setFormData({ ...formData, refRangeLow: e.target.value })}
                    placeholder="Ref. Low"
                    className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-pink-500 text-gray-900"
                  />
                  <input
                    type="number"
                    step="any"
                    value={formData.refRangeHigh}
                    onChange={(e) => setFormData({ ...formData, refRangeHigh: e.target.value })}
                    placeholder="Ref. High"
                    className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-pink-500 text-gray-900"
                  />
                </div>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-pink-500 text-gray-900"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Value */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Result Value *
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                step="any"
                required
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                placeholder="Enter value"
                className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-pink-500 text-gray-900"
              />
              {formData.unit && (
                <span className="text-gray-600">{formData.unit}</span>
              )}
              {formData.value && formData.refRangeLow && formData.refRangeHigh && (
                <span className={`font-medium ${getFlagColor(parseFloat(formData.value), parseFloat(formData.refRangeLow), parseFloat(formData.refRangeHigh))}`}>
                  {getFlagLabel(parseFloat(formData.value), parseFloat(formData.refRangeLow), parseFloat(formData.refRangeHigh))}
                </span>
              )}
            </div>
            {formData.refRangeLow && formData.refRangeHigh && (
              <div className="text-sm text-gray-500 mt-1">
                Reference range: {formData.refRangeLow} - {formData.refRangeHigh} {formData.unit}
              </div>
            )}
          </div>

          {/* Lab Name (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lab/Provider (Optional)
            </label>
            <input
              type="text"
              value={formData.labName}
              onChange={(e) => setFormData({ ...formData, labName: e.target.value })}
              placeholder="e.g., Quest Diagnostics, LabCorp"
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-pink-500 text-gray-900"
            />
          </div>

          {/* Flag for Discussion */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="flagForDiscussion"
              checked={formData.flagStatus === 'FLAGGED_FOR_DISCUSSION'}
              onChange={(e) => setFormData({
                ...formData,
                flagStatus: e.target.checked ? 'FLAGGED_FOR_DISCUSSION' : ''
              })}
              className="w-4 h-4 text-pink-500 border-gray-300 rounded focus:ring-pink-500"
            />
            <label htmlFor="flagForDiscussion" className="text-sm text-gray-700">
              Flag for discussion with doctor
            </label>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any notes about this result..."
              rows={2}
              maxLength={500}
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
              {loading ? 'Saving...' : editResult ? 'Update' : 'Add Result'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
