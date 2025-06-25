export async function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);
  
  // Handle WASM files with proper headers
  if (url.pathname.endsWith('.wasm') || url.pathname.includes('index_bg')) {
    const response = await next();
    
    // Create new headers object
    const headers = new Headers(response.headers);
    headers.set('Content-Type', 'application/wasm');
    headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
    headers.set('Cross-Origin-Opener-Policy', 'same-origin');
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: headers
    });
  }
  
  // For all other requests, ensure COOP/COEP headers are present
  const response = await next();
  const headers = new Headers(response.headers);
  
  // Only add headers if they don't already exist
  if (!headers.has('Cross-Origin-Embedder-Policy')) {
    headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
  }
  if (!headers.has('Cross-Origin-Opener-Policy')) {
    headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  }
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: headers
  });
}