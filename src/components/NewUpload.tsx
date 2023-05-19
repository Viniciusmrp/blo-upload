"use client";

/**The code begins by importing various modules and components from different libraries and files. These imports provide functionality for handling file uploads, displaying progress bars, generating unique IDs, and rendering icons and loaders. */

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
import { Circle, HelpCircle, Image as ArrowUp, X } from "lucide-react";

/** An instance of the Uppy class is created, which is a library used for handling file uploads. The instance is configured with debug mode enabled and automatic upload proceeding. */

const uppy = new Uppy({ debug: true, autoProceed: true });

/** A function component called NewUpload is defined. This component represents a form for uploading media files (images or videos). The component initializes several state variables using the useState hook */

export function NewUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null); /**Stores the currently selected file for upload */
  const [previewUrl, setPreviewUrl] = useState<string | null>(null); /** Stores the URL of the preview image or video */
  const [IsUploading, setIsUploading] = useState(false); /** Tracks the upload status (whether a file is being uploaded). */
  const [email, setEmail] = useState("");

  /** The useRouter hook is called to get access to the Next.js router, which allows for programmatic navigation.
   The useTransition and useState hooks are used to handle transitions and manage a loading state.*/
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isFetching, setIsFetching] = useState(false);


  /** The useEffect hook is used to listen for changes in the selectedFile and preview Url variables. When a selectedFile is available and the previewUrl starts with "data:video/", it adds the file to the uppy instance. */
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


  /** The handleSubmit function is defined, which handles the form submission when the user clicks the "Publish" button. It prevents the default form submission behavior, sets the isUploading state to true, and proceeds if the previewUrl starts with "data:video/". It then configures the uppy instance to use the Tus plugin for resumable video uploads and the ProgressBar plugin for displaying the upload progress. It listens for the "complete" event, retrieves the uploaded file information, and performs a fetch request to the server to save the video URL and other data. Finally, it updates various states and triggers a route refresh. */
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsUploading(true);

    if (previewUrl?.startsWith("data:video/")) {
      
      console.log("Email:", email);

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

  /** The handleMediaSelected function is defined, which is called when a file is selected. It updates the selectedFile state with the selected file. */
  const handleMediaSelected = (file: File | null) => {
    setSelectedFile(file);
  };

  /** The fileInputRef variable is created using the useRef hook to reference the file input element. */
  const fileInputRef = useRef<HTMLInputElement>(null);

  /** The handleClearPreview function is defined, which clears the previewUrl and resets the file input value. */
  const handleClearPreview = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /** The handleButtonClick function is defined, which triggers a click event on the file input element. */
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
              "Publish"
            )}
          </button>
        </div>
      </div>
      <div className="for-ProgressBar"></div>
      <div className="flex items-center">
        <label htmlFor="emailInput">Email:</label>
        <input
          type="email"
          id="emailInput"
          placeholder="   Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          />
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
          <ArrowUp color="#9ca3af" size={20} />
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
