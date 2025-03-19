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

interface AnalysisData {
  status: string;
  message?: string;
  metrics?: any;
  time_series?: any[];
  feedback?: string[];
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
              console.log('Raw analysis response:', analysisResponse);
              
              // Validate and process the response data before setting state
              if (analysisResponse.data && analysisResponse.data.status === 'success') {
                  // Make sure all expected properties exist to prevent rendering errors
                  const processedData = {
                      ...analysisResponse.data,
                      metrics: {
                          ...analysisResponse.data.metrics,
                          // Ensure volume data exists
                          volume: {
                              total_kg: parseFloat(analysisResponse.data.metrics?.volume?.total_kg || 0),
                              score: parseFloat(analysisResponse.data.metrics?.volume?.score || 0)
                          },
                          // Ensure intensity data exists
                          intensity: {
                              concentric_acceleration: parseFloat(analysisResponse.data.metrics?.intensity?.concentric_acceleration || 0),
                              eccentric_acceleration: parseFloat(analysisResponse.data.metrics?.intensity?.eccentric_acceleration || 0),
                              control_ratio: parseFloat(analysisResponse.data.metrics?.intensity?.control_ratio || 0),
                              score: parseFloat(analysisResponse.data.metrics?.intensity?.score || 0)
                          }
                      }
                  };
                  
                  console.log('Processed analysis data:', processedData);
                  setAnalysisData(processedData);
              } else {
                  console.error('Invalid analysis response format:', analysisResponse.data);
                  setAnalysisData({
                      status: 'error',
                      message: 'Invalid analysis data received from server'
                  });
              }
          } catch (error) {
              console.error('Error fetching analysis. Video ID:', videoId, error);
              if (axios.isAxiosError(error)) {
                  console.error('Response data:', error.response?.data);
                  console.error('Response status:', error.response?.status);
              }
              setAnalysisData({
                  status: 'error',
                  message: 'Failed to fetch analysis data'
              });
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
    <div className="w-full max-w-4xl mx-auto px-4">
      {/* Upload Section - Centered */}
      <div className="mb-8">
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-white mb-2">Upload Your Exercise Video</h2>
          <p className="text-gray-400">Upload your video to analyze your form and technique</p>
        </div>

        <div 
          className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition-colors mb-6"
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
          accept="video/*"
          onChange={handleMediaSelected}
          ref={fileInputRef}
          className="hidden"
        />

        {/* Form Fields - Grid for smaller fields */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg py-3 px-4 text-white font-medium transition-colors"
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

      {/* Upload Progress & Processing Section */}
      {uploadStatus === 'uploading' && (
        <div className="mb-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-white">Uploading...</span>
              <span className="text-sm text-gray-400">{uploadProgress}%</span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full">
              <div
                className="h-2 bg-blue-500 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Processing State */}
      {uploadStatus === 'processing' && (
        <div className="text-center mb-8">
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

      {/* Video Preview Section - Below Upload */}
      {(previewUrl || processedVideoUrl) && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">
            {uploadStatus === 'complete' ? 'Processed Video' : 'Video Preview'}
          </h3>
          <div className="w-full flex justify-center">
            <video
              src={processedVideoUrl || previewUrl || ''}
              controls
              className="w-full max-w-2xl rounded-lg"
            />
          </div>
        </div>
      )}

      {/* Analysis Results Section - Below Video */}
      {uploadStatus === 'complete' && analysisData && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Exercise Analysis</h3>
          <ExerciseAnalysis analysisData={analysisData} />
        </div>
      )}

      {/* Error Messages */}
      {errorMessage && (
        <div className="p-4 bg-red-900/30 border border-red-700 rounded-lg mb-8">
          <p className="text-red-400">{errorMessage}</p>
        </div>
      )}
    </div>
  );
};

export default NewUpload;