// src/app/dashboard/page.tsx
import AppLayout from '@/components/AppLayout';
import ExerciseAnalysis from '@/components/ExerciseAnalysis';
// If you want the Inter font here too, import it. Otherwise, see Step 3.

export const dynamic = 'force-dynamic';

// Mock data for ExerciseAnalysis - replace with your actual data or state later
const mockAnalysisData = {
  status: 'success' as const,
  average_score: 88.5,
  total_reps: 12,
  rep_scores: [
    { total_score: 85, depth_score: 90, velocity_control_score: 80, symmetry_score: 85, stability_score: 85 },
    { total_score: 90, depth_score: 92, velocity_control_score: 88, symmetry_score: 90, stability_score: 90 },
    // Add more mock rep scores if needed
  ],
  feedback: [
    "Great overall form! Keep focusing on consistent depth.",
    "Symmetry looks good, maintain core engagement.",
  ]
};

export default function DashboardPage() {
  return (
    // <div className={inter.className}> {/* If applying Inter font here */}
    <AppLayout>
      <ExerciseAnalysis analysisData={mockAnalysisData} />
    </AppLayout>
    // </div>
  );
}