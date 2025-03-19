import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Award, Target, Activity, AlertCircle, Clock, TrendingUp, Move } from 'lucide-react';

interface Metrics {
  volume: {
    total_kg: number;
    score: number;
  };
  tension: {
    total_time: number;
    periods: number;
    score: number;
  };
  intensity: {
    concentric_acceleration: number;
    eccentric_acceleration: number;
    control_ratio: number;
    score: number;
  };
  symmetry: number;
}

interface TimeSeriesPoint {
  time: number;
  knee_angle: number;
  hip_position: number;
  acceleration: number;
}

interface TensionPoint {
  time: number;
  tension: number;
}

interface AnalysisData {
  status: string;
  message?: string;
  overall_score?: number;
  metrics?: Metrics;
  time_series?: TimeSeriesPoint[];
  tension_series?: TensionPoint[];
  feedback?: string[];
}

interface ExerciseAnalysisProps {
  analysisData: AnalysisData;
}

const ExerciseAnalysis: React.FC<ExerciseAnalysisProps> = ({ analysisData }) => {
  // Debug logging to see what data we're actually receiving
  console.log("Analysis data received:", analysisData);
  
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
          <AlertCircle className="h-5 w-5" />
          <p>Error analyzing exercise</p>
        </div>
        <p className="text-gray-400 mt-2">Status: {analysisData.status || 'not set'}</p>
        {analysisData.message && <p className="text-gray-400 mt-1">{analysisData.message}</p>}
      </div>
    );
  }

  const { metrics, time_series, tension_series, feedback, overall_score } = analysisData;
  
  // More detailed debug checks to help identify issues
  if (!metrics) {
    console.error("Missing metrics in analysis data");
    return (
      <div className="text-gray-400">
        <p>Missing metrics data</p>
      </div>
    );
  }
  
  if (!time_series) {
    console.error("Missing time_series in analysis data");
    return (
      <div className="text-gray-400">
        <p>Missing time series data</p>
      </div>
    );
  }
  
  // Added safety checks to prevent errors
  const volumeValue = metrics?.volume?.total_kg !== undefined ? metrics.volume.total_kg.toFixed(0) : "N/A";
  const volumeScore = metrics?.volume?.score !== undefined ? metrics.volume.score : 0;
  
  const intensityValue = metrics?.intensity?.concentric_acceleration !== undefined 
    ? metrics.intensity.concentric_acceleration.toFixed(1) 
    : "N/A";
  const intensityScore = metrics?.intensity?.score !== undefined ? metrics.intensity.score : 0;

  return (
    <div className="space-y-6">
      {/* Overall Score Card */}
      <div className="bg-gray-800 rounded-xl p-6 shadow-lg mb-6">
        <div className="flex items-center justify-center space-x-4">
          <Award className="h-12 w-12 text-yellow-400" />
          <div className="text-center">
            <p className="text-md text-gray-400">Overall Training Score</p>
            <p className="text-4xl font-bold text-yellow-400">
              {overall_score !== undefined ? overall_score.toFixed(1) : "N/A"}/100
            </p>
          </div>
        </div>
      </div>

      {/* Main Training Variables - Side by Side */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex flex-col items-center text-center">
            <Move className="h-8 w-8 text-blue-400 mb-2" />
            <p className="text-sm text-gray-400">Volume</p>
            <p className="text-xl font-bold text-blue-400">
              {volumeValue} kg
            </p>
            <div className="mt-2 h-1 w-full bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-400 rounded-full" 
                style={{ width: `${volumeScore}%` }}
              />
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex flex-col items-center text-center">
            <Clock className="h-8 w-8 text-green-400 mb-2" />
            <p className="text-sm text-gray-400">Time Under Tension</p>
            <p className="text-xl font-bold text-green-400">
              {metrics?.tension?.total_time !== undefined ? metrics.tension.total_time.toFixed(1) : "N/A"}s
            </p>
            <div className="mt-2 h-1 w-full bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-400 rounded-full" 
                style={{ width: `${metrics?.tension?.score || 0}%` }}
              />
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex flex-col items-center text-center">
            <TrendingUp className="h-8 w-8 text-yellow-400 mb-2" />
            <p className="text-sm text-gray-400">Intensity</p>
            <p className="text-xl font-bold text-yellow-400">
              {intensityValue}
            </p>
            <div className="mt-2 h-1 w-full bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-yellow-400 rounded-full" 
                style={{ width: `${intensityScore}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Time Series Charts - Volume & Intensity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Volume Chart */}
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-white mb-4">Volume (Hip Position)</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={time_series}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="time" 
                  stroke="#9CA3AF" 
                  label={{ value: 'Time (s)', position: 'insideBottom', fill: '#9CA3AF' }}
                />
                <YAxis 
                  stroke="#9CA3AF"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#F3F4F6'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="hip_position" 
                  stroke="#60A5FA" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Intensity Chart */}
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-white mb-4">Intensity (Acceleration)</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={time_series}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="time" 
                  stroke="#9CA3AF"
                  label={{ value: 'Time (s)', position: 'insideBottom', fill: '#9CA3AF' }}
                />
                <YAxis 
                  stroke="#9CA3AF"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#F3F4F6'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="acceleration" 
                  stroke="#FBBF24" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Time Under Tension Chart */}
      <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-white mb-4">Time Under Tension</h3>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={tension_series}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="time" 
                stroke="#9CA3AF"
                label={{ value: 'Time (s)', position: 'insideBottom', fill: '#9CA3AF' }}
              />
              <YAxis 
                stroke="#9CA3AF"
                domain={[0, 1]}
                ticks={[0, 1]}
                tickFormatter={(value) => value === 0 ? 'Rest' : 'Tension'}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#F3F4F6'
                }}
                formatter={(value) => [value === 1 ? 'Under Tension' : 'Rest', 'State']}
              />
              <Area 
                type="stepAfter" 
                dataKey="tension" 
                stroke="#10B981" 
                fill="#10B981" 
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Feedback Section */}
      {feedback && feedback.length > 0 && (
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center space-x-3 mb-4">
            <AlertCircle className="h-6 w-6 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Training Feedback</h3>
          </div>
          <div className="space-y-3">
            {feedback.map((item, index) => (
              <div 
                key={index}
                className="flex items-start space-x-3 p-3 bg-gray-700 rounded-lg"
              >
                <Target className="h-5 w-5 text-blue-400 mt-0.5" />
                <p className="text-gray-200">{item}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExerciseAnalysis;