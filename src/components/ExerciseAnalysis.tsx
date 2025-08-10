"use client";
import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Award, Zap, Clock, BarChart, AlertCircle, Activity, ChevronDown, ChevronUp } from 'lucide-react';

// Updated interfaces to match the new JSON structure
interface Scores {
  overall: number;
  intensity: number;
  tut: number;
  volume: number;
}

interface Reps {
  total: number;
  avg_duration: number;
  details: any[];
}

interface TotalVolume {
  value: number;
  unit: string;
}

interface Metrics {
  time_under_tension: number;
  time_efficiency: number;
  total_volume: TotalVolume;
  max_intensity: number;
  avg_intensity: number;
}

interface TimeSeriesDataPoint {
  time: number;
  left_ankle_angle: number;
  left_ankle_velocity: number;
  left_ankle_acceleration: number;
  right_ankle_angle: number;
  right_ankle_velocity: number;
  right_ankle_acceleration: number;
  left_knee_angle: number;
  left_knee_velocity: number;
  left_knee_acceleration: number;
  right_knee_angle: number;
  right_knee_velocity: number;
  right_knee_acceleration: number;
  left_hip_angle: number;
  left_hip_velocity: number;
  left_hip_acceleration: number;
  right_hip_angle: number;
  right_hip_velocity: number;
  right_hip_acceleration: number;
  left_shoulder_angle: number;
  left_shoulder_velocity: number;
  left_shoulder_acceleration: number;
  right_shoulder_angle: number;
  right_shoulder_velocity: number;
  right_shoulder_acceleration: number;
  left_elbow_angle: number;
  left_elbow_velocity: number;
  left_elbow_acceleration: number;
  right_elbow_angle: number;
  right_elbow_velocity: number;
  right_elbow_acceleration: number;
  left_wrist_angle: number;
  left_wrist_velocity: number;
  left_wrist_acceleration: number;
  right_wrist_angle: number;
  right_wrist_velocity: number;
  right_wrist_acceleration: number;
  hip_height: number;
  hip_velocity: number;
  hip_acceleration: number;
}

interface TimeSeriesData {
  kinematics: TimeSeriesDataPoint[];
}

interface AnalysisData {
  status: 'success' | 'error';
  scores?: Scores;
  reps?: Reps;
  metrics?: Metrics;
  time_series_data?: TimeSeriesData;
  error?: string;
}

interface ExerciseAnalysisProps {
  analysisData: AnalysisData;
  exercise: string | null;
  category: string | null;
}

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

interface IndividualChartProps {
    title: string;
    data: any[];
    dataKey: string;
    color: string;
    unit: string;
}

