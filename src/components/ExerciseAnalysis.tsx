import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Award, Target, Activity, AlertCircle } from 'lucide-react';

interface AnalysisData {
  status: string;
  average_score?: number;
  total_reps?: number;
  rep_scores?: Array<{
    total_score: number;
    depth_score: number;
    velocity_control_score: number;
    symmetry_score: number;
    stability_score: number;
  }>;
  feedback?: string[];
}

interface ExerciseAnalysisProps {
  analysisData: AnalysisData;
}

const ExerciseAnalysis: React.FC<ExerciseAnalysisProps> = ({ analysisData }) => {
  // Temporary debug render to see if component is receiving props
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
      </div>
    );
  }

  const { average_score, total_reps, rep_scores, feedback } = analysisData;
  
  // Log destructured values
  console.log('Destructured values:', { 
    average_score, 
    total_reps, 
    rep_scores: rep_scores?.length, 
    feedback: feedback?.length 
  });

  const chartData = rep_scores?.map((score, index) => ({
    name: `Rep ${index + 1}`,
    ...score
  }));

  return (
    <div className="space-y-6">
      {/* Score Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center space-x-4">
            <Award className="h-8 w-8 text-blue-400" />
            <div>
              <p className="text-sm text-gray-400">Overall Score</p>
              <p className="text-2xl font-bold text-blue-400">
                {average_score?.toFixed(1)}/100
              </p>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center space-x-4">
            <Activity className="h-8 w-8 text-green-400" />
            <div>
              <p className="text-sm text-gray-400">Total Reps</p>
              <p className="text-2xl font-bold text-green-400">{total_reps}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Chart */}
      {chartData && chartData.length > 0 && (
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-white mb-6">Rep Performance</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="name" 
                  stroke="#9CA3AF"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#9CA3AF"
                  style={{ fontSize: '12px' }}
                  domain={[0, 100]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#F3F4F6'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="depth_score" 
                  stroke="#60A5FA" 
                  name="Depth"
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="velocity_control_score" 
                  stroke="#34D399" 
                  name="Control"
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="symmetry_score" 
                  stroke="#FBBF24" 
                  name="Symmetry"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Feedback Section */}
      {feedback && feedback.length > 0 && (
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center space-x-3 mb-4">
            <AlertCircle className="h-6 w-6 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Form Feedback</h3>
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