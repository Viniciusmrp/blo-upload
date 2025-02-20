import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

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
  if (!analysisData || analysisData.status !== 'success') return null;

  const { average_score, total_reps, rep_scores, feedback } = analysisData;

  // Prepare data for the chart
  const chartData = rep_scores?.map((score, index) => ({
    name: `Rep ${index + 1}`,
    ...score
  }));

  return (
    <div className="mt-8 p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Squat Analysis Results</h2>
      
      {/* Overall Scores */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-500">Overall Score</h3>
          <p className="text-2xl font-bold text-blue-600">
            {average_score?.toFixed(1)}/100
          </p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-500">Total Reps</h3>
          <p className="text-2xl font-bold text-green-600">{total_reps}</p>
        </div>
      </div>

      {/* Rep Scores Chart */}
      {chartData && chartData.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-4">Rep Performance</h3>
          <div className="w-full h-64">
            <LineChart
              width={500}
              height={200}
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="depth_score" stroke="#8884d8" name="Depth" />
              <Line type="monotone" dataKey="velocity_control_score" stroke="#82ca9d" name="Control" />
              <Line type="monotone" dataKey="symmetry_score" stroke="#ffc658" name="Symmetry" />
            </LineChart>
          </div>
        </div>
      )}

      {/* Feedback Section */}
      {feedback && feedback.length > 0 && (
        <div className="p-4 bg-yellow-50 rounded-lg">
          <h3 className="text-lg font-medium mb-2">Form Feedback</h3>
          <ul className="list-disc pl-5 space-y-2">
            {feedback.map((item, index) => (
              <li key={index} className="text-gray-700">{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ExerciseAnalysis;