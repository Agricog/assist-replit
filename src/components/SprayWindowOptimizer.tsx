import { useState, useEffect } from 'react';

interface WeatherBlock {
  time: string;
  status: 'PERFECT' | 'RISKY' | 'DONT_SPRAY' | 'NIGHT';
  wind: number;
  windDir: string;
  rain: number;
  temp: number;
  reason: string;
  dt: number;
}

interface DayTimeline {
  day: string;
  date: string;
  blocks: WeatherBlock[];
}

interface SprayWindow {
  day: string;
  date: string;
  startTime: string;
  endTime: string;
  durationHours: number;
  quality: 'PERFECT' | 'RISKY';
  avgWind: number;
  avgTemp: number;
  rainChance: number;
}

interface SprayAnalysis {
  recommendedWindows: SprayWindow[];
  timeline: DayTimeline[];
  lastUpdated: Date;
}

export default function SprayWindowOptimizer() {
  const [analysis, setAnalysis] = useState<SprayAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sprayType, setSprayType] = useState<'herbicide' | 'fungicide' | 'insecticide'>('herbicide');

  useEffect(() => {
    fetchSprayAnalysis();
  }, [sprayType]);

  const fetchSprayAnalysis = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/spray-analysis?type=${sprayType}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch spray analysis');
      }

      const data = await response.json();
      setAnalysis(data);
      setError('');
    } catch (err) {
      console.error('Spray analysis error:', err);
      setError('Unable to load spray conditions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getWindLimit = () => {
    switch (sprayType) {
      case 'herbicide': return 10;
      case 'fungicide': return 12;
      case 'insecticide': return 15;
      default: return 10;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PERFECT': return 'bg-green-500';
      case 'RISKY': return 'bg-amber-500';
      case 'DONT_SPRAY': return 'bg-red-500';
      case 'NIGHT': return 'bg-gray-400';
      default: return 'bg-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PERFECT': return '✅';
      case 'RISKY': return '⚠️';
      case 'DONT_SPRAY': return '❌';
      case 'NIGHT': return '🌙';
      default: return '';
    }
  };

  const getWindDirection = (deg: number): string => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(deg / 45) % 8;
    return directions[index];
  };

  const formatTime = (timeStr: string) => {
    const [hours] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'pm' : 'am';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}${ampm}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
          <p className="text-gray-600">Analyzing spray conditions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg max-w-md">
          <p className="font-semibold mb-2">Error Loading Spray Conditions</p>
          <p>{error}</p>
          <button
            onClick={fetchSprayAnalysis}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return null;
  }

  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">🌾 Spray Window Optimizer</h2>
          <div className="text-sm text-gray-500">
            Last updated: {new Date(analysis.lastUpdated).toLocaleTimeString()}
          </div>
        </div>

        {/* Spray Type Selector */}
        <div className="flex space-x-2 mb-4">
          <button
            onClick={() => setSprayType('herbicide')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              sprayType === 'herbicide'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Herbicide (Max {getWindLimit()}mph)
          </button>
          <button
            onClick={() => setSprayType('fungicide')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              sprayType === 'fungicide'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Fungicide (Max 12mph)
          </button>
          <button
            onClick={() => setSprayType('insecticide')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              sprayType === 'insecticide'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Insecticide (Max 15mph)
          </button>
        </div>
      </div>

      {/* Recommended Spray Times */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Recommended Spray Times This Week</h3>
        {analysis.recommendedWindows.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-6 py-4 rounded-lg">
            <p className="font-semibold">⚠️ No ideal spray windows found</p>
            <p className="text-sm mt-1">Check back tomorrow for updated forecast or consider waiting for better conditions.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            {analysis.recommendedWindows.slice(0, 3).map((window, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg border-2 ${
                  window.quality === 'PERFECT'
                    ? 'border-green-500 bg-green-50'
                    : 'border-amber-500 bg-amber-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-gray-800">
                    {idx === 0 ? '🎯 BEST' : idx === 1 ? '📅 GOOD' : '📅 OK'}
                  </span>
                  <span className="text-2xl">{getStatusIcon(window.quality)}</span>
                </div>
                <div className="font-semibold text-lg text-gray-800 mb-1">
                  {window.day} {formatTime(window.startTime)}-{formatTime(window.endTime)}
                </div>
                <div className="text-sm text-gray-700 mb-2">
                  {window.durationHours} hours available
                </div>
                <div className="text-xs text-gray-600">
                  Wind {Math.round(window.avgWind)}mph, {window.rainChance}% rain, {Math.round(window.avgTemp)}°C
                </div>
                {window.quality === 'PERFECT' && (
                  <div className="mt-2 text-xs font-medium text-green-700">
                    Perfect conditions
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Timeline View */}
      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-4">5-Day Spray Forecast</h3>
        <div className="space-y-6">
          {analysis.timeline.map((day, dayIdx) => (
            <div key={dayIdx} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="font-bold text-lg text-gray-800 mb-3">
                {day.day}, {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
              <div className="grid grid-cols-8 gap-1">
                {day.blocks.map((block, blockIdx) => (
                  <div
                    key={blockIdx}
                    className="group relative"
                  >
                    <div
                      className={`h-16 ${getStatusColor(block.status)} rounded cursor-pointer transition hover:opacity-80`}
                      title={`${block.time}: ${block.reason}`}
                    >
                      <div className="flex flex-col items-center justify-center h-full text-white text-xs font-medium">
                        <span>{getStatusIcon(block.status)}</span>
                        <span className="text-[10px]">{formatTime(block.time.split('-')[0])}</span>
                      </div>
                    </div>

                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10 w-48">
                      <div className="bg-gray-900 text-white text-xs rounded-lg p-3 shadow-lg">
                        <div className="font-semibold mb-2">{block.time}</div>
                        <div className="space-y-1">
                          <div>Wind: {Math.round(block.wind)}mph {getWindDirection(block.wind)}</div>
                          <div>Rain: {block.rain}% chance</div>
                          <div>Temp: {Math.round(block.temp)}°C</div>
                          <div className="mt-2 pt-2 border-t border-gray-700 font-medium">
                            {block.reason}
                          </div>
                        </div>
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-8 bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-800 mb-3">Legend</h4>
        <div className="grid md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center text-white">✅</div>
            <div>
              <div className="font-medium">Perfect</div>
              <div className="text-xs text-gray-600">Ideal conditions</div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-amber-500 rounded flex items-center justify-center text-white">⚠️</div>
            <div>
              <div className="font-medium">Risky</div>
              <div className="text-xs text-gray-600">Proceed with caution</div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-red-500 rounded flex items-center justify-center text-white">❌</div>
            <div>
              <div className="font-medium">Don't Spray</div>
              <div className="text-xs text-gray-600">Unsafe conditions</div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-400 rounded flex items-center justify-center text-white">🌙</div>
            <div>
              <div className="font-medium">Night</div>
              <div className="text-xs text-gray-600">Outside spray hours</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
