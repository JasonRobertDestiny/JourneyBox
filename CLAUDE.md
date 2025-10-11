# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A React-based travel planning application that allows users to create, manage, and share travel itineraries. The app includes AI-powered trip generation using OpenAI, Unsplash image integration, and a community feature for sharing travel experiences.

**Technology Stack:**
- Frontend: React 18, React Router, Ant Design 5.x
- Backend: Python FastMCP server (Unsplash integration)
- AI Integration: OpenAI-compatible API via AIHubMix
- State Management: React Context (AuthContext)
- HTTP Client: Axios

## Development Commands

### Frontend Development
```bash
# Install dependencies
npm install

# Start development server (default port 3000)
npm start

# Build for production
npm run build

# Run tests
npm test
```

### Backend MCP Server
```bash
# Run Unsplash MCP server
python server.py

# Note: Requires UNSPLASH_ACCESS_KEY in environment
```

## Architecture

### Core Application Structure

**Routing Architecture** (src/App.js:18-37)
- React Router v6 for client-side routing
- 14 main routes including home, trip creation, community, and auth flows
- All routes wrapped in AuthProvider for authentication state

**Authentication Flow**
- Context-based auth using `AuthContext` (src/contexts/AuthContext.js)
- Supports username/password login and WeChat OAuth
- Auth state persists via `getCurrentUser()` on app load
- Protected routes should check `isAuthenticated` from `useAuth()` hook

**Data Services Architecture**
All API services follow consistent patterns with mock data:
- `tripService.js` - Trip CRUD operations with detailed itinerary data
- `userService.js` - User authentication and profile management
- `postService.js` - Community post operations
- `communityService.js` - Social features (follows, likes, comments)
- `aiService.js` - OpenAI integration for trip generation
- `unsplashService.js` - Image search via Unsplash API

**AI Integration Details**
- Uses AIHubMix proxy for OpenAI API (AIHUBMIX_BASE_URL: https://aihubmix.com/v1)
- Implements request throttling (15s minimum interval between requests)
- Retry mechanism for rate-limited requests (429 errors)
- Critical: API key is hardcoded in aiService.js - should be moved to environment variables

**MCP Server Integration**
- Python FastMCP server (server.py) provides Unsplash photo search
- Configuration in mcp-config.json with Firecrawl API key
- Tool: `search_photos()` with filtering by color, orientation, pagination

### Key Pages and Components

**Main Pages:**
- HomePage - Landing page with trip list
- CreateTripPage - Multi-step trip creation form with AI generation
- ItineraryPage - Detailed day-by-day itinerary view (largest file ~63KB)
- TripDetailPage - Trip overview and metadata
- CommunityPage/PostDetailPage - Social sharing features
- GeneratingTripPage - Loading state for AI trip generation
- ProfilePage - User profile and settings

**Reusable Components:**
- Header.js - Navigation header with auth state
- LoadingScreen.js / LoadingSpinner.js - Loading UI states
- UnsplashImage.js - Image component with Unsplash attribution
- PostCard.js / PostList.js - Community post display
- LoginForm.js / RegisterForm.js - Authentication forms

### Important Patterns and Conventions

**Mock Data Pattern**
Most services use in-memory mock data arrays at the top of the file (e.g., `mockTrips`, `mockTripDetails`). When adding new features:
1. Define mock data structure first
2. Implement service functions with setTimeout to simulate async
3. Follow existing promise-based API patterns

**Error Handling**
- Services should throw errors with descriptive messages
- Components catch errors and display user-friendly notifications
- Auth errors trigger logout and redirect to /auth

**Code Style (from .cursor/rules/front.mdc)**
- Use latest React 18 patterns (hooks, functional components)
- Follow TypeScript naming conventions even in .js files
- Implement complete features - avoid lazy/incomplete code
- Use Ant Design components for UI consistency

## Critical Considerations

### Security Issues to Address
1. **API Key Exposure**: AIHubMix API key is hardcoded in aiService.js (line 3)
   - Should use environment variables (.env file)
   - Add .env to .gitignore
   - Use process.env.REACT_APP_AIHUBMIX_API_KEY

2. **Rate Limiting**: Current implementation has aggressive throttling
   - 15s minimum interval between AI requests
   - Consider implementing request queuing for better UX

### Development Workflow
1. Backend services (userService, tripService) are entirely mock-based
2. To add real backend:
   - Replace mock functions with actual HTTP calls
   - Update base URL configuration
   - Implement proper error handling for network failures

3. When modifying ItineraryPage.js:
   - File is large (~63KB) - consider refactoring into smaller components
   - Contains complex day-by-day rendering logic
   - Uses Unsplash integration extensively

### Testing Strategy
- React Testing Library for component tests
- Test files should be co-located with components
- Mock API services in tests using Jest mocks

## MCP Server Configuration

The project uses Model Context Protocol (MCP) servers:
- **Firecrawl** (mcp-config.json): Web scraping capabilities
- **Unsplash** (server.py): Photo search with filters

To add new MCP servers, update mcp-config.json and add corresponding service files.

## Common Gotchas

1. **Image Paths**: Public images use `/image/` prefix, not `/public/image/`
2. **WeChat Integration**: Callback flow at /auth/wechat-callback requires proper OAuth setup
3. **AI Service Throttling**: Wait 15s between generateItinerary calls to avoid rate limits
4. **AuthContext**: Always check loading state before rendering auth-dependent content
