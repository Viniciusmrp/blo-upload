// src/app/dashboard/page.tsx
import ExerciseAnalysis from '@/components/ExerciseAnalysis';

export const dynamic = 'force-dynamic';

const mockAnalysisData = {
  status: 'success' as const,
  metrics: {
    total_score: 0,
    intensity_score: 0,
    tut_score: 0,
    volume_score: 0,
    time_under_tension: 0,
    volume: 0,
    volume_unit: 'kg',
    completed_reps: 0,
  },
  tension_windows: [
    { start: 2, end: 4 },
    { start: 6, end: 8 },
  ],
  time_series: [
    { time: 1, angle: 160, hip_velocity: 0, hip_acceleration: 0 },
    { time: 2, angle: 90, hip_velocity: 0.5, hip_acceleration: 0.2 },
  ]
};

export default function DashboardPage() {
  // No AppLayout wrapper needed here anymore
  return (
    <ExerciseAnalysis analysisData={mockAnalysisData} />
  );
}