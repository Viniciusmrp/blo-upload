import { prisma } from '@/db'

export const config = {
  api: {
    bodyParser: false,
  },
}

type VideoData = {
  uid: string
  creator: null
  thumbnail: string
  thumbnailTimestampPct: number
  readyToStream: boolean
  status: {
    state: string
    step: string
    pctComplete: string
    errorReasonCode: string
    errorReasonText: string
  }
  meta: {
    filename: string
    filetype: string
    name: string
    type: string
  }
  created: string
  modified: string
  size: number
  preview: string
  allowedOrigins: []
  requireSignedURLs: boolean
  uploaded: string
  uploadExpiry: string
  maxSizeBytes: null
  maxDurationSeconds: number
  duration: number
  input: {
    width: number
    height: number
  }
  playback: {
    hls: string
    dash: string
  }
  watermark: null
  clippedFrom: null
  publicDetails: null
}

export async function POST(request: Request) {
  const data = (await request.json()) as VideoData

  console.log('Cloudflare Webhook Run', new Date(), data)

  try {
    await prisma.cloudflareVideo.update({
      where: {
        id: data.meta.filename,
      },
      data: {
        videoIdOnCloudflare: data.uid,
      },
    })
  } catch (e) {
    console.log('ERROR', e)
  }
}
