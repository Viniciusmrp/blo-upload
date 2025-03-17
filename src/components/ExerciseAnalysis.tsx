import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Award, Target, Activity, AlertCircle, Clock, TrendingUp, Move } from 'lucide-react';

interface TrainingMetrics {
  volume: {
    total: number;
    max_rom: number;
    avg_rom: number;
  };
  tension: {
    total_time: number;
    periods: number;
  };
  intensity: {
    max_velocity: number;
    avg_velocity: number;
    max_acceleration: number;
    avg_acceleration: number;
  };
  symmetry: number;
}

interface TimeSeriesPoint {
  time: number;
  knee_angle: number;
  velocity: number;
  acceleration: number;
  rom: number;
}

interface AnalysisData {
  status: string;
  message?: string;
  metrics?: TrainingMetrics;
  time_series?: TimeSeriesPoint[];
  feedback?: string[];
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
          <AlertCircle className="h-5 w-5" />
          <p>Error analyzing exercise</p>
        </div>
        <p className="text-gray-400 mt-2">Status: {analysisData.status || 'not set'}</p>
        {analysisData.message && <p className="text-gray-400 mt-1">{analysisData.message}</p>}
      </div>
    );
  }

  const { metrics, time_series, feedback } = analysisData;
  
  if (!metrics || !time_series) {
    return (
      <div className="text-gray-400">
        <p>Incomplete analysis data</p>
      </div>
    );
  }
  
  // Prepare radar chart data
  const radarData = [
    {
      subject: 'Volume',
      value: Math.min(100, (metrics.volume.avg_rom / 40) * 100), // Normalize to 0-100
      fullMark: 100,
    },
    {
      subject: 'Time Under Tension',
      value: Math.min(100, (metrics.tension.total_time / 30) * 100), // Normalize to 0-100
      fullMark: 100,
    },
    {
      subject: 'Intensity',
      value: Math.min(100, (metrics.intensity.avg_acceleration / 15) * 100), // Normalize to 0-100
      fullMark: 100,
    },
    {
      subject: 'Symmetry',
      value: metrics.symmetry,
      fullMark: 100,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Main Training Variables */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center space-x-4">
            <Move className="h-8 w-8 text-blue-400" />
            <div>
              <p className="text-sm text-gray-400">Volume (ROM)</p>
              <p className="text-2xl font-bold text-blue-400">
                {metrics.volume.avg_rom.toFixed(1)}°
              </p>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center space-x-4">
            <Clock className="h-8 w-8 text-green-400" />
            <div>
              <p className="text-sm text-gray-400">Time Under Tension</p>
              <p className="text-2xl font-bold text-green-400">
                {metrics.tension.total_time.toFixed(1)}s
              </p>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center space-x-4">
            <TrendingUp className="h-8 w-8 text-yellow-400" />
            <div>
              <p className="text-sm text-gray-400">Intensity (Accel)</p>
              <p className="text-2xl font-bold text-yellow-400">
                {metrics.intensity.avg_acceleration.toFixed(1)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center space-x-4">
            <Activity className="h-8 w-8 text-purple-400" />
            <div>
              <p className="text-sm text-gray-400">Symmetry</p>
              <p className="text-2xl font-bold text-purple-400">
                {metrics.symmetry.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Training Variables Radar Chart */}
      <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-white mb-4">Training Variables Balance</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
              <PolarGrid stroke="#374151" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#9CA3AF' }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#9CA3AF' }} />
              <Radar name="Training Variables" dataKey="value" stroke="#60A5FA" fill="#60A5FA" fillOpacity={0.6} />
              <Tooltip contentStyle={{
                backgroundColor: '#1F2937',
                border: 'none',
                borderRadius: '8px',
                color: '#F3F4F6'
              }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Time Series Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Range of Motion Chart */}
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-white mb-4">Range of Motion</h3>
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
                  label={{ value: 'ROM (°)', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }}
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
                  dataKey="rom" 
                  stroke="#60A5FA" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Intensity (Acceleration) Chart */}
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
                  label={{ value: 'Acceleration', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }}
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