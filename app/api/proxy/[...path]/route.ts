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
    const backendUrl = `${BACKEND_URL}${path}${searchParams ? `?${searchParams}` : ''}`;

    // Get headers
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

    // Get response data
    const data = await response.text();
    
    // Return response
    return new NextResponse(data, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
      },
    });
  } catch (error: any) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Proxy request failed', details: error.message },
      { status: 500 }
    );
  }
}
