"use client";
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Award, Zap, Clock, BarChart, AlertCircle } from 'lucide-react';

// Define the detailed data structure interfaces
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

// A reusable component for our new score cards
const ScoreCard = ({ icon: Icon, title, score, unit, secondaryValue, secondaryUnit, colorClass }: any) => (
  <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
    <div className="flex items-start space-x-4">
      <Icon className={`h-8 w-8 ${colorClass}`} />
      <div>
        <p className="text-sm text-gray-400">{title}</p>
        <p className={`text-2xl font-bold ${colorClass}`}>
          {score?.toFixed(1)} <span className="text-lg">{unit}</span>
        </p>
        {secondaryValue !== undefined && (
           <p className="text-xs text-gray-500 mt-1">
             {secondaryValue?.toFixed(2)} {secondaryUnit}
           </p>
        )}
      </div>
    </div>
  </div>
);

// Function to process tension_windows for the square wave plot
const processTensionData = (tensionWindows: TensionWindow[], timeSeries: TimeSeriesDataPoint[]) => {
  if (!tensionWindows || tensionWindows.length === 0 || !timeSeries || timeSeries.length === 0) return [];
  
  const plotData: { time: number; tension: number }[] = [];
  const totalDuration = timeSeries[timeSeries.length - 1].time;

  // Start with tension at 0
  plotData.push({ time: 0, tension: 0 });

  tensionWindows.forEach(window => {
    // Point right before tension starts
    plotData.push({ time: window.start - 0.001, tension: 0 });
    // Point where tension starts
    plotData.push({ time: window.start, tension: 1 });
    // Point where tension ends
    plotData.push({ time: window.end, tension: 1 });
    // Point right after tension ends
    plotData.push({ time: window.end + 0.001, tension: 0 });
  });

  // End with tension at 0
  plotData.push({ time: totalDuration, tension: 0 });

  // Sort by time to ensure correctness
  return plotData.sort((a, b) => a.time - b.time);
};


const ExerciseAnalysis: React.FC<ExerciseAnalysisProps> = ({ analysisData }) => {
  if (analysisData.status !== 'success' || !analysisData.metrics) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
        <div className="text-red-400 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <p>Error: {analysisData.error || 'Analysis data is incomplete.'}</p>
        </div>
      </div>
    );
  }

  const { metrics, tension_windows = [], time_series = [] } = analysisData;
  const tensionPlotData = processTensionData(tension_windows, time_series);

  return (
    <div className="space-y-6">
      {/* New Score Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <ScoreCard icon={Award} title="Overall Score" score={metrics.total_score} unit="/ 100" colorClass="text-blue-400" />
        <ScoreCard icon={Zap} title="Intensity Score" score={metrics.intensity_score} unit="/ 100" colorClass="text-red-400" />
        <ScoreCard icon={Clock} title="TUT Score" score={metrics.tut_score} unit="/ 100" colorClass="text-yellow-400" secondaryValue={metrics.time_under_tension} secondaryUnit="s" />
        <ScoreCard icon={BarChart} title="Volume Score" score={metrics.volume_score} unit="/ 100" colorClass="text-green-400" secondaryValue={metrics.volume} secondaryUnit={metrics.volume_unit} />
        {/* We can derive Total Reps from the length of tension_windows */}
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg flex items-center space-x-4">
           <p className="text-sm text-gray-400">Total Reps</p>
           <p className="text-2xl font-bold text-white">{tension_windows.length}</p>
        </div>
      </div>

      {/* Tension Windows Chart (Square Wave) */}
      <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold mb-6">Time Under Tension</h3>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={tensionPlotData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" type="number" stroke="#9CA3AF" style={{ fontSize: '12px' }} domain={['dataMin', 'dataMax']} unit="s" />
              <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} domain={[0, 1.2]} allowDecimals={false} ticks={[0, 1]} />
              <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }} />
              <Area type="stepAfter" dataKey="tension" stroke="#FBBF24" fill="#FBBF24" fillOpacity={0.3} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Time Series Chart */}
      <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold mb-6">Movement Analysis</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={time_series}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" type="number" stroke="#9CA3AF" style={{ fontSize: '12px' }} domain={['dataMin', 'dataMax']} unit="s" />
              <YAxis yAxisId="left" stroke="#60A5FA" style={{ fontSize: '12px' }} />
              <YAxis yAxisId="right" orientation="right" stroke="#34D399" style={{ fontSize: '12px' }} />
              <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }} />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="angle" stroke="#60A5FA" name="Angle" dot={false} strokeWidth={2} />
              <Line yAxisId="right" type="monotone" dataKey="hip_velocity" stroke="#34D399" name="Hip Velocity" dot={false} strokeWidth={2} />
              <Line yAxisId="right" type="monotone" dataKey="hip_acceleration" stroke="#F87171" name="Hip Accel." dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ExerciseAnalysis;