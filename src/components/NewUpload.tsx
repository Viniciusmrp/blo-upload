"use client";

import { useRouter } from "next/navigation";
import {
  ChangeEvent,
  Dispatch,
  FormEvent,
  forwardRef,
  SetStateAction,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";

import { Uppy } from "@uppy/core";
import Tus from "@uppy/tus";
import ProgressBar from "@uppy/progress-bar";
import "@uppy/progress-bar/dist/style.min.css";
import { generateVideoId } from "@/utils/generateVideoId";
import { Oval } from "react-loader-spinner";
import { Circle, HelpCircle, Image as ImageIcon, X } from "lucide-react";

const uppy = new Uppy({ debug: true, autoProceed: true });

export function NewUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [IsUploading, setIsUploading] = useState(false);

  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    if (!selectedFile) return;

    if (previewUrl?.startsWith("data:video/")) {
      uppy.addFile({
        name: generateVideoId(),
        type: selectedFile.type,
        data: selectedFile,
        meta: {
          name: selectedFile.name,
        },
      });
    }
  }, [selectedFile, previewUrl]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsUploading(true);

    if (previewUrl?.startsWith("data:video/")) {
      if (!selectedFile) return;

      try {
        uppy
          .use(Tus, {
            endpoint: `/api/cloudflare/video-upload`,
            chunkSize: 150 * 1024 * 1024,
          })
          .use(ProgressBar, {
            target: ".for-ProgressBar",
            hideAfterFinish: false,
          })
          .on("complete", async (result) => {
            const { successful } = result;
            const uploadedFile = successful[0];
            uppy.removeFile(uploadedFile.id);
            console.log("Uploaded video:", uploadedFile);

            await fetch(`${window.location.origin}/api/new-post`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                data: {
                  type: "postWithSmallVideo",
                  videoId: uploadedFile.name,
                },
              }),
            });

            // Save the video URL and other required data to your backend
            // ...

            setIsUploading(false);
            handleClearPreview();

            startTransition(() => {
              // Refresh the current route:
              // - Makes a new request to the server for the route
              // - Re-fetches data requests and re-renders Server Components
              // - Sends the updated React Server Component payload to the client
              // - The client merges the payload without losing unaffected
              //   client-side React state or browser state
              router.refresh();

              // Note: If fetch requests are cached, the updated data will
              // produce the same result.
            });
          });

        await uppy.upload();
      } catch (error) {
        console.error("ERROR", error);
        setSelectedFile(null);
      }
    }
  }

  const handleMediaSelected = (file: File | null) => {
    setSelectedFile(file);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

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
    <form
      onSubmit={(e) => handleSubmit(e)}
      className="border-b border-gray-200"
    >
      <div className="flex items-center justify-between border-b px-4 py-2">
        <div className="flex items-center gap-x-5">
          <MediaInput
            handleButtonClick={handleButtonClick}
            ref={fileInputRef}
            onSelected={handleMediaSelected}
            setPreviewUrl={setPreviewUrl}
          />
        </div>

        <div className="self-end">
          <button
            disabled={Boolean(selectedFile === null || IsUploading)}
            className="flex h-9 w-24 items-center justify-center rounded-full bg-gradient-to-r from-pink-600 via-red-500 to-[#ff6036] px-4 py-3 text-xs font-medium uppercase text-white"
          >
            {IsUploading ? (
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
              "Publicar"
            )}
          </button>
        </div>
      </div>
      <div className="for-ProgressBar"></div>
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
            {previewUrl.startsWith("data:image/") && (
              <img
                src={previewUrl}
                alt="Preview"
                style={{ maxWidth: "100%" }}
              />
            )}
            {previewUrl.startsWith("data:video/") && (
              <video src={previewUrl} controls style={{ maxWidth: "100%" }} />
            )}
          </div>
        )}
      </div>
    </form>
  );
}

interface MediaInputProps {
  onSelected: (file: File | null) => void;
  setPreviewUrl: Dispatch<SetStateAction<string | null>>;
  handleButtonClick: () => void;
}

const MediaInput = forwardRef<HTMLInputElement, MediaInputProps>(
  ({ onSelected, setPreviewUrl, handleButtonClick }, fileInputRef) => {
    const handleFileInputChange = (event: ChangeEvent<HTMLInputElement>) => {
      const selectedFile = event.target.files?.[0] ?? null;
      onSelected(selectedFile);
      if (selectedFile) {
        const fileReader = new FileReader();
        fileReader.onload = () => {
          setPreviewUrl(fileReader.result as string);
        };
        fileReader.readAsDataURL(selectedFile);
      } else {
        setPreviewUrl(null);
      }
    };

    return (
      <div className="flex items-center">
        <button type="button" onClick={handleButtonClick}>
          <ImageIcon color="#9ca3af" size={20} />
        </button>
        <input
          type="file"
          accept="image/*, video/*"
          onChange={handleFileInputChange}
          ref={fileInputRef}
          style={{ display: "none" }}
        />
      </div>
    );
  }
);

MediaInput.displayName = "MediaInput";