const IndividualChart: React.FC<IndividualChartProps> = ({ title, data, dataKey, color, unit }) => (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 shadow-xl border border-gray-700/50">
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-2 bg-gray-700 rounded-lg`}>
          <Activity className={`h-5 w-5`} style={{ color }} />
        </div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
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
              stroke={color}
              style={{ fontSize: '11px' }}
              unit={unit}
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
              type="natural"
              dataKey={dataKey}
              stroke={color}
              name={title}
              dot={false}
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
);

const ExerciseAnalysis: React.FC<ExerciseAnalysisProps> = ({ analysisData, exercise, category }) => {
  const [showAngleCheckboxes, setShowAngleCheckboxes] = useState(true);

  const { scores, reps, metrics, time_series_data, error } = analysisData;

  const kinematicsData = useMemo(() => {
    if (analysisData.status !== 'success' || !time_series_data?.kinematics) {
      return [];
    }
    return time_series_data.kinematics;
  }, [analysisData, time_series_data]);

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
        if (dataPoint[`left_${joint}_angle` as keyof TimeSeriesDataPoint] != null) leftVisibility++;
        if (dataPoint[`right_${joint}_angle` as keyof TimeSeriesDataPoint] != null) rightVisibility++;
      });
    });
    return rightVisibility > leftVisibility ? 'right' : 'left';
  }, [kinematicsData, jointsToShow]);

  const [visibleAngles, setVisibleAngles] = useState<Record<string, boolean>>({
    ankle: true, knee: true, hip: true, shoulder: true, elbow: true, wrist: true,
  });

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>, setVisible: React.Dispatch<React.SetStateAction<Record<string, boolean>>>) => {
    const { name, checked } = event.target;
    setVisible(prevState => ({ ...prevState, [name]: checked }));
  };

  if (analysisData.status !== 'success' || !scores || !reps || !metrics || !time_series_data) {
    return (
      <div className="bg-gradient-to-br from-red-900/20 to-red-800/20 rounded-xl p-6 shadow-lg border border-red-500/30 backdrop-blur-sm">
        <div className="text-red-400 flex items-center gap-3">
          <div className="p-2 bg-red-500/20 rounded-lg"><AlertCircle className="h-6 w-6 flex-shrink-0" /></div>
          <div>
            <p className="font-semibold text-lg">Analysis Error</p>
            <p className="text-sm text-red-300 opacity-90">{error || 'Analysis data is incomplete.'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-blue-600 bg-clip-text text-transparent">
          {exercise} Analysis Results
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Comprehensive analysis of your exercise performance with detailed metrics and insights
        </p>
        <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <ScoreCard icon={Award} title="Overall Score" score={scores.overall} unit="/100" colorClass="text-blue-400" gradientFrom="from-blue-500" gradientTo="to-blue-600" />
        <ScoreCard icon={Zap} title="Intensity Score" score={scores.intensity} unit="/100" colorClass="text-red-400" gradientFrom="from-red-500" gradientTo="to-red-600" />
        <ScoreCard icon={Clock} title="TUT Score" score={scores.tut} unit="/100" secondaryValue={metrics.time_under_tension} secondaryUnit="s" colorClass="text-yellow-400" gradientFrom="from-yellow-500" gradientTo="to-yellow-600" />
        <ScoreCard icon={BarChart} title="Volume Score" score={scores.volume} unit="/100" secondaryValue={metrics.total_volume.value} secondaryUnit={metrics.total_volume.unit} colorClass="text-green-400" gradientFrom="from-green-500" gradientTo="to-green-600" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 shadow-xl border border-gray-700/50 text-center group hover:shadow-2xl transition-all duration-300">
          <div className="p-3 bg-purple-500/20 rounded-lg w-fit mx-auto mb-3 group-hover:bg-purple-500/30 transition-colors"><Activity className="h-8 w-8 text-purple-400" /></div>
          <p className="text-3xl font-bold text-white mb-1">{reps.total}</p>
          <p className="text-sm text-gray-400">Total Repetitions</p>
        </div>
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 shadow-xl border border-gray-700/50 text-center group hover:shadow-2xl transition-all duration-300">
          <div className="p-3 bg-indigo-500/20 rounded-lg w-fit mx-auto mb-3 group-hover:bg-indigo-500/30 transition-colors"><Clock className="h-8 w-8 text-indigo-400" /></div>
          <p className="text-3xl font-bold text-white mb-1">{reps.avg_duration.toFixed(1)}s</p>
          <p className="text-sm text-gray-400">Avg Rep Duration</p>
        </div>
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 shadow-xl border border-gray-700/50 text-center group hover:shadow-2xl transition-all duration-300">
          <div className="p-3 bg-orange-500/20 rounded-lg w-fit mx-auto mb-3 group-hover:bg-orange-500/30 transition-colors"><Zap className="h-8 w-8 text-orange-400" /></div>
          <p className="text-3xl font-bold text-white mb-1">{metrics.time_efficiency.toFixed(1)}%</p>
          <p className="text-sm text-gray-400">Time Efficiency</p>
        </div>
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
                <input type="checkbox" name={key} checked={visibleAngles[key]} onChange={(e) => handleCheckboxChange(e, setVisibleAngles)} className="form-checkbox h-4 w-4 rounded" style={{ accentColor: jointConfig[key as keyof typeof jointConfig].color }} />
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
        
      {/* Velocity and Acceleration Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {jointsToShow.map((key) => (
          <IndividualChart
            key={`${key}-velocity`}
            title={`${jointConfig[key as keyof typeof jointConfig].name} Velocity`}
            data={kinematicsData}
            dataKey={`${bestSide}_${key}_velocity`}
            color={jointConfig[key as keyof typeof jointConfig].color}
            unit="m/s"
          />
        ))}
        {jointsToShow.map((key) => (
          <IndividualChart
            key={`${key}-acceleration`}
            title={`${jointConfig[key as keyof typeof jointConfig].name} Acceleration`}
            data={kinematicsData}
            dataKey={`${bestSide}_${key}_acceleration`}
            color={jointConfig[key as keyof typeof jointConfig].color}
            unit="m/s²"
          />
        ))}
      </div>
    </div>
  );
};

export default ExerciseAnalysis;