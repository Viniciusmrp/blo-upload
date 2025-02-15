"use client";

import { useRouter } from "next/navigation";
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
import { ArrowUp as Arrow, CheckCircle } from "lucide-react";
import { generateVideoId } from "../utils/generateVideoId";

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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
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

  const [isPortrait, setIsPortrait] = useState(false);  // Add this state at the top

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
    <form onSubmit={handleSubmit} className="border-b border-gray-200">
      <div className="flex items-center justify-between border-b px-4 py-2">
        <div className="flex items-center gap-x-5">
          <button type="button" onClick={handleButtonClick}>
            <Arrow color="#9ca3af" size={20} />
          </button>
          <input
            type="file"
            accept="video/*"
            onChange={handleMediaSelected}
            ref={fileInputRef}
            style={{ display: "none" }}
          />
        </div>

        <div className="self-end">
          <button
            disabled={Boolean(selectedFile === null || isUploading)}
            className="flex h-9 w-24 items-center justify-center rounded-full bg-gradient-to-r from-pink-600 via-red-500 to-[#ff6036] px-4 py-3 text-xs font-medium uppercase text-white disabled:opacity-50"
          >
            {isUploading ? (
              <Oval
                ariaLabel="loading-indicator"
                height={16}
                width={16}
                strokeWidth={5}
                strokeWidthSecondary={2}
                color="white"
                secondaryColor="transparent"
              />
            ) : (
              "Publish"
            )}
          </button>
        </div>
      </div>

      {/* Upload Progress Bar */}
      {uploadStatus === 'uploading' && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-pink-600 to-[#ff6036] h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-2 text-center">
            Uploading... {uploadProgress}%
          </p>
        </div>
      )}

      {/* Processing State */}
      {uploadStatus === 'processing' && (
        <div className="mt-4 text-center">
          <Oval
            ariaLabel="processing-indicator"
            height={24}
            width={24}
            strokeWidth={5}
            strokeWidthSecondary={2}
            color="#ff6036"
            secondaryColor="transparent"
          />
          <p className="text-sm text-gray-600 mt-2">Processing your video...</p>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="flex items-center justify-center gap-2 text-green-600 mt-4">
          <CheckCircle size={16} />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="text-red-600 mt-4 text-center">{errorMessage}</div>
      )}

      {/* Video Preview Section */}
      <div className="relative">
        {uploadStatus === 'complete' && processedVideoUrl ? (
          <div className="mt-4">
            <p>Processed Video:</p>
            <video
              src={processedVideoUrl}
              controls
              className="w-full max-h-[300px]"
            />
          </div>
        ) : previewUrl ? (
          <div className="mt-4">
            <p>Video Preview:</p>
            <video
              src={previewUrl}
              controls
              className="w-full max-h-[300px]"
            />
          </div>
        ) : null}
      </div>

      {/* Form Fields */}
      <div className="space-y-4 mt-4">
        <div className="flex items-center">
          <label htmlFor="emailInput" className="mr-2">Email:</label>
          <input
            type="email"
            id="emailInput"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-1 rounded"
          />
        </div>
        <div className="flex items-center">
          <label htmlFor="weightInput" className="mr-2">Weight:</label>
          <input
            type="text"
            id="weightInput"
            placeholder="Enter weight"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="border p-1 rounded"
          />
        </div>
        <div className="flex items-center">
          <label htmlFor="heightInput" className="mr-2">Height:</label>
          <input
            type="text"
            id="heightInput"
            placeholder="Enter height"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            className="border p-1 rounded"
          />
        </div>
        <div className="flex items-center">
          <label htmlFor="loadInput" className="mr-2">Load:</label>
          <input
            type="text"
            id="loadInput"
            placeholder="Enter load"
            value={load}
            onChange={(e) => setLoad(e.target.value)}
            className="border p-1 rounded"
          />
        </div>
      </div>
    </form>
  );
};

export { NewUpload };

export default NewUpload;