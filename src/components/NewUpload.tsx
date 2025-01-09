// Updated code to save user input data to Firebase with environment variables

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
import { ArrowUp as Arrow, X } from "lucide-react";
import { getFirestore, collection, setDoc, doc } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { v4 as uuidv4 } from 'uuid';

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const NewUpload = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [email, setEmail] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [load, setLoad] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!selectedFile) return;

    // Create a preview URL for the uploaded video
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);

    // Clean up URL object when the component is unmounted or file changes
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [selectedFile]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsUploading(true);

    if (!selectedFile) return;

    try {
      const uniqueId = uuidv4(); // Generate a unique ID for the video and Firestore document
      const fileName = `${uniqueId}.mp4`; // Ensure unique file name

      const response = await axios.post(
        "https://my-flask-app-service-309448793861.us-central1.run.app/generate-signed-url",
        {
          file_name: fileName,
        }
      );

      const signedUrl = response.data.url;

      await axios.put(signedUrl, selectedFile, {
        headers: {
          "Content-Type": "video/mp4",
        },
      });

      console.log("Video uploaded successfully");

      // Save user data to Firestore with the unique ID
      await setDoc(doc(db, "userVideos", uniqueId), {
        email,
        weight,
        height,
        load,
        videoName: fileName,
        uploadedAt: new Date().toISOString(),
      });

      console.log("Document written with ID: ", uniqueId);

      setIsUploading(false);
      handleClearPreview();

      // Clear fields
      setEmail("");
      setWeight("");
      setHeight("");
      setLoad("");

      // Show success message
      setSuccessMessage("Video uploaded successfully and data saved.");
      setTimeout(() => setSuccessMessage(""), 3000);

      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      console.error("Error uploading video or saving data:", error);
      setIsUploading(false);
    }
  };

  const handleMediaSelected = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] ?? null;
    setSelectedFile(selectedFile);
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
    <form onSubmit={(e) => handleSubmit(e)} className="border-b border-gray-200">
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
            className="flex h-9 w-24 items-center justify-center rounded-full bg-gradient-to-r from-pink-600 via-red-500 to-[#ff6036] px-4 py-3 text-xs font-medium uppercase text-white"
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
      {successMessage && (
        <div className="text-green-600 mt-4">{successMessage}</div>
      )}
      <div className="relative">
        {previewUrl ? (
          <div className="mt-4">
            <p>Video Preview:</p>
            <video
              src={previewUrl}
              controls
              style={{ width: "100%", maxHeight: "300px" }}
            />
          </div>
        ) : null}
      </div>
      <div className="flex items-center mt-4">
        <label htmlFor="emailInput" className="mr-2">Email:</label>
        <input
          type="email"
          id="emailInput"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-1"
        />
      </div>
      <div className="flex items-center mt-4">
        <label htmlFor="weightInput" className="mr-2">Weight:</label>
        <input
          type="text"
          id="weightInput"
          placeholder="Enter weight"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          className="border p-1"
        />
      </div>
      <div className="flex items-center mt-4">
        <label htmlFor="heightInput" className="mr-2">Height:</label>
        <input
          type="text"
          id="heightInput"
          placeholder="Enter height"
          value={height}
          onChange={(e) => setHeight(e.target.value)}
          className="border p-1"
        />
      </div>
      <div className="flex items-center mt-4">
        <label htmlFor="loadInput" className="mr-2">Load:</label>
        <input
          type="text"
          id="loadInput"
          placeholder="Enter load"
          value={load}
          onChange={(e) => setLoad(e.target.value)}
          className="border p-1"
        />
      </div>
    </form>
  );
};

export { NewUpload };

export default NewUpload;
