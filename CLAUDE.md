# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an AI Agents frontend application built with Next.js 15 (App Router) and TypeScript. The project provides user authentication and is designed to support AI digital human features.

## Tech Stack

- **Framework**: Next.js 15.3.5 with App Router
- **Language**: TypeScript 5.8.3
- **Styling**: Tailwind CSS 3.4.17
- **State Management**: React Context API
- **Authentication**: JWT with middleware-based route protection
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

## Architecture Overview

### Directory Structure
- `app/` - Next.js App Router pages and layouts
- `components/` - Reusable React components
  - `providers/` - Context providers (AuthProvider)
  - `icons/` - Icon components
- `lib/` - Core utilities and configurations
  - `api/` - API layer with HTTP client and services
    - `http-client.ts` - Base HTTP client class
    - `interceptors.ts` - Request/response interceptors
    - `services/` - API service modules (auth, user)
  - `types/` - TypeScript type definitions
- `docs/` - HTML design documents for digital human features
- `middleware.ts` - Route protection middleware

### API Architecture

The project uses a professional API abstraction layer:

1. **HttpClient**: Base class handling requests, responses, and errors
2. **Interceptors**: Centralized request/response processing
3. **Services**: Domain-specific API methods (AuthService, UserService)
4. **Type Safety**: Full TypeScript support with ApiResponse<T> wrapper

### Authentication Flow

1. Token stored in both localStorage and cookies
2. Middleware checks cookies for protected routes
3. AuthProvider manages global auth state via Context API
4. API client automatically includes auth headers

## Environment Configuration

Create `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Backend must be running at http://localhost:8000

## Key Design Patterns

### API Service Pattern
```typescript
// Services extend BaseService and use the shared HTTP client
class AuthService extends BaseService {
  async login(data: LoginData): Promise<ApiResponse<AuthResponse>> {
    return this.post<AuthResponse>('/auth/login', data);
  }
}
```

### Error Handling
- Centralized error handling in HTTP client
- ApiError type with consistent error structure
- Request/response interceptors for global error processing

### Route Protection
- Middleware checks authentication cookies
- Redirects to /login for unauthorized access
- Public routes: /login, /register

## Current Features

- User registration and login
- JWT authentication
- Protected routes
- Responsive dark theme UI
- Professional API abstraction

## Planned Features (from docs/)

- AI digital human creation and management
- Chat interface with digital humans
- Memory viewer for AI interactions
- Training interface for digital humans
- Personal center with user settings

## Development Notes

- Always ensure backend is running before starting frontend
- Use the existing API service pattern when adding new endpoints
- Follow the established TypeScript patterns for type safety
- Maintain the dark theme design system defined in globals.css


# Tips
- 在调试的时候你直接后台执行，日志可以输出到一个agents.log文件中，这样你就可以看到日志了。