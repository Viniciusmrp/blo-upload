'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { api } from '../../../../utils/api';
import ExerciseAnalysis from '../../../../components/ExerciseAnalysis';
import { useParams } from 'next/navigation';

// Define the structure of the analysis data, assuming it matches what ExerciseAnalysis component expects
interface AnalysisData {
  status: 'success' | 'error';
  metrics?: any;
  reps?: any;
  scores?: any;
  time_series_data?: any;
  error?: string;
  exercise?: string;
  category?: string;
}

const VideoDetailPage = () => {
  const { currentUser } = useAuth();
  const params = useParams();
  const videoId = params.videoId as string;
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      if (!currentUser || !videoId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await api.getExerciseAnalysis(videoId);
        if (data) {
          setAnalysisData(data);
        } else {
          setError('Could not fetch analysis data.');
        }
      } catch (err) {
        console.error("Error fetching exercise analysis:", err);
        setError('Failed to load analysis data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [currentUser, videoId]);

  if (loading) {
    return <div className="text-center text-white p-8">Loading analysis...</div>;
  }

  if (error) {
    return <div className="text-center text-red-400 p-8">{error}</div>;
  }

  if (!analysisData) {
    return <div className="text-center text-gray-400 p-8">No analysis data available for this video.</div>;
  }

  return (
    <div className="text-white p-4 sm:p-6 lg:p-8">
      <ExerciseAnalysis 
        analysisData={analysisData} 
        exercise={analysisData.exercise || 'Exercise'} 
        category={analysisData.category || null} 
      />
    </div>
  );
};

export default VideoDetailPage;
