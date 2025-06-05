"use client";
import ExerciseAnalysis from './ExerciseAnalysis';
import { useRouter } from "next/navigation";
import React from 'react';
import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import axios from "axios";
import { Oval } from "react-loader-spinner";
// MODIFIED: Added AlertCircle to the import
import { ArrowUp as Arrow, CheckCircle, Upload, Play, BarChart2, AlertCircle } from "lucide-react";
import { generateVideoId } from "../utils/generateVideoId"; // Assuming this path is correct

interface Metrics {
  total_score: number;
  intensity_score: number;
  tut_score: number;
  volume_score: number;
  time_under_tension: number;
  volume: number;
  volume_unit: string;
  // Include other metrics if you need them
  avg_intensity?: number;
  max_intensity?: number;
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
  // Include other time series fields if needed
}

interface AnalysisData {
  status: 'success' | 'error'; // More specific type
  metrics?: Metrics;
  tension_windows?: TensionWindow[];
  time_series?: TimeSeriesDataPoint[];
  error?: string;
}

const NewUpload = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'processing' | 'complete' | 'error'>('idle');
  const [email, setEmail] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [load, setLoad] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [processedVideoUrl, setProcessedVideoUrl] = useState<string | null>(null);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollInterval = useRef<NodeJS.Timeout>();

  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [isPortrait, setIsPortrait] = useState(false);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [selectedFile]);

  useEffect(() => {
    return () => {
      if (pollInterval.current) {
        clearInterval(pollInterval.current);
      }
    };
  }, []);

  const startPollingForProcessing = async (videoName: string) => {
      setUploadStatus('processing');
      const checkStatus = async () => {
        try {
          const response = await axios.get(
            `https://my-flask-app-service-309448793861.us-central1.run.app/video-status/${videoName}`
          );
          if (response.data.status === 'complete') {
            setUploadStatus('complete');
            setProcessedVideoUrl(response.data.processed_url);
            clearInterval(pollInterval.current);
            const videoId = videoName.split('.')[0];
            try {
                const analysisResponse = await axios.get(
                    `https://my-flask-app-service-309448793861.us-central1.run.app/exercise-analysis/${videoId}`
                );
                console.log('RAW Backend Analysis Response:', JSON.stringify(analysisResponse.data, null, 2));

                // The backend response structure now matches what our new ExerciseAnalysis component will expect.
                // We can set it directly, as long as the status is 'success'.
                if (analysisResponse.data.status === 'success') {
                  setAnalysisData(analysisResponse.data);
                } else {
                  // Handle cases where status might not be 'success' but not a full error
                  setAnalysisData({ status: 'error', error: 'Analysis did not complete successfully.' });
                }

            } catch (error) {
                // ... (error handling remains the same)
                setAnalysisData({ status: 'error', error: 'Failed to fetch or process analysis data.' });
            }
          } else if (response.data.status === 'error') {
            setUploadStatus('error');
            setErrorMessage('Video processing failed on the server.');
            clearInterval(pollInterval.current);
          }
        } catch (error) {
          console.error('Error checking video status:', error);
        }
      };
      pollInterval.current = setInterval(checkStatus, 5000);
      checkStatus();
  };

  const handleSubmit = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setUploadStatus('uploading');
    setUploadProgress(0);
    setErrorMessage('');
    setAnalysisData(null);
    setProcessedVideoUrl(null);

    if (!selectedFile) {
      setErrorMessage('No file selected.');
      setUploadStatus('idle');
      return;
    }

    try {
      const uniqueId = generateVideoId();
      const originalFileExtension = selectedFile.name.split('.').pop() || 'mp4';
      const fileName = `${uniqueId}.${originalFileExtension}`;

      await axios.post(
        "https://my-flask-app-service-309448793861.us-central1.run.app/save-video-info",
        { email, weight, height, load, videoName: fileName, isPortrait }
      );

      const response = await axios.post(
        "https://my-flask-app-service-309448793861.us-central1.run.app/generate-signed-url",
        { file_name: fileName, content_type: selectedFile.type }
      );
      const signedUrl = response.data.url;

      await axios.put(signedUrl, selectedFile, {
        headers: { "Content-Type": selectedFile.type },
        onUploadProgress: (progressEvent) => {
          const progress = progressEvent.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0;
          setUploadProgress(progress);
        },
      });
      startPollingForProcessing(fileName);
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      console.error("Error uploading video or saving metadata:", error);
      setErrorMessage('Error uploading video. Please try again.');
      setUploadStatus('error');
    }
  };

  const clearFormDataAndSelection = () => {
    setEmail("");
    setWeight("");
    setHeight("");
    setLoad("");
    handleClearPreview();
    setAnalysisData(null);
    setProcessedVideoUrl(null);
    setUploadStatus('idle');
    setErrorMessage('');
  };

  const handleMediaSelected = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setProcessedVideoUrl(null); 
    setAnalysisData(null);
    setUploadStatus('idle');
    setErrorMessage('');
    setUploadProgress(0);

    if (file) {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        const isPortraitValue = video.videoHeight > video.videoWidth;
        setIsPortrait(isPortraitValue);
        setSelectedFile(file); 
      };
      video.src = URL.createObjectURL(file);
    } else {
      setSelectedFile(null);
    }
  };

  const handleClearPreview = () => {
    setPreviewUrl(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center">
          <h1 className="text-2xl font-bold text-blue-400">Exercise Analysis</h1>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">Upload Your Exercise Video</h2>
                <p className="text-gray-400">Upload your video to analyze your form and technique</p>
              </div>
              <div 
                className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition-colors"
                onClick={handleButtonClick}
              >
                {!selectedFile ? (
                  <>
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-4 text-sm text-gray-400">
                      Click to upload or drag and drop your video
                    </p>
                  </>
                ) : (
                  <div className="space-y-4">
                    <CheckCircle className="mx-auto h-12 w-12 text-green-400" />
                    <p className="text-sm text-gray-400">{selectedFile.name}</p>
                  </div>
                )}
              </div>
              <input
                type="file"
                accept="video/*,video/quicktime,.mov,.qt"
                onChange={handleMediaSelected}
                ref={fileInputRef}
                className="hidden"
              />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm text-gray-400">Email</label>
                  <input
                    id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-700 rounded-lg border border-gray-600 p-2 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="weight" className="text-sm text-gray-400">Weight (kg)</label>
                  <input
                    id="weight" type="text" value={weight} onChange={(e) => setWeight(e.target.value)}
                    className="w-full bg-gray-700 rounded-lg border border-gray-600 p-2 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="height" className="text-sm text-gray-400">Height (cm)</label>
                  <input
                    id="height" type="text" value={height} onChange={(e) => setHeight(e.target.value)}
                    className="w-full bg-gray-700 rounded-lg border border-gray-600 p-2 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="load" className="text-sm text-gray-400">Load (kg)</label>
                  <input
                    id="load" type="text" value={load} onChange={(e) => setLoad(e.target.value)}
                    className="w-full bg-gray-700 rounded-lg border border-gray-600 p-2 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  />
                </div>
              </div>
              <button
                onClick={handleSubmit}
                disabled={!selectedFile || uploadStatus === 'uploading' || uploadStatus === 'processing'}
                className="w-full flex items-center justify-center bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg py-3 px-4 text-white font-medium transition-colors h-12"
              >
                {/* MODIFIED: Simplified loading state check for the spinner */}
                {(uploadStatus === 'uploading' || uploadStatus === 'processing') ? (
                  <Oval
                    height={24} width={24} color="white" visible={true}
                    ariaLabel="oval-loading" secondaryColor="gray" strokeWidth={4} strokeWidthSecondary={4}
                  />
                ) : (
                  'Analyze Video'
                )}
              </button>
              {errorMessage && (
                <p className="text-sm text-red-400 text-center">{errorMessage}</p>
              )}
            </div>
          </div>
          <div className="space-y-6">
            {(previewUrl || processedVideoUrl) && (
              <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold mb-4">
                  {(uploadStatus === 'complete' && processedVideoUrl) ? 'Processed Video' : 'Video Preview'}
                </h3>
                <video
                  src={ (uploadStatus === 'complete' && processedVideoUrl) ? processedVideoUrl : previewUrl || ''}
                  controls className="w-full rounded-lg" key={processedVideoUrl || previewUrl}
                />
              </div>
            )}
            {uploadStatus === 'uploading' && (
              <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-200">Uploading...</span>
                    <span className="text-sm text-gray-400">{uploadProgress}%</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-2 bg-blue-500 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
            {uploadStatus === 'processing' && (
              <div className="bg-gray-800 rounded-xl p-6 shadow-lg flex flex-col items-center justify-center text-center h-40">
                <Oval
                  height={40} width={40} color="#60A5FA" visible={true}
                  ariaLabel="oval-loading" secondaryColor="#374151" strokeWidth={4} strokeWidthSecondary={4}
                />
                <p className="mt-4 text-gray-400">Analyzing your exercise form...</p>
              </div>
            )}
            {uploadStatus === 'complete' && analysisData && analysisData.status === 'success' && (
              <ExerciseAnalysis analysisData={analysisData} />
            )}
            {analysisData && analysisData.status === 'error' && (
               <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
                 <div className="text-red-400 flex items-center gap-2">
                   {/* AlertCircle is now imported and can be used */}
                   <AlertCircle className="h-5 w-5" />
                   <p>Analysis Error: {analysisData.error || 'Failed to load analysis results'}</p>
                 </div>
               </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default NewUpload;