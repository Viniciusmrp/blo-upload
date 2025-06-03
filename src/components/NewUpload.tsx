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
import { generateVideoId } from "../utils/generateVideoId"; // Assuming this path is correct

interface AnalysisData {
  status: string;
  average_score?: number;
  total_reps?: number;
  rep_scores?: Array<any>;
  feedback?: string[];
  error?: string; // Added error field based on usage in ExerciseAnalysis
}

const NewUpload = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  // Removed isUploading, as uploadStatus covers this
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'processing' | 'complete' | 'error'>('idle');
  const [email, setEmail] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [load, setLoad] = useState("");
  // Removed successMessage as its usage wasn't apparent in the provided code
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
      setPreviewUrl(null); // Clear preview if no file selected
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
            clearInterval(pollInterval.current); // Stop polling for video status

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
                setAnalysisData({ status: 'error', error: 'Failed to fetch analysis data.' });
            }
          } else if (response.data.status === 'error') {
            setUploadStatus('error');
            setErrorMessage('Video processing failed on the server.');
            clearInterval(pollInterval.current);
          }
          // If status is still 'processing', keep polling (interval handles this)
        } catch (error) {
          console.error('Error checking video status:', error);
          // Optionally set an error state here too, or let it keep trying
        }
      };

      pollInterval.current = setInterval(checkStatus, 5000);
      checkStatus(); // Initial check
  };

  const handleSubmit = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    // setIsUploading(true); // Controlled by uploadStatus
    setUploadStatus('uploading');
    setUploadProgress(0);
    setErrorMessage('');
    setAnalysisData(null); // Clear previous analysis on new submit
    setProcessedVideoUrl(null); // Clear previous processed video on new submit

    if (!selectedFile) {
      setErrorMessage('No file selected.');
      setUploadStatus('idle');
      return;
    }

    try {
      const uniqueId = generateVideoId();
      // Ensure the file extension from the original file is used if it's not always mp4
      const originalFileExtension = selectedFile.name.split('.').pop() || 'mp4';
      const fileName = `${uniqueId}.${originalFileExtension}`;


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
        { file_name: fileName, content_type: selectedFile.type } // Pass content type for signed URL
      );

      const signedUrl = response.data.url;

      await axios.put(signedUrl, selectedFile, {
        headers: { "Content-Type": selectedFile.type }, // Use actual file content type
        onUploadProgress: (progressEvent) => {
          const progress = progressEvent.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0;
          setUploadProgress(progress);
        },
      });

      startPollingForProcessing(fileName); // This will set status to 'processing'

      // Don't clear form data here if user might want to re-submit or adjust
      // clearFormData(); 
      
      startTransition(() => {
        router.refresh(); // Consider if this refresh is needed or if UI updates reactively
      });
    } catch (error) {
      console.error("Error uploading video or saving metadata:", error);
      setErrorMessage('Error uploading video. Please try again.');
      setUploadStatus('error');
    }
  };

  const clearFormDataAndSelection = () => { // Renamed for clarity
    setEmail("");
    setWeight("");
    setHeight("");
    setLoad("");
    handleClearPreview(); // This will clear selectedFile and previewUrl
    setAnalysisData(null);
    setProcessedVideoUrl(null);
    setUploadStatus('idle');
    setErrorMessage('');
  };

  const handleMediaSelected = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    
    // Clear previous processed video and analysis data when a new file is selected
    setProcessedVideoUrl(null); 
    setAnalysisData(null);
    setUploadStatus('idle'); // Reset status
    setErrorMessage('');    // Clear previous errors
    setUploadProgress(0); // Reset progress

    if (file) {
      const video = document.createElement('video');
      video.preload = 'metadata';
      
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src); // Revoke object URL after reading metadata
        const isPortraitValue = video.videoHeight > video.videoWidth;
        setIsPortrait(isPortraitValue);
        setSelectedFile(file); 
        // previewUrl is set by useEffect watching selectedFile
      };
      
      video.src = URL.createObjectURL(file);
    } else {
      setSelectedFile(null); // If no file is selected (e.g., user cancels dialog)
    }
  };

  const handleClearPreview = () => {
    setPreviewUrl(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Clears the file input
    }
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white"> {/* Assuming this component might not always be inside AppLayout with its own bg */}
      {/* Header */}
      <header className="border-b border-gray-800">
        {/* MODIFIED: Added text-center to center the h1 */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center">
          <h1 className="text-2xl font-bold text-blue-400">Exercise Analysis</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="space-y-6">
              {/* ... (rest of the form and upload button UI) ... */}
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
                accept="video/*,video/quicktime,.mov,.qt" // Added common Apple formats
                onChange={handleMediaSelected}
                ref={fileInputRef}
                className="hidden"
              />

              {/* Form Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm text-gray-400">Email</label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-700 rounded-lg border border-gray-600 p-2 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="weight" className="text-sm text-gray-400">Weight (kg)</label>
                  <input
                    id="weight"
                    type="text" // Consider type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full bg-gray-700 rounded-lg border border-gray-600 p-2 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="height" className="text-sm text-gray-400">Height (cm)</label>
                  <input
                    id="height"
                    type="text" // Consider type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="w-full bg-gray-700 rounded-lg border border-gray-600 p-2 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="load" className="text-sm text-gray-400">Load (kg)</label>
                  <input
                    id="load"
                    type="text" // Consider type="number"
                    value={load}
                    onChange={(e) => setLoad(e.target.value)}
                    className="w-full bg-gray-700 rounded-lg border border-gray-600 p-2 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  />
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={!selectedFile || uploadStatus === 'uploading' || uploadStatus === 'processing'}
                className="w-full flex items-center justify-center bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg py-3 px-4 text-white font-medium transition-colors h-12" // Added h-12 for consistent height
              >
                {/* MODIFIED: Unified loading state check */}
                {(uploadStatus === 'uploading' || uploadStatus === 'processing') && uploadStatus !== 'complete' && uploadStatus !== 'error' && uploadStatus !== 'idle' ? (
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
              {errorMessage && (
                <p className="text-sm text-red-400 text-center">{errorMessage}</p>
              )}
            </div>
          </div>

          {/* Preview & Analysis Section */}
          <div className="space-y-6">
            {/* Video Preview - shows selected file preview OR processed video */}
            {(previewUrl || processedVideoUrl) && (
              <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold mb-4">
                  {/* Show "Processed Video" only if it's truly processed and available */}
                  {uploadStatus === 'complete' && processedVideoUrl ? 'Processed Video' : 'Video Preview'}
                </h3>
                <video
                  // Prioritize processedVideoUrl if available and status is complete, otherwise show previewUrl
                  src={ (uploadStatus === 'complete' && processedVideoUrl) ? processedVideoUrl : previewUrl || ''}
                  controls
                  className="w-full rounded-lg"
                  key={processedVideoUrl || previewUrl} // Add key to force re-render if src changes
                />
              </div>
            )}
            
            {/* Upload Progress - specific display */}
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

            {/* Processing State - specific display, centered */}
            {uploadStatus === 'processing' && (
              <div className="bg-gray-800 rounded-xl p-6 shadow-lg flex flex-col items-center justify-center text-center h-40"> {/* Added flex for centering spinner */}
                <Oval
                  height={40}
                  width={40}
                  color="#60A5FA" // Tailwind blue-400
                  visible={true}
                  ariaLabel="oval-loading"
                  secondaryColor="#374151" // Tailwind gray-700
                  strokeWidth={4}
                  strokeWidthSecondary={4}
                />
                <p className="mt-4 text-gray-400">Analyzing your exercise form...</p>
              </div>
            )}

            {/* Analysis Results */}
            {/* Only show analysis if status is complete and analysisData is successfully populated */}
            {uploadStatus === 'complete' && analysisData && analysisData.status === 'success' && (
              <ExerciseAnalysis analysisData={analysisData} />
            )}
            {/* Show error from analysisData if present */}
            {analysisData && analysisData.status === 'error' && (
               <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
                 <div className="text-red-400 flex items-center gap-2">
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