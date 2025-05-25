// app/page.tsx
import AppLayout from '@/components/AppLayout'; // Adjust path if necessary
import ExerciseAnalysis from '@/components/ExerciseAnalysis'; // Adjust path if necessary
import { Inter } from "next/font/google";

// If you're using the Inter font globally via globals.css or layout.tsx, you might not need this here.
// Otherwise, ensure it's applied. For this example, I'm assuming it's handled.
// const inter = Inter({ subsets: ["latin"] });

// Mock data for ExerciseAnalysis - replace with your actual data fetching logic
const mockAnalysisData = {
  status: 'success' as const, // Use 'as const' for string literal types
  average_score: 88.5,
  total_reps: 12,
  rep_scores: [
    { total_score: 85, depth_score: 90, velocity_control_score: 80, symmetry_score: 85, stability_score: 85 },
    { total_score: 90, depth_score: 92, velocity_control_score: 88, symmetry_score: 90, stability_score: 90 },
    { total_score: 82, depth_score: 85, velocity_control_score: 75, symmetry_score: 80, stability_score: 88 },
    { total_score: 91, depth_score: 93, velocity_control_score: 90, symmetry_score: 89, stability_score: 92 },
    { total_score: 89, depth_score: 90, velocity_control_score: 88, symmetry_score: 90, stability_score: 88 },
    { total_score: 92, depth_score: 94, velocity_control_score: 91, symmetry_score: 92, stability_score: 91 },
    { total_score: 87, depth_score: 88, velocity_control_score: 85, symmetry_score: 88, stability_score: 87 },
    { total_score: 85, depth_score: 86, velocity_control_score: 82, symmetry_score: 85, stability_score: 87 },
    { total_score: 90, depth_score: 91, velocity_control_score: 89, symmetry_score: 90, stability_score: 90 },
    { total_score: 88, depth_score: 89, velocity_control_score: 87, symmetry_score: 88, stability_score: 88 },
    { total_score: 93, depth_score: 95, velocity_control_score: 92, symmetry_score: 93, stability_score: 92 },
    { total_score: 86, depth_score: 87, velocity_control_score: 84, symmetry_score: 86, stability_score: 87 },
  ],
  feedback: [
    "Great overall form! Keep focusing on consistent depth.",
    "Symmetry looks good, maintain core engagement.",
    "Velocity control is excellent during the concentric phase."
  ]
};

// This is your main page component for the `/` route
export default function ExerciseDashboardPage() {
  return (
    // The AppLayout will provide the sidebar and overall page structure
    // The Inter font class can be applied to a higher-level element if not already globally applied
    // For example, in your root layout.tsx: <body className={inter.className}>
    <AppLayout>
      {/* The ExerciseAnalysis component will be rendered in the main content area of AppLayout */}
      <ExerciseAnalysis analysisData={mockAnalysisData} />
    </AppLayout>
  );
}
