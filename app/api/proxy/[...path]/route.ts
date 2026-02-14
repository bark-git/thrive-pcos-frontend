import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'https://thrive-pcos-backend.vercel.app';

// Allowed API path prefixes — requests to other paths are rejected
const ALLOWED_PATH_PREFIXES = [
  '/auth/',
  '/mood',
  '/symptom',
  '/cycle',
  '/medication',
  '/lab',
  '/user/',
  '/analytics/',
  '/export/',
  '/email/',
];

function isAllowedPath(path: string): boolean {
  return ALLOWED_PATH_PREFIXES.some(prefix => path.startsWith(prefix));
}

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

    // Validate path against allowlist
    if (!isAllowedPath(path)) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Add /api prefix for backend
    const backendUrl = `${BACKEND_URL}/api${path}${searchParams ? `?${searchParams}` : ''}`;

    // Only forward safe, necessary headers
    const headers: Record<string, string> = {};
    const authorization = request.headers.get('authorization');
    if (authorization) {
      headers['authorization'] = authorization;
    }
    const contentType = request.headers.get('content-type');
    if (contentType) {
      headers['content-type'] = contentType;
    }

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
    const responseContentType = response.headers.get('Content-Type') || 'application/json';
    
    // Handle binary responses (PDF, images, etc.)
    if (responseContentType.includes('application/pdf') ||
        responseContentType.includes('application/octet-stream') ||
        responseContentType.includes('image/')) {
      const arrayBuffer = await response.arrayBuffer();

      return new NextResponse(arrayBuffer, {
        status: response.status,
        headers: {
          'Content-Type': responseContentType,
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
        'Content-Type': responseContentType,
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
