/*To summarize, this code handles an HTTP POST request.
It constructs an API endpoint URL for Cloudflare, makes a POST request to the Cloudflare API with appropriate headers (including file metadata), 
retrieves the 'Location' header from the response, and constructs a response to be sent back to the client, allowing access to the 'Location' header.
Any errors encountered during this process are logged to the console.

Next lines defines an asynchronous function called "POST".
It receives a request object, which represents the incoming HTTP request.*/

export async function POST(request: Request) {

  /* It constructs an endpoint URL for the Cloudflare API by combining a base URL (https://api.cloudflare.com/client/v4/accounts/) 
  with the value of the NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID environment variable. The resulting URL is stored in the endpoint variable.*/

  const endpoint = `https://api.cloudflare.com/client/v4/accounts/${process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID}/stream?direct_user=true`
  
  /* It logs a message to the console, printing the value of the 'Upload-Metadata' header from the request.
  This header likely contains metadata about an uploaded file.*/
  
  console.log('OPAAAA', request.headers.get('Upload-Metadata'))

  /*It attempts to make a POST request to the Cloudflare API using the constructed endpoint URL. */
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `bearer ${process.env.CLOUDFLARE_STREAM_API_TOKEN}`, /* Authorization: It includes an authorization token */
        'Tus-Resumable': '1.0.0', /* It sets the version of the "Tus" protocol to 1.0.0. The Tus protocol is used for resumable file uploads. */
        'Upload-Length': request.headers.get('Upload-Length'), /* It sets the value of the 'Upload-Length' header to the value obtained from the Upload-Length header of the incoming request. This header typically represents the size of the uploaded file. */
        'Upload-Metadata': request.headers.get('Upload-Metadata'), /* It sets the value of the 'Upload-Metadata' header to the value obtained from the Upload-Metadata header of the incoming request. This header likely contains metadata about the uploaded file. */
      } as any,
    })

    /* It retrieves the value of the 'Location' header from the response. The 'Location' header typically contains the URL or endpoint where the uploaded file is stored or can be accessed. */
    const destination = response.headers.get('Location')

    /* It constructs a new response to be sent back to the client. The response has no content (null), but it includes several headers: */
    return new Response(null, {
      headers: {
        'Access-Control-Expose-Headers': 'Location', /** It exposes the 'Location' header to the client so that the client can access it. */
        'Access-Control-Allow-Headers': '*', /**It allows all headers to be accessed by the client. */
        'Access-Control-Allow-Origin': '*', /**  It allows requests from any origin to access the response. */
        Location: destination, /** It sets the value of the 'Location' header in the response to the value obtained from the Cloudflare API response. This allows the client to know where the uploaded file is located. */
      } as any,
    })
    // The catch block: If an error occurs during the execution of the try block (e.g., if there's an issue with the API request), 
    // an error message is logged to the console
  } catch (e) {
    console.log('ERROR', e) /**If any error occurs during the execution of the try block (e.g., an issue with the API request), an error message is logged to the console. */
  }
}
