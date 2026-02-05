import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'https://thrive-pcos-backend.vercel.app';

export async function GET(request: NextRequest) {
  return proxyRequest(request, 'GET');
}

export async function POST(request: NextRequest) {
  return proxyRequest(request, 'POST');
}

export async function PUT(request: NextRequest) {
  return proxyRequest(request, 'PUT');
}

export async function DELETE(request: NextRequest) {
  return proxyRequest(request, 'DELETE');
}

export async function PATCH(request: NextRequest) {
  return proxyRequest(request, 'PATCH');
}

async function proxyRequest(request: NextRequest, method: string) {
  try {
    // Get the path from URL
    const url = new URL(request.url);
    const path = url.pathname.replace('/api/proxy', '');
    const searchParams = url.searchParams.toString();
    // Add /api prefix for backend
    const backendUrl = `${BACKEND_URL}/api${path}${searchParams ? `?${searchParams}` : ''}`;

    // Get headers (filter out sensitive ones)
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      if (key !== 'host' && key !== 'connection') {
        headers[key] = value;
      }
    });

    // Get body if present
    let body: string | undefined;
    if (method !== 'GET' && method !== 'DELETE') {
      body = await request.text();
    }

    // Make request to backend
    const response = await fetch(backendUrl, {
      method,
      headers,
      body,
    });

    // Check content type to handle binary vs text responses
    const contentType = response.headers.get('Content-Type') || 'application/json';
    
    // Handle binary responses (PDF, images, etc.)
    if (contentType.includes('application/pdf') || 
        contentType.includes('application/octet-stream') ||
        contentType.includes('image/')) {
      const arrayBuffer = await response.arrayBuffer();
      
      return new NextResponse(arrayBuffer, {
        status: response.status,
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': response.headers.get('Content-Disposition') || '',
          'Content-Length': arrayBuffer.byteLength.toString(),
        },
      });
    }
    
    // Handle text/JSON responses
    const data = await response.text();
    
    // Return response
    return new NextResponse(data, {
      status: response.status,
      headers: {
        'Content-Type': contentType,
      },
    });
  } catch (error: any) {
    // Log error server-side only
    console.error('Proxy error:', error.message);
    
    // Return generic error to client (no stack traces or details)
    return NextResponse.json(
      { error: 'Request failed' },
      { status: 500 }
    );
  }
}
