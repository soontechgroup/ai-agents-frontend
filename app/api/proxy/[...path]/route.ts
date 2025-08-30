import { NextRequest, NextResponse } from 'next/server';

// 后端 API 地址
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://34.129.46.22:8000';

// 处理所有 HTTP 方法
export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params.path, 'GET');
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params.path, 'POST');
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params.path, 'PUT');
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params.path, 'DELETE');
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params.path, 'PATCH');
}

// 统一处理请求
async function handleRequest(
  request: NextRequest,
  path: string[],
  method: string
) {
  try {
    // 构建目标 URL
    const targetUrl = `${BACKEND_URL}/api/${path.join('/')}`;
    
    // 获取查询参数
    const searchParams = request.nextUrl.searchParams.toString();
    const fullUrl = searchParams ? `${targetUrl}?${searchParams}` : targetUrl;

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
    const response = await fetch(fullUrl, fetchOptions);

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

    // 返回响应
    return NextResponse.json(
      responseBody,
      {
        status: response.status,
        headers: responseHeaders,
      }
    );
  } catch (error) {
    console.error('Proxy error:', error);
    
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