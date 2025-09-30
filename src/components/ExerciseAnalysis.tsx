"use client";
import React, { useState, useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Award, Zap, Clock, Activity, ChevronDown, ChevronUp, TrendingUp, Anchor, Move } from 'lucide-react';

// Updated interfaces to match the new JSON structure
interface MetricValue {
  unit: string;
  value: number;
}

interface Metrics {
  avg_concentric_power: MetricValue;
  max_power: MetricValue;
  time_efficiency: number;
  time_under_tension: number;
  total_volume: MetricValue;
  tut_concentric: number;
  tut_eccentric: number;
}

interface RepDetail {
  duration: number;
  end_frame: number;
  end_time: number;
  rep_number: number;
  start_frame: number;
  start_time: number;
  steadiness_score: number;
  // Assuming volume per rep is available or can be calculated
  volume?: number; 
}

interface Reps {
  avg_duration: number;
  details: RepDetail[];
  total: number;
}

interface Scores {
  eccentric_steadiness: number;
}

interface TimeSeriesDataPoint {
  time: number;
  [key: string]: any; // Keep it flexible for all kinematic data
}

interface TimeSeriesData {
  kinematics: TimeSeriesDataPoint[];
}

interface AnalysisData {
  status: 'success' | 'error';
  metrics?: Metrics;
  reps?: Reps;
  scores?: Scores;
  time_series_data?: TimeSeriesData;
  error?: string;
}

interface ExerciseAnalysisProps {
  analysisData: AnalysisData;
  exercise: string | null;
  category: string | null;
}

const MetricCard = ({
  icon: Icon,
  title,
  value,
  unit,
  colorClass,
  gradientFrom,
  gradientTo
}: {
  icon: React.ElementType;
  title: string;
  value: string | number;
  unit?: string;
  colorClass: string;
  gradientFrom: string;
  gradientTo: string;
}) => (
  <div className={`bg-gradient-to-br ${gradientFrom} ${gradientTo} rounded-xl p-4 shadow-lg border border-gray-700/50 text-white flex items-center justify-between`}>
    <div className="flex items-center gap-3 min-w-0">
        <Icon className={`${colorClass} h-6 w-6 flex-shrink-0`} />
        <p className="text-md font-semibold truncate">{title}</p>
    </div>
    <div className="text-right">
        <p className="text-xl sm:text-2xl font-bold whitespace-nowrap">
            {value}
            {unit && <span className="text-xs sm:text-sm text-gray-300 ml-0.5">{unit}</span>}
        </p>
    </div>
</div>
);

const RepChart = ({ data, dataKey, title, color, unit }: { data: any[]; dataKey: string; title: string; color: string; unit: string; }) => (
  <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 shadow-xl border border-gray-700/50">
    <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis dataKey="rep_number" stroke="#9CA3AF" tick={{ fontSize: 12 }} label={{ value: 'Rep', position: 'insideBottom', offset: -5, fill: '#9CA3AF' }}/>
        <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} unit={unit} />
        <Tooltip
          contentStyle={{
            backgroundColor: '#111827',
            border: '1px solid #374151',
            borderRadius: '12px',
          }}
          labelStyle={{ color: '#F9FAFB' }}
        />
        <Bar dataKey={dataKey} fill={color} name={title} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

const ExerciseAnalysis: React.FC<ExerciseAnalysisProps> = ({ analysisData, exercise, category }) => {
  const [showAngleCheckboxes, setShowAngleCheckboxes] = useState(true);
  const [visibleAngles, setVisibleAngles] = useState<Record<string, boolean>>({
    ankle: true, knee: true, hip: true, shoulder: true, elbow: true, wrist: true,
  });

  const kinematicsData = useMemo(() => {
    if (analysisData.status !== 'success' || !analysisData.time_series_data?.kinematics) {
      return [];
    }
    return analysisData.time_series_data.kinematics;
  }, [analysisData]);

  const jointConfig = {
    ankle: { name: "Ankle", color: "#A78BFA" },
    knee: { name: "Knee", color: "#34D399" },
    hip: { name: "Hip", color: "#FBBF24" },
    shoulder: { name: "Shoulder", color: "#60A5FA" },
    elbow: { name: "Elbow", color: "#FDBA74" },
    wrist: { name: "Wrist", color: "#A5B4FC" },
  };

  const lowerBodyJoints = ['ankle', 'knee', 'hip'];
  const upperBodyJoints = ['wrist', 'elbow', 'shoulder'];
  const jointsToShow = category === 'Lower Body' ? lowerBodyJoints : upperBodyJoints;

  const bestSide = useMemo(() => {
    if (!kinematicsData.length) return 'left';
    let leftVisibility = 0;
    let rightVisibility = 0;
    kinematicsData.forEach(dataPoint => {
      jointsToShow.forEach(joint => {
        if (dataPoint[`left_${joint}_angle`] != null) leftVisibility++;
        if (dataPoint[`right_${joint}_angle`] != null) rightVisibility++;
      });
    });
    return rightVisibility > leftVisibility ? 'right' : 'left';
  }, [kinematicsData, jointsToShow]);

  if (analysisData.status !== 'success' || !analysisData.metrics || !analysisData.reps || !analysisData.scores) {
    // Handle error or loading state
    return <div>Analysis data is incomplete or in an error state.</div>;
  }
  
  const { metrics, reps, scores } = analysisData;

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setVisibleAngles(prevState => ({ ...prevState, [name]: checked }));
  };
  
  // Assuming volume per rep needs to be calculated from time_series_data
  const repDetailsWithVolume = reps.details.map(rep => {
    const repKinematics = kinematicsData.filter(p => p.frame_idx >= rep.start_frame && p.frame_idx <= rep.end_frame);
    const volume = repKinematics.reduce((acc, p) => acc + (p.frame_volume || 0), 0);
    return { ...rep, volume };
  });

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-blue-600 bg-clip-text text-transparent">
          {exercise} Analysis Results
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Here is a comprehensive analysis of your exercise performance.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon={TrendingUp} title="Total Volume" value={metrics.total_volume.value.toFixed(2)} unit={metrics.total_volume.unit} colorClass="text-green-400" gradientFrom="from-gray-800" gradientTo="to-gray-900" />
        <MetricCard icon={Zap} title="Max Power" value={metrics.max_power.value.toFixed(2)} unit={metrics.max_power.unit} colorClass="text-red-400" gradientFrom="from-gray-800" gradientTo="to-gray-900" />
        <MetricCard icon={Clock} title="Time Efficiency" value={`${metrics.time_efficiency.toFixed(2)}%`} colorClass="text-yellow-400" gradientFrom="from-gray-800" gradientTo="to-gray-900" />
        <MetricCard icon={Clock} title="TUT" value={metrics.time_under_tension.toFixed(2)} unit="s" colorClass="text-blue-400" gradientFrom="from-gray-800" gradientTo="to-gray-900" />
        <MetricCard icon={Move} title="TUT Concentric" value={metrics.tut_concentric.toFixed(2)} unit="s" colorClass="text-purple-400" gradientFrom="from-gray-800" gradientTo="to-gray-900" />
        <MetricCard icon={Move} title="TUT Eccentric" value={metrics.tut_eccentric.toFixed(2)} unit="s" colorClass="text-indigo-400" gradientFrom="from-gray-800" gradientTo="to-gray-900" />
        <MetricCard icon={Anchor} title="Eccentric Steadiness" value={scores.eccentric_steadiness.toFixed(2)} unit="%" colorClass="text-teal-400" gradientFrom="from-gray-800" gradientTo="to-gray-900" />
        <MetricCard icon={Award} title="Total Reps" value={reps.total} colorClass="text-pink-400" gradientFrom="from-gray-800" gradientTo="to-gray-900" />
      </div>

      {/* Rep Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <RepChart data={reps.details} dataKey="duration" title="Rep Duration" color="#8884d8" unit="s" />
        <RepChart data={reps.details} dataKey="steadiness_score" title="Rep Steadiness" color="#82ca9d" unit="%" />
        <RepChart data={repDetailsWithVolume} dataKey="volume" title="Rep Volume" color="#ffc658" unit={metrics.total_volume.unit} />
      </div>

      {/* Angle Chart */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 shadow-xl border border-gray-700/50">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">Joint Angle Analysis ({bestSide})</h3>
          <button onClick={() => setShowAngleCheckboxes(!showAngleCheckboxes)} className="text-gray-400 hover:text-white">
            {showAngleCheckboxes ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
        {showAngleCheckboxes && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-2 mb-6">
            {jointsToShow.map((key) => (
              <label key={key} className="flex items-center space-x-2 text-sm text-gray-300 cursor-pointer">
                <input type="checkbox" name={key} checked={visibleAngles[key]} onChange={handleCheckboxChange} className="form-checkbox h-4 w-4 rounded" style={{ accentColor: jointConfig[key as keyof typeof jointConfig].color }} />
                <span style={{ color: jointConfig[key as keyof typeof jointConfig].color }}>{jointConfig[key as keyof typeof jointConfig].name}</span>
              </label>
            ))}
          </div>
        )}
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={kinematicsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis dataKey="time" type="number" stroke="#9CA3AF" style={{ fontSize: '11px' }} domain={['dataMin', 'dataMax']} unit="s" />
              <YAxis stroke="#9CA3AF" style={{ fontSize: '11px' }} unit="°" />
              <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '12px', color: '#F9FAFB' }} />
              <Legend />
              {jointsToShow.map((key) => visibleAngles[key] && (
                <Line key={`${bestSide}-${key}-angle`} type="natural" dataKey={`${bestSide}_${key}_angle`} stroke={jointConfig[key as keyof typeof jointConfig].color} name={`${jointConfig[key as keyof typeof jointConfig].name}`} dot={false} strokeWidth={2} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ExerciseAnalysis;
