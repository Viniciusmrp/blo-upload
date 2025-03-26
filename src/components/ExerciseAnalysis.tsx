import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, Clock, TrendingUp } from 'lucide-react';

interface TimeSeriesPoint {
  time: number;
  angle: number;
  hip_height: number;
  hip_velocity: number;
  hip_acceleration: number;
  phase_intensity: number;
  is_concentric: boolean;
  accumulated_volume: number;
}

interface VolumePoint {
  time: number;
  volume: number;
}

interface TensionWindow {
  start: number;
  end: number;
}

interface AnalysisMetrics {
  volume: number;
  volume_unit: string;
  max_intensity: number;
  avg_intensity: number;
  time_under_tension: number;
  volume_score?: number;
  intensity_score?: number;
  tut_score?: number;
  total_score?: number;
}

interface AnalysisData {
  status: string;
  metrics?: AnalysisMetrics;
  time_series?: TimeSeriesPoint[];
  volume_progression?: VolumePoint[];
  tension_windows?: TensionWindow[];
}

interface ExerciseAnalysisProps {
  analysisData: AnalysisData;
}

const ExerciseAnalysis: React.FC<ExerciseAnalysisProps> = ({ analysisData }) => {
  if (!analysisData) {
    return (
      <div className="text-gray-400">
        <p>Waiting for analysis data...</p>
      </div>
    );
  }
  
  if (analysisData.status !== 'success') {
    return (
      <div>
        <div className="text-red-400 flex items-center gap-2">
          <p>Error analyzing exercise</p>
        </div>
        <p className="text-gray-400 mt-2">Status: {analysisData.status || 'not set'}</p>
      </div>
    );
  }

  const { metrics, time_series } = analysisData;
  
  if (!metrics || !time_series) {
    return (
      <div className="text-gray-400">
        <p>Analysis data is incomplete</p>
      </div>
    );
  }

  // Format time under tension for display (seconds to min:sec)
  const formatTimeUnderTension = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Total Score */}
      {metrics.total_score !== undefined && (
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-white mb-4">Exercise Score</h3>
          <div className="flex flex-col items-center">
            <div className="relative w-40 h-40 mb-4">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <circle 
                  cx="50" 
                  cy="50" 
                  r="45" 
                  fill="transparent" 
                  stroke="#374151" 
                  strokeWidth="10"
                />
                <circle 
                  cx="50" 
                  cy="50" 
                  r="45" 
                  fill="transparent" 
                  stroke={`hsl(${metrics.total_score}, 100%, 50%)`} 
                  strokeWidth="10" 
                  strokeDasharray={`${2 * Math.PI * 45 * metrics.total_score / 100} ${2 * Math.PI * 45 * (1 - metrics.total_score / 100)}`} 
                  strokeDashoffset={Math.PI * 45 / 2} 
                  transform="rotate(-90, 50, 50)"
                />
                <text x="50" y="55" textAnchor="middle" className="text-3xl font-bold" fill="white">
                  {Math.round(metrics.total_score)}
                </text>
              </svg>
            </div>
            
            <div className="grid grid-cols-3 gap-4 w-full">
              <div className="text-center">
                <div className="text-sm text-gray-400">Volume</div>
                <div className="text-blue-400 font-bold">{Math.round(metrics.volume_score || 0)}</div>
                <div className="w-full bg-gray-700 h-2 rounded-full mt-1">
                  <div 
                    className="bg-blue-400 h-2 rounded-full" 
                    style={{ width: `${metrics.volume_score || 0}%` }}
                  ></div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-400">Intensity</div>
                <div className="text-green-400 font-bold">{Math.round(metrics.intensity_score || 0)}</div>
                <div className="w-full bg-gray-700 h-2 rounded-full mt-1">
                  <div 
                    className="bg-green-400 h-2 rounded-full" 
                    style={{ width: `${metrics.intensity_score || 0}%` }}
                  ></div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-400">Time Under Tension</div>
                <div className="text-amber-400 font-bold">{Math.round(metrics.tut_score || 0)}</div>
                <div className="w-full bg-gray-700 h-2 rounded-full mt-1">
                  <div 
                    className="bg-amber-400 h-2 rounded-full" 
                    style={{ width: `${metrics.tut_score || 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-3 gap-4">
        {/* Volume Card */}
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center space-x-4">
            <Activity className="h-8 w-8 text-blue-400" />
            <div>
              <p className="text-sm text-gray-400">Volume</p>
              <p className="text-2xl font-bold text-blue-400">
                {metrics.volume.toFixed(2)} {metrics.volume_unit}
              </p>
            </div>
          </div>
        </div>
        
        {/* Intensity Card */}
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center space-x-4">
            <TrendingUp className="h-8 w-8 text-green-400" />
            <div>
              <p className="text-sm text-gray-400">Intensity</p>
              <p className="text-2xl font-bold text-green-400">
                {metrics.avg_intensity.toFixed(1)}
              </p>
            </div>
          </div>
        </div>
        
        {/* Time Under Tension Card */}
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center space-x-4">
            <Clock className="h-8 w-8 text-amber-400" />
            <div>
              <p className="text-sm text-gray-400">Time Under Tension</p>
              <p className="text-2xl font-bold text-amber-400">
                {formatTimeUnderTension(metrics.time_under_tension)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Volume Chart (Accumulated Volume) */}
      <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-white mb-6">Volume Progression</h3>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analysisData.volume_progression}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="time" 
                stroke="#9CA3AF"
                style={{ fontSize: '12px' }}
                label={{ value: 'Time (s)', position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                stroke="#9CA3AF"
                style={{ fontSize: '12px' }}
                label={{ value: `Volume (${metrics.volume_unit})`, angle: -90, position: 'insideLeft' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#F3F4F6'
                }}
                formatter={(value) => [`${Number(value).toFixed(2)} ${metrics.volume_unit}`, 'Volume']}
                labelFormatter={(label) => `Time: ${Number(label).toFixed(1)}s`}
              />
              <Line 
                type="monotone" 
                dataKey="volume" 
                stroke="#60A5FA" 
                name="Accumulated Volume"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Intensity Chart (Hip Acceleration & Movement Phase) */}
      <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-white mb-6">Intensity (Movement Acceleration)</h3>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={time_series}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="time" 
                stroke="#9CA3AF"
                style={{ fontSize: '12px' }}
                label={{ value: 'Time (s)', position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                stroke="#9CA3AF"
                style={{ fontSize: '12px' }}
                label={{ value: 'Intensity', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#F3F4F6'
                }}
                formatter={(value, name) => {
                  if (typeof name === 'string' && name.includes('Concentric')) {
                    return [value ? 'Upward' : 'Downward', 'Movement Direction'];
                  }
                  return [`${Number(value).toFixed(2)}`, name];
                }}
                labelFormatter={(label) => `Time: ${Number(label).toFixed(1)}s`}
              />
              <Line 
                type="monotone" 
                dataKey="phase_intensity" 
                stroke="#34D399" 
                name="Movement Intensity"
                strokeWidth={2}
                dot={false}
              />
              <Line 
                type="step" 
                dataKey="is_concentric" 
                stroke="#9CA3AF" 
                name="Concentric"
                strokeWidth={1}
                dot={false}
                strokeDasharray="3 3"
                opacity={0.5}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Time Under Tension Chart */}
      <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-white mb-6">Time Under Tension</h3>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={time_series}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="time" 
                stroke="#9CA3AF"
                style={{ fontSize: '12px' }}
                label={{ value: 'Time (s)', position: 'insideBottom', offset: -5 }}
                tickFormatter={(value) => value.toFixed(0)}
                domain={['dataMin', 'dataMax']}
                allowDecimals={false}
                interval="preserveStartEnd"
              />
              <YAxis 
                stroke="#9CA3AF"
                style={{ fontSize: '12px' }}
                label={{ value: 'Active', angle: -90, position: 'insideLeft' }}
                domain={[0, 1]}
                ticks={[0, 1]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#F3F4F6'
                }}
                formatter={(value, name) => {
                  if (typeof name === 'string' && name.includes('Tension Period')) {
                    return [value === 1 ? 'Active' : 'Inactive', 'Status'];
                  }
                  return [value, name];
                }}
                labelFormatter={(label) => `Time: ${Number(label).toFixed(1)}s`}
              />
              {analysisData.tension_windows?.map((window, index) => {
                // Create a dataset that marks periods of tension
                const tensionData = time_series.map(point => ({
                  ...point,
                  tension: (point.time >= window.start && point.time <= window.end) ? 1 : 0
                }));
                
                return (
                  <Line 
                    key={index}
                    data={tensionData}
                    type="step" 
                    dataKey="tension" 
                    stroke="#FBBF24" 
                    name={`Tension Period ${index + 1}`}
                    strokeWidth={2}
                    dot={false}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ExerciseAnalysis;