export async function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);
  
  // Handle WASM files
  if (url.pathname.endsWith('.wasm')) {
    const response = await next();
    
    // Clone the response to modify headers
    const newResponse = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        ...response.headers,
        'Content-Type': 'application/wasm',
        'Cross-Origin-Embedder-Policy': 'require-corp',
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    });
    
    return newResponse;
  }
  
  // For all other requests, add COOP/COEP headers
  const response = await next();
  const newResponse = new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: {
      ...response.headers,
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin'
    }
  });
  
  return newResponse;
}