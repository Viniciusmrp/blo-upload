export async function POST(request: Request) {
  const endpoint = `https://api.cloudflare.com/client/v4/accounts/${process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID}/stream?direct_user=true`

  console.log('OPAAAA', request.headers.get('Upload-Metadata'))

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `bearer ${process.env.CLOUDFLARE_STREAM_API_TOKEN}`,
        'Tus-Resumable': '1.0.0',
        'Upload-Length': request.headers.get('Upload-Length'),
        'Upload-Metadata': request.headers.get('Upload-Metadata'),
      } as any,
    })

    const destination = response.headers.get('Location')

    return new Response(null, {
      headers: {
        'Access-Control-Expose-Headers': 'Location',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Origin': '*',
        Location: destination,
      } as any,
    })
  } catch (e) {
    console.log('ERROR', e)
  }
}
