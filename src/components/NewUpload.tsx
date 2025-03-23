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
import { ArrowUp as Arrow, CheckCircle, Upload, Play, BarChart2 } from "lucide-react";
import { generateVideoId } from "../utils/generateVideoId";

interface TimeSeriesPoint {
  time: number;
  angle: number;
  hip_height: number;
  hip_velocity: number;
  hip_acceleration: number;
  phase_intensity: number;
  is_concentric: boolean;
  accumulated_volume: number;
}

interface VolumePoint {
  time: number;
  volume: number;
}

interface TensionWindow {
  start: number;
  end: number;
}

interface AnalysisMetrics {
  volume: number;
  volume_unit: string;
  max_intensity: number;
  avg_intensity: number;
  time_under_tension: number;
}

interface AnalysisData {
  status: string;
  metrics?: AnalysisMetrics;
  time_series?: TimeSeriesPoint[];
  volume_progression?: VolumePoint[];
  tension_windows?: TensionWindow[];
}

const NewUpload = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'processing' | 'complete' | 'error'>('idle');
  const [email, setEmail] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [load, setLoad] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [processedVideoUrl, setProcessedVideoUrl] = useState<string | null>(null);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollInterval = useRef<NodeJS.Timeout>();

  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);

  useEffect(() => {
    if (!selectedFile) return;

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

            const videoId = videoName.split('.')[0];
            console.log('Original video name:', videoName);
            console.log('Extracted video ID for analysis fetch:', videoId);
            
            try {
                const analysisResponse = await axios.get(
                    `https://my-flask-app-service-309448793861.us-central1.run.app/exercise-analysis/${videoId}`
                );
                console.log('Analysis response for ID:', videoId, analysisResponse.data);
                setAnalysisData(analysisResponse.data);
            } catch (error) {
                console.error('Error fetching analysis. Video ID:', videoId, error);
                if (axios.isAxiosError(error)) {
                    console.error('Response data:', error.response?.data);
                    console.error('Response status:', error.response?.status);
                }
            }

            clearInterval(pollInterval.current);
          } else if (response.data.status === 'error') {
            setUploadStatus('error');
            setErrorMessage('Video processing failed');
            clearInterval(pollInterval.current);
          }
        } catch (error) {
          console.error('Error checking video status:', error);
        }
      };

      // Poll every 5 seconds
      pollInterval.current = setInterval(checkStatus, 5000);
      // Initial check
      checkStatus();
  };

  const handleSubmit = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setIsUploading(true);
    setUploadStatus('uploading');
    setUploadProgress(0);
    setErrorMessage('');

    if (!selectedFile) {
      setErrorMessage('No file selected.');
      setIsUploading(false);
      return;
    }

    try {
      const uniqueId = generateVideoId();
      const fileName = `${uniqueId}.mp4`;

      await axios.post(
        "https://my-flask-app-service-309448793861.us-central1.run.app/save-video-info",
        {
          email,
          weight,
          height,
          load,
          videoName: fileName,
          isPortrait
        }
      );

      const response = await axios.post(
        "https://my-flask-app-service-309448793861.us-central1.run.app/generate-signed-url",
        { file_name: fileName }
      );

      const signedUrl = response.data.url;

      await axios.put(signedUrl, selectedFile, {
        headers: { "Content-Type": "video/mp4" },
        onUploadProgress: (progressEvent) => {
          const progress = progressEvent.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0;
          setUploadProgress(progress);
        },
      });

      // Start polling for processing status
      startPollingForProcessing(fileName);

      setIsUploading(false);
      clearFormData();
      
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      console.error("Error uploading video or saving metadata:", error);
      setErrorMessage('Error uploading video. Please try again.');
      setIsUploading(false);
      setUploadStatus('error');
    }
  };

  const clearFormData = () => {
    setEmail("");
    setWeight("");
    setHeight("");
    setLoad("");
    handleClearPreview();
  };

  const [isPortrait, setIsPortrait] = useState(false);

  const handleMediaSelected = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (file) {
      const video = document.createElement('video');
      video.preload = 'metadata';
      
      video.onloadedmetadata = () => {
        const isPortrait = video.videoHeight > video.videoWidth;
        setIsPortrait(isPortrait);
        setSelectedFile(file);
        URL.revokeObjectURL(video.src);
      };
      
      video.src = URL.createObjectURL(file);
    }
    setUploadStatus('idle');
    setErrorMessage('');
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
    <div className="w-full">
      {/* Upload Form Section */}
      <div className="mb-8">
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-white mb-2">Upload Your Exercise Video</h2>
          <p className="text-gray-400">Upload your video to analyze your form and technique</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Video Upload Box */}
          <div 
            className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition-colors h-64 flex items-center justify-center"
            onClick={handleButtonClick}
          >
            {!selectedFile ? (
              <>
                <div className="space-y-4">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="text-sm text-gray-400">
                    Click to upload or drag and drop your video
                  </p>
                </div>
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
            accept="video/*"
            onChange={handleMediaSelected}
            ref={fileInputRef}
            className="hidden"
          />

          {/* Form Fields */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-800 rounded-lg border border-gray-700 p-2 text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Weight (kg)</label>
                <input
                  type="text"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full bg-gray-800 rounded-lg border border-gray-700 p-2 text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Height (cm)</label>
                <input
                  type="text"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="w-full bg-gray-800 rounded-lg border border-gray-700 p-2 text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Load (kg)</label>
                <input
                  type="text"
                  value={load}
                  onChange={(e) => setLoad(e.target.value)}
                  className="w-full bg-gray-800 rounded-lg border border-gray-700 p-2 text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!selectedFile || isUploading}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg py-3 px-4 text-white font-medium transition-colors mt-4"
            >
              {isUploading ? (
                <Oval
                  height={24}
                  width={24}
                  color="white"
                  visible={true}
                  ariaLabel="oval-loading"
                  secondaryColor="gray"
                  strokeWidth={4}
                  strokeWidthSecondary={4}
                />
              ) : (
                'Analyze Video'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Video Preview & Analysis Results */}
      <div className="space-y-6">
        {/* Upload Progress */}
        {uploadStatus === 'uploading' && (
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-white">Uploading...</span>
              <span className="text-sm text-gray-400">{uploadProgress}%</span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full mt-2">
              <div
                className="h-2 bg-blue-500 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Processing State */}
        {uploadStatus === 'processing' && (
          <div className="text-center my-8">
            <Oval
              height={40}
              width={40}
              color="#60A5FA"
              visible={true}
              ariaLabel="oval-loading"
              secondaryColor="#1F2937"
              strokeWidth={4}
              strokeWidthSecondary={4}
            />
            <p className="mt-4 text-gray-400">Analyzing your exercise form...</p>
          </div>
        )}

        {/* Video Preview - Now below the form fields */}
        {(processedVideoUrl || previewUrl) && uploadStatus !== 'processing' && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">
              {uploadStatus === 'complete' ? 'Analyzed Video' : 'Video Preview'}
            </h3>
            <video
              src={processedVideoUrl || previewUrl || ''}
              controls
              className="w-full rounded-lg"
            />
          </div>
        )}

        {/* Analysis Results - Below the video */}
        {uploadStatus === 'complete' && analysisData && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Exercise Analysis</h3>
            <ExerciseAnalysis analysisData={analysisData} />
          </div>
        )}
      </div>
    </div>
  );
};

export default NewUpload;