import { NextRequest, NextResponse } from 'next/server';

// 后端 API 地址
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://34.129.46.22:8000';

// 处理所有 HTTP 方法
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return handleRequest(request, path, 'GET');
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return handleRequest(request, path, 'POST');
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return handleRequest(request, path, 'PUT');
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return handleRequest(request, path, 'DELETE');
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return handleRequest(request, path, 'PATCH');
}

// 统一处理请求
async function handleRequest(
  request: NextRequest,
  path: string[],
  method: string
) {
  console.log('=== Proxy Debug Start ===');
  console.log('Method:', method);
  console.log('Path array:', path);
  console.log('BACKEND_URL from env:', BACKEND_URL);
  
  try {
    // 构建目标 URL
    const targetUrl = `${BACKEND_URL}/${path.join('/')}`;
    
    // 获取查询参数
    const searchParams = request.nextUrl.searchParams.toString();
    const fullUrl = searchParams ? `${targetUrl}?${searchParams}` : targetUrl;
    
    console.log('Target URL built:', fullUrl);
    console.log('About to fetch from backend...');

    // 准备请求头
    const headers = new Headers();
    
    // 复制必要的请求头
    const contentType = request.headers.get('content-type');
    if (contentType) {
      headers.set('content-type', contentType);
    }
    
    // 复制 Authorization 头
    const authorization = request.headers.get('authorization');
    if (authorization) {
      headers.set('authorization', authorization);
    }

    // 准备请求配置
    const fetchOptions: RequestInit = {
      method,
      headers,
    };

    // 处理请求体
    if (method !== 'GET' && method !== 'HEAD') {
      if (contentType?.includes('application/json')) {
        fetchOptions.body = await request.text();
      } else if (contentType?.includes('multipart/form-data')) {
        // 处理文件上传
        fetchOptions.body = await request.arrayBuffer();
      } else if (contentType?.includes('application/x-www-form-urlencoded')) {
        fetchOptions.body = await request.text();
      } else {
        // 默认处理为文本
        fetchOptions.body = await request.text();
      }
    }

    // 发送请求到后端
    console.log('Sending fetch request with options:', {
      method: fetchOptions.method,
      headers: Object.fromEntries(headers.entries()),
      bodyLength: fetchOptions.body ? String(fetchOptions.body).length : 0
    });
    
    const startTime = Date.now();
    let response;
    
    try {
      // 添加超时控制
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8秒超时
      
      response = await fetch(fullUrl, {
        ...fetchOptions,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      const elapsed = Date.now() - startTime;
      console.log(`Fetch completed in ${elapsed}ms, status: ${response.status}`);
      
    } catch (fetchError) {
      const elapsed = Date.now() - startTime;
      console.error('Fetch failed after', elapsed, 'ms');
      
      // 类型安全的错误处理
      const errorMessage = fetchError instanceof Error ? fetchError.message : 'Unknown error';
      const errorType = fetchError instanceof Error ? fetchError.constructor.name : typeof fetchError;
      
      console.error('Fetch error type:', errorType);
      console.error('Fetch error message:', errorMessage);
      console.error('Fetch error details:', fetchError);
      
      // 返回更详细的错误信息
      return NextResponse.json(
        {
          error: 'Backend fetch failed',
          message: errorMessage,
          details: {
            url: fullUrl,
            errorType: errorType,
            elapsed: elapsed,
            backend: BACKEND_URL
          }
        },
        { status: 502 }
      );
    }

    // 准备响应头
    const responseHeaders = new Headers();
    
    // 复制必要的响应头
    const responseContentType = response.headers.get('content-type');
    if (responseContentType) {
      responseHeaders.set('content-type', responseContentType);
    }

    // 添加 CORS 头（如果需要）
    responseHeaders.set('access-control-allow-origin', '*');
    responseHeaders.set('access-control-allow-methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    responseHeaders.set('access-control-allow-headers', 'Content-Type, Authorization');

    // 处理响应体
    let responseBody;
    if (responseContentType?.includes('application/json')) {
      responseBody = await response.json();
    } else {
      responseBody = await response.text();
    }

    console.log('Response body type:', typeof responseBody);
    console.log('=== Proxy Debug End (Success) ===');
    
    // 返回响应
    return NextResponse.json(
      responseBody,
      {
        status: response.status,
        headers: responseHeaders,
      }
    );
  } catch (error) {
    console.error('=== Proxy Debug End (Error) ===');
    console.error('Proxy general error:', error);
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorType = error instanceof Error ? error.constructor.name : typeof error;
    
    console.error('Error type:', errorType);
    console.error('Error message:', errorMessage);
    
    // 返回错误响应
    return NextResponse.json(
      {
        error: 'Proxy request failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      {
        status: 500,
      }
    );
  }
}

// 处理 OPTIONS 请求（CORS 预检）
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'access-control-allow-headers': 'Content-Type, Authorization',
      'access-control-max-age': '86400',
    },
  });
}