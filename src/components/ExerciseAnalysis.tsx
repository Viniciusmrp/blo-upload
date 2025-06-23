"use client";
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Award, Zap, Clock, BarChart, AlertCircle, Activity } from 'lucide-react';

// Keep your existing interfaces unchanged
interface Metrics {
  total_score: number;
  intensity_score: number;
  tut_score: number;
  volume_score: number;
  time_under_tension: number;
  volume: number;
  volume_unit: string;
}

interface TensionWindow {
  start: number;
  end: number;
}

interface TimeSeriesDataPoint {
  time: number;
  angle: number;
  hip_velocity: number;
  hip_acceleration: number;
}

interface AnalysisData {
  status: 'success' | 'error';
  metrics?: Metrics;
  tension_windows?: TensionWindow[];
  time_series?: TimeSeriesDataPoint[];
  error?: string;
}

interface ExerciseAnalysisProps {
  analysisData: AnalysisData;
}

// Enhanced Score Card Component with professional styling
const ScoreCard = ({
  icon: Icon,
  title,
  score,
  unit,
  secondaryValue,
  secondaryUnit,
  colorClass,
  gradientFrom,
  gradientTo
}: {
  icon: React.ElementType;
  title: string;
  score: number;
  unit: string;
  secondaryValue?: number;
  secondaryUnit?: string;
  colorClass: string;
  gradientFrom: string;
  gradientTo: string;
}) => {
  const percentage = Math.min((score / 100) * 100, 100);

  return (
    <div className="group relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 shadow-xl border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
      {/* Subtle gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradientFrom} ${gradientTo} opacity-5 rounded-xl`}></div>

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-lg bg-gradient-to-br ${gradientFrom} ${gradientTo} bg-opacity-20`}>
            <Icon className={`h-6 w-6 ${colorClass}`} />
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-white group-hover:text-blue-100 transition-colors">
              {typeof score === 'number' ? score.toFixed(1) : '0.0'}
              <span className="text-sm text-gray-400 ml-1">{unit}</span>
            </p>
            {secondaryValue !== undefined && (
              <p className="text-xs text-gray-500 mt-1">
                {secondaryValue.toFixed(2)} {secondaryUnit}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium text-gray-300">{title}</p>
            <p className="text-xs text-gray-500 bg-gray-700/50 px-2 py-1 rounded-full">
              {percentage.toFixed(0)}%
            </p>
          </div>

          {/* Enhanced progress bar with glow effect */}
          <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all duration-700 ease-out bg-gradient-to-r ${gradientFrom} ${gradientTo} relative`}
              style={{ width: `${percentage}%` }}
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${gradientFrom} ${gradientTo} opacity-50 blur-sm`}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Keep your existing processTensionData function unchanged
const processTensionData = (tensionWindows: TensionWindow[], timeSeries: TimeSeriesDataPoint[]) => {
  if (!tensionWindows || tensionWindows.length === 0 || !timeSeries || timeSeries.length === 0) return [];

  const plotData: { time: number; tension: number }[] = [];
  const totalDuration = timeSeries[timeSeries.length - 1].time;

  plotData.push({ time: 0, tension: 0 });

  tensionWindows.forEach(window => {
    plotData.push({ time: window.start - 0.001, tension: 0 });
    plotData.push({ time: window.start, tension: 1 });
    plotData.push({ time: window.end, tension: 1 });
    plotData.push({ time: window.end + 0.001, tension: 0 });
  });

  plotData.push({ time: totalDuration, tension: 0 });
  return plotData.sort((a, b) => a.time - b.time);
};

const ExerciseAnalysis: React.FC<ExerciseAnalysisProps> = ({ analysisData }) => {
  if (analysisData.status !== 'success' || !analysisData.metrics) {
    return (
      <div className="bg-gradient-to-br from-red-900/20 to-red-800/20 rounded-xl p-6 shadow-lg border border-red-500/30 backdrop-blur-sm">
        <div className="text-red-400 flex items-center gap-3">
          <div className="p-2 bg-red-500/20 rounded-lg">
            <AlertCircle className="h-6 w-6 flex-shrink-0" />
          </div>
          <div>
            <p className="font-semibold text-lg">Analysis Error</p>
            <p className="text-sm text-red-300 opacity-90">{analysisData.error || 'Analysis data is incomplete.'}</p>
          </div>
        </div>
      </div>
    );
  }

  const { metrics, tension_windows = [], time_series = [] } = analysisData;
  const tensionPlotData = processTensionData(tension_windows, time_series);

  return (
    <div className="space-y-8">
      {/* Enhanced Header with gradient text */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-blue-600 bg-clip-text text-transparent">
          Exercise Analysis Results
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Comprehensive analysis of your exercise performance with detailed metrics and insights
        </p>
        <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
      </div>

      {/* MODIFIED: Adjusted grid columns for better spacing on different screen sizes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <ScoreCard
          icon={Award}
          title="Overall Score"
          score={metrics.total_score}
          unit="/100"
          colorClass="text-blue-400"
          gradientFrom="from-blue-500"
          gradientTo="to-blue-600"
        />
        <ScoreCard
          icon={Zap}
          title="Intensity Score"
          score={metrics.intensity_score}
          unit="/100"
          colorClass="text-red-400"
          gradientFrom="from-red-500"
          gradientTo="to-red-600"
        />
        <ScoreCard
          icon={Clock}
          title="TUT Score"
          score={metrics.tut_score}
          unit="/100"
          colorClass="text-yellow-400"
          secondaryValue={metrics.time_under_tension}
          secondaryUnit="s"
          gradientFrom="from-yellow-500"
          gradientTo="to-yellow-600"
        />
        <ScoreCard
          icon={BarChart}
          title="Volume Score"
          score={metrics.volume_score}
          unit="/100"
          colorClass="text-green-400"
          secondaryValue={metrics.volume}
          secondaryUnit={metrics.volume_unit}
          gradientFrom="from-green-500"
          gradientTo="to-green-600"
        />
      </div>

      {/* MODIFIED: Adjusted grid columns for better spacing */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 shadow-xl border border-gray-700/50 text-center group hover:shadow-2xl transition-all duration-300">
          <div className="p-3 bg-purple-500/20 rounded-lg w-fit mx-auto mb-3 group-hover:bg-purple-500/30 transition-colors">
            <Activity className="h-8 w-8 text-purple-400" />
          </div>
          <p className="text-3xl font-bold text-white mb-1">{tension_windows.length}</p>
          <p className="text-sm text-gray-400">Total Repetitions</p>
        </div>

        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 shadow-xl border border-gray-700/50 text-center group hover:shadow-2xl transition-all duration-300">
          <div className="p-3 bg-indigo-500/20 rounded-lg w-fit mx-auto mb-3 group-hover:bg-indigo-500/30 transition-colors">
            <Clock className="h-8 w-8 text-indigo-400" />
          </div>
          <p className="text-3xl font-bold text-white mb-1">
            {tension_windows.length > 0 ? (metrics.time_under_tension / tension_windows.length).toFixed(1) : '0.0'}s
          </p>
          <p className="text-sm text-gray-400">Avg Rep Duration</p>
        </div>

        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 shadow-xl border border-gray-700/50 text-center group hover:shadow-2xl transition-all duration-300">
          <div className="p-3 bg-orange-500/20 rounded-lg w-fit mx-auto mb-3 group-hover:bg-orange-500/30 transition-colors">
            <Zap className="h-8 w-8 text-orange-400" />
          </div>
          <p className="text-3xl font-bold text-white mb-1">{(metrics.time_under_tension / (time_series.length > 0 ? time_series[time_series.length - 1].time : 1) * 100).toFixed(1)}%</p>
          <p className="text-sm text-gray-400">Time Efficiency</p>
        </div>
      </div>

      {/* Enhanced Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Enhanced Tension Windows Chart */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 shadow-xl border border-gray-700/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Time Under Tension</h3>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={tensionPlotData}>
                <defs>
                  <linearGradient id="tensionGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FBBF24" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#FBBF24" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis
                  dataKey="time"
                  type="number"
                  stroke="#9CA3AF"
                  style={{ fontSize: '11px' }}
                  domain={['dataMin', 'dataMax']}
                  unit="s"
                />
                <YAxis
                  stroke="#9CA3AF"
                  style={{ fontSize: '11px' }}
                  domain={[0, 1.2]}
                  allowDecimals={false}
                  ticks={[0, 1]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111827',
                    border: '1px solid #374151',
                    borderRadius: '12px',
                    color: '#F9FAFB',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                  }}
                />
                <Area
                  type="stepAfter"
                  dataKey="tension"
                  stroke="#FBBF24"
                  fill="url(#tensionGradient)"
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Enhanced Time Series Chart */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 shadow-xl border border-gray-700/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <BarChart className="h-5 w-5 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Movement Analysis</h3>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={time_series}>
                <defs>
                  <linearGradient id="angleGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#60A5FA"/>
                    <stop offset="100%" stopColor="#3B82F6"/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis
                  dataKey="time"
                  type="number"
                  stroke="#9CA3AF"
                  style={{ fontSize: '11px' }}
                  domain={['dataMin', 'dataMax']}
                  unit="s"
                />
                <YAxis
                  yAxisId="left"
                  stroke="#60A5FA"
                  style={{ fontSize: '11px' }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#34D399"
                  style={{ fontSize: '11px' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111827',
                    border: '1px solid #374151',
                    borderRadius: '12px',
                    color: '#F9FAFB',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                  }}
                />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="angle"
                  stroke="url(#angleGradient)"
                  name="Angle"
                  dot={false}
                  strokeWidth={3}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="hip_velocity"
                  stroke="#34D399"
                  name="Hip Velocity"
                  dot={false}
                  strokeWidth={2}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="hip_acceleration"
                  stroke="#F87171"
                  name="Hip Acceleration"
                  dot={false}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExerciseAnalysis;