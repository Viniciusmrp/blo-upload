// src/app/dashboard/page.tsx
import ExerciseAnalysis from '@/components/ExerciseAnalysis';

export const dynamic = 'force-dynamic';

// FIXED: Updated mockAnalysisData to match the new data structure
const mockAnalysisData = {
  status: 'success' as const,
  metrics: {
    total_score: 85,
    intensity_score: 90,
    tut_score: 80,
    volume_score: 88,
    time_under_tension: 35.5,
    volume: 1250,
    volume_unit: 'kg',
  },
  rep_counting: {
    completed_reps: 10,
  },
  tension_windows: [
    { start: 2, end: 4 },
    { start: 6, end: 8 },
    { start: 10, end: 12 },
    { start: 14, end: 16 },
    { start: 18, end: 20 },
  ],
  time_series: [
    { time: 1, left_knee_angle: 150, right_knee_angle: 152, left_hip_angle: 160, right_hip_angle: 161, left_ankle_angle: 95, right_ankle_angle: 96, left_shoulder_angle: 88, right_shoulder_angle: 87, left_elbow_angle: 170, right_elbow_angle: 172, left_wrist_angle: 180, right_wrist_angle: 179, hip_velocity: 0, hip_acceleration: 0, is_concentric: false, phase_intensity: 0, avg_knee_angle: 151, avg_hip_angle: 160.5, avg_ankle_angle: 95.5, avg_shoulder_angle: 87.5, avg_elbow_angle: 171, avg_wrist_angle: 179.5 },
    { time: 2, left_knee_angle: 90, right_knee_angle: 92, left_hip_angle: 100, right_hip_angle: 101, left_ankle_angle: 85, right_ankle_angle: 86, left_shoulder_angle: 85, right_shoulder_angle: 84, left_elbow_angle: 165, right_elbow_angle: 167, left_wrist_angle: 178, right_wrist_angle: 177, hip_velocity: 0.5, hip_acceleration: 0.2, is_concentric: true, phase_intensity: 1.2, avg_knee_angle: 91, avg_hip_angle: 100.5, avg_ankle_angle: 85.5, avg_shoulder_angle: 84.5, avg_elbow_angle: 166, avg_wrist_angle: 177.5 },
    { time: 3, left_knee_angle: 150, right_knee_angle: 152, left_hip_angle: 160, right_hip_angle: 161, left_ankle_angle: 95, right_ankle_angle: 96, left_shoulder_angle: 88, right_shoulder_angle: 87, left_elbow_angle: 170, right_elbow_angle: 172, left_wrist_angle: 180, right_wrist_angle: 179, hip_velocity: 0, hip_acceleration: 0, is_concentric: false, phase_intensity: 0, avg_knee_angle: 151, avg_hip_angle: 160.5, avg_ankle_angle: 95.5, avg_shoulder_angle: 87.5, avg_elbow_angle: 171, avg_wrist_angle: 179.5 },
  ]
};

export default function DashboardPage() {
  return (
    <ExerciseAnalysis analysisData={mockAnalysisData} />
  );
}