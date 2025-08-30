import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://34.129.46.22:8000';
  
  console.log('Test endpoint called');
  console.log('Backend URL:', BACKEND_URL);
  
  try {
    // 尝试一个简单的健康检查
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5秒超时
    
    console.log('Attempting to fetch from:', `${BACKEND_URL}/`);
    
    const response = await fetch(`${BACKEND_URL}/`, {
      signal: controller.signal,
      method: 'GET'
    });
    
    clearTimeout(timeoutId);
    
    return NextResponse.json({
      success: true,
      message: 'Backend is reachable',
      status: response.status,
      backend: BACKEND_URL
    });
    
  } catch (error: any) {
    console.error('Test failed:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Cannot reach backend',
      error: error?.message || 'Unknown error',
      errorType: error?.constructor?.name || 'Unknown',
      backend: BACKEND_URL,
      suggestion: 'Vercel cannot access HTTP endpoints. Please use HTTPS or Cloudflare Tunnel.'
    }, { status: 502 });
  }
}