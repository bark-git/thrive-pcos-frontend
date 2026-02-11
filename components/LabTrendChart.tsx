'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

interface TrendData {
  date: string;
  value: number;
  flagStatus: string;
}

interface TrendStats {
  count: number;
  latest: number;
  latestDate: string;
  oldest: number;
  oldestDate: string;
  min: number;
  max: number;
  average: string;
  trend: string;
  refRangeLow: number | null;
  refRangeHigh: number | null;
  unit: string | null;
}

interface LabTrendChartProps {
  testCode: string;
  testName: string;
  onClose: () => void;
}

export default function LabTrendChart({ testCode, testName, onClose }: LabTrendChartProps) {
  const [chartData, setChartData] = useState<TrendData[]>([]);
  const [stats, setStats] = useState<TrendStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrendData();
  }, [testCode]);

  const fetchTrendData = async () => {
    try {
      const res = await api.get(`/labs/trends/${testCode}`);
      setChartData(res.data.chartData || []);
      setStats(res.data.stats);
    } catch (err) {
      console.error('Error fetching trend data:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: '2-digit'
    });
  };

  // Calculate chart dimensions
  const chartWidth = 600;
  const chartHeight = 300;
  const padding = { top: 40, right: 40, bottom: 60, left: 60 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  // Calculate scales
  const values = chartData.map(d => d.value);
  const allValues = [...values];
  if (stats?.refRangeLow) allValues.push(stats.refRangeLow);
  if (stats?.refRangeHigh) allValues.push(stats.refRangeHigh);
  
  const minValue = Math.min(...allValues) * 0.9;
  const maxValue = Math.max(...allValues) * 1.1;
  const valueRange = maxValue - minValue || 1;

  const xScale = (index: number) => padding.left + (index / Math.max(chartData.length - 1, 1)) * innerWidth;
  const yScale = (value: number) => padding.top + innerHeight - ((value - minValue) / valueRange) * innerHeight;

  // Generate line path
  const linePath = chartData
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(d.value)}`)
    .join(' ');

  // Reference range band
  const refLowY = stats?.refRangeLow ? yScale(stats.refRangeLow) : null;
  const refHighY = stats?.refRangeHigh ? yScale(stats.refRangeHigh) : null;

  const getTrendIcon = () => {
    if (!stats) return '';
    switch (stats.trend) {
      case 'INCREASING': return '↗️';
      case 'DECREASING': return '↘️';
      case 'STABLE': return '→';
      default: return '';
    }
  };

  const getTrendColor = () => {
    if (!stats) return 'text-gray-600';
    // For most tests, decreasing toward normal range is good
    // This is simplified - some tests like HDL, higher is better
    return 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl p-6 max-w-3xl w-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{testName}</h2>
            <p className="text-gray-600">Trend over time</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {chartData.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No data available for this test yet.</p>
          </div>
        ) : (
          <>
            {/* Stats Summary */}
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-sm text-gray-500">Latest</div>
                  <div className="text-xl font-bold text-gray-900">
                    {stats.latest} {stats.unit}
                  </div>
                  <div className="text-xs text-gray-500">{formatDate(stats.latestDate)}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-sm text-gray-500">Average</div>
                  <div className="text-xl font-bold text-gray-900">
                    {stats.average} {stats.unit}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-sm text-gray-500">Range</div>
                  <div className="text-xl font-bold text-gray-900">
                    {stats.min} - {stats.max}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-sm text-gray-500">Trend</div>
                  <div className={`text-xl font-bold ${getTrendColor()}`}>
                    {getTrendIcon()} {stats.trend.replace('_', ' ')}
                  </div>
                </div>
              </div>
            )}

            {/* Reference Range Legend */}
            {stats && stats.refRangeLow !== null && stats.refRangeHigh !== null && (
              <div className="mb-4 text-sm text-gray-600">
                <span className="inline-block w-4 h-4 bg-green-100 border border-green-300 mr-2 align-middle"></span>
                Reference Range: {stats.refRangeLow} - {stats.refRangeHigh} {stats.unit}
              </div>
            )}

            {/* Chart */}
            <div className="overflow-x-auto">
              <svg width={chartWidth} height={chartHeight} className="mx-auto">
                {/* Reference range band */}
                {refLowY !== null && refHighY !== null && (
                  <rect
                    x={padding.left}
                    y={refHighY}
                    width={innerWidth}
                    height={refLowY - refHighY}
                    fill="#D1FAE5"
                    opacity={0.5}
                  />
                )}

                {/* Reference lines */}
                {refLowY !== null && (
                  <line
                    x1={padding.left}
                    y1={refLowY}
                    x2={chartWidth - padding.right}
                    y2={refLowY}
                    stroke="#10B981"
                    strokeDasharray="4"
                    strokeWidth={1}
                  />
                )}
                {refHighY !== null && (
                  <line
                    x1={padding.left}
                    y1={refHighY}
                    x2={chartWidth - padding.right}
                    y2={refHighY}
                    stroke="#10B981"
                    strokeDasharray="4"
                    strokeWidth={1}
                  />
                )}

                {/* Grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((fraction, i) => {
                  const y = padding.top + fraction * innerHeight;
                  const value = maxValue - fraction * valueRange;
                  return (
                    <g key={i}>
                      <line
                        x1={padding.left}
                        y1={y}
                        x2={chartWidth - padding.right}
                        y2={y}
                        stroke="#E5E7EB"
                        strokeWidth={1}
                      />
                      <text
                        x={padding.left - 10}
                        y={y + 4}
                        textAnchor="end"
                        fontSize={10}
                        fill="#6B7280"
                      >
                        {value.toFixed(1)}
                      </text>
                    </g>
                  );
                })}

                {/* Line */}
                {chartData.length > 1 && (
                  <path
                    d={linePath}
                    fill="none"
                    stroke="#EC4899"
                    strokeWidth={2}
                  />
                )}

                {/* Data points */}
                {chartData.map((d, i) => {
                  const isAbnormal = d.flagStatus !== 'NORMAL';
                  return (
                    <g key={i}>
                      <circle
                        cx={xScale(i)}
                        cy={yScale(d.value)}
                        r={isAbnormal ? 8 : 6}
                        fill={isAbnormal ? '#EF4444' : '#EC4899'}
                        stroke="white"
                        strokeWidth={2}
                      />
                      {/* Value label */}
                      <text
                        x={xScale(i)}
                        y={yScale(d.value) - 12}
                        textAnchor="middle"
                        fontSize={10}
                        fill="#374151"
                        fontWeight="bold"
                      >
                        {d.value}
                      </text>
                    </g>
                  );
                })}

                {/* X-axis labels */}
                {chartData.map((d, i) => (
                  <text
                    key={i}
                    x={xScale(i)}
                    y={chartHeight - padding.bottom + 20}
                    textAnchor="middle"
                    fontSize={10}
                    fill="#6B7280"
                    transform={`rotate(-45, ${xScale(i)}, ${chartHeight - padding.bottom + 20})`}
                  >
                    {formatDate(d.date)}
                  </text>
                ))}

                {/* Y-axis label */}
                <text
                  x={15}
                  y={chartHeight / 2}
                  textAnchor="middle"
                  fontSize={12}
                  fill="#6B7280"
                  transform={`rotate(-90, 15, ${chartHeight / 2})`}
                >
                  {stats?.unit || 'Value'}
                </text>
              </svg>
            </div>

            {/* Data Table */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">All Results</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-3 text-gray-600">Date</th>
                      <th className="text-left py-2 px-3 text-gray-600">Value</th>
                      <th className="text-left py-2 px-3 text-gray-600">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...chartData].reverse().map((d, i) => (
                      <tr key={i} className="border-b border-gray-100">
                        <td className="py-2 px-3 text-gray-900">{formatDate(d.date)}</td>
                        <td className="py-2 px-3 text-gray-900 font-medium">
                          {d.value} {stats?.unit}
                        </td>
                        <td className="py-2 px-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            d.flagStatus === 'NORMAL'
                              ? 'bg-green-100 text-green-700'
                              : d.flagStatus === 'FLAGGED_FOR_DISCUSSION'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {d.flagStatus === 'FLAGGED_FOR_DISCUSSION' ? 'For Discussion' : d.flagStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
