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

const NewUpload = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [email, setEmail] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [load, setLoad] = useState("");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!selectedFile) return;

    if (previewUrl?.startsWith("data:video/")) {
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  }, [selectedFile, previewUrl]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsUploading(true);

    if (!selectedFile) return;

    try {
      // Step 1: Get signed URL from backend
      const response = await axios.post(
        "https://my-flask-app-service-309448793861.us-central1.run.app/generate-signed-url",
        {
          file_name: selectedFile.name,
        }
      );

      const signedUrl = response.data.url;

      // Step 2: Upload video to Google Cloud Storage using signed URL
      await axios.put(signedUrl, selectedFile, {
        headers: {
          "Content-Type": selectedFile.type,
        },
      });

      console.log("Video uploaded successfully");

      setIsUploading(false);
      handleClearPreview();

      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      console.error("Error uploading video:", error);
      setIsUploading(false);
    }
  };

  const handleMediaSelected = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] ?? null;
    setSelectedFile(selectedFile);
  };

  const handleClearPreview = () => {
    setPreviewUrl(null);
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
      <div className="relative">
        {previewUrl ? (
          <button
            className="absolute top-2 right-2 z-10"
            onClick={handleClearPreview}
          >
            <X color="#9ca3af" size={20} />
          </button>
        ) : null}
        {previewUrl && (
          <div>
            {previewUrl.startsWith("data:video/") && (
              <video src={previewUrl} controls style={{ maxWidth: "100%" }} />
            )}
          </div>
        )}
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
