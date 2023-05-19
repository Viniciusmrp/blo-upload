// import { prisma } from '@/db'



/* This "export const config..." code defines an object called "config".
It contains configuration settings for an API endpoint.
In this case, the bodyParser property is set to false, indicating that the API endpoint does not expect to receive any request body data.*/
export const config = {
  api: {
    bodyParser: false,
  },
};

/* This code "type VideoData..." defines a custom type called "VideoData".
It represents the structure or shape of an object that contains information about a video.
Each property within the type specifies the name and data type of a specific piece of information about the video,
such as its unique ID, creator, thumbnail, status, and more.*/

type VideoData = {
  uid: string;
  creator: null;
  thumbnail: string;
  thumbnailTimestampPct: number;
  readyToStream: boolean;
  status: {
    state: string;
    step: string;
    pctComplete: string;
    errorReasonCode: string;
    errorReasonText: string;
  };
  meta: {
    filename: string;
    filetype: string;
    name: string;
    type: string;
  };
  created: string;
  modified: string;
  size: number;
  preview: string;
  allowedOrigins: [];
  requireSignedURLs: boolean;
  uploaded: string;
  uploadExpiry: string;
  maxSizeBytes: null;
  maxDurationSeconds: number;
  duration: number;
  input: {
    width: number;
    height: number;
  };
  playback: {
    hls: string;
    dash: string;
  };
  watermark: null;
  clippedFrom: null;
  publicDetails: null;
};


/* This line defines an asynchronous function called "POST".
It is typically used in web development to handle HTTP POST requests, which are requests made by a client to send data to a server.*/
export async function POST(request: Request) {
  const data = (await request.json()) as VideoData;

  console.log("Cloudflare Webhook Run", new Date(), data);

  try {
    // await prisma.cloudflareVideo.update({
    //   where: {
    //     id: data.meta.filename,
    //   },
    //   data: {
    //     videoIdOnCloudflare: data.uid,
    //   },
    // })
  } catch (e) {
    console.log("ERROR", e);
  }
}
