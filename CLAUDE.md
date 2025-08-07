# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI Agents frontend application built with Next.js 15 (App Router) and TypeScript. The project provides user authentication and AI digital human features for interactive experiences.

## Tech Stack

- **Framework**: Next.js 15.3.5 with App Router
- **Language**: TypeScript 5.8.3
- **Styling**: Tailwind CSS 3.4.17
- **State Management**: React Context API
- **Authentication**: JWT with middleware-based route protection
- **Icons**: Lucide React
- **API Client**: Custom HTTP client with interceptors

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (runs on port 3001)
npm run dev

# Build for production
npm run build

# Run linter
npm run lint

# Start production server
npm run start
```

## High-Level Architecture

### API Layer Architecture

The project uses a three-tier API abstraction:

1. **HttpClient** (`lib/api/http-client.ts`): Base HTTP client with:
   - Automatic token management from localStorage
   - Request/response error handling
   - Timeout control (30s default)
   - Special handling for HTTPS/HTTP mixed content
   - Form data and file upload support

2. **Service Classes** (`lib/api/services/`): Domain-specific services extending base patterns:
   - `AuthService`: Login, register, logout
   - `UserService`: User profile management  
   - `DigitalHumanService`: Digital human CRUD, chat, favorites

3. **Type System** (`lib/types/`): Full TypeScript coverage with:
   - `ApiResponse<T>` wrapper for all API responses
   - `ApiError` for consistent error handling
   - Domain-specific types (auth, user, digital-human)

### Authentication Flow

Multi-layer authentication system:
- **Storage**: JWT stored in both localStorage and cookies
- **Middleware** (`middleware.ts`): Server-side route protection via cookie checks
- **AuthProvider**: Client-side global auth state via React Context
- **API Client**: Automatic `Authorization: Bearer` header injection

Protected routes redirect to `/login`, authenticated users redirected from auth pages to home.

### Digital Human Features

Core feature set with dedicated components and services:
- **List View**: `DigitalHumanList` component with pagination
- **Detail View**: Individual digital human pages at `/digital-human/[id]`
- **Card Component**: `DigitalHumanCard` for grid display
- **API Integration**: Full CRUD operations via `DigitalHumanService`

## Project Structure

```
app/
├── digital-human/[id]/    # Dynamic digital human pages
├── login/                 # Authentication pages
├── register/
└── layout.tsx            # Root layout with providers

components/
├── digital-human/        # Digital human specific components
├── providers/            # Context providers (AuthProvider)
└── icons/               # Icon components

lib/
├── api/
│   ├── http-client.ts   # Base HTTP client
│   └── services/        # API service modules
├── types/               # TypeScript definitions
└── utils/              # Utility functions

middleware.ts           # Route protection
```

## Environment Configuration

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Backend must be running at http://localhost:8000 (FastAPI)

## Key Patterns & Conventions

### API Service Pattern
```typescript
// All services follow this pattern
class ServiceName extends BaseService {
  async methodName(data: InputType): Promise<ApiResponse<OutputType>> {
    return this.httpMethod<OutputType>('/endpoint', data);
  }
}
```

### Error Handling
- FastAPI validation errors auto-translated to Chinese
- Centralized error creation in `HttpClient.createError()`
- Consistent `ApiError` type with message, status, details

### Type Safety
- All API responses wrapped in `ApiResponse<T>`
- Domain types in separate files under `lib/types/`
- Strict TypeScript with no implicit any

### Routing
- Public routes: `/login`, `/register`
- Protected routes: Everything else
- Middleware handles redirects based on cookie presence

## Current Implementation Status

✅ **Completed**:
- User authentication (register, login, logout)
- JWT token management
- Route protection middleware
- Digital human list view with pagination
- Digital human detail pages
- API service architecture
- Dark theme UI

🚧 **In Progress**:
- Digital human chat interface
- Memory viewer for AI interactions
- Training interface

⚠️ **Planned**:
- Voice interaction
- Real-time chat updates
- File uploads for training
- Advanced search/filtering

## Development Notes

- Backend dependency: Ensure FastAPI backend is running before starting frontend
- Port configuration: Frontend runs on 3001, backend on 8000
- API pattern: Use existing service classes when adding new endpoints
- Type safety: Define types in `lib/types/` before implementing features
- Component structure: Follow existing patterns in `components/`
- Debugging: 后台执行时，日志输出到 agents.log 文件

# Notes
- 后端接口文档地址：http://34.129.68.205:8000/openapi.json