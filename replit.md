# AniGuide - Anime Discovery & Review PWA

## Overview

AniGuide is a Progressive Web App (PWA) built with React, TypeScript, and Express.js that allows users to discover trending anime, view detailed information, and write/read reviews. The application integrates with the AniList GraphQL API for anime data and uses local storage for review persistence.

## System Architecture

The application follows a full-stack architecture with clear separation between frontend and backend:

- **Frontend**: React with TypeScript, Vite build tool, Tailwind CSS for styling
- **Backend**: Express.js server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM (fully integrated with DatabaseStorage)
- **External API**: AniList GraphQL API for anime data
- **PWA Features**: Service worker, web manifest, offline capabilities

## Key Components

### Frontend Architecture
- **React Router**: Uses Wouter for client-side routing
- **State Management**: TanStack Query for server state management
- **UI Components**: Radix UI primitives with shadcn/ui styling
- **Styling**: Tailwind CSS with custom design system and dark theme
- **PWA**: Service worker for caching, manifest for installability

### Backend Architecture
- **Express Server**: RESTful API with middleware for logging and error handling
- **Route Handlers**: Separate routing module for API endpoints
- **Storage Layer**: Abstract storage interface with PostgreSQL database implementation
- **Development Tools**: Vite integration for development mode

### Data Management
- **Local Reviews**: Browser localStorage for review persistence
- **External Data**: AniList GraphQL API for anime information
- **Caching**: Service worker caches static assets and API responses
- **Offline Support**: Fallback mechanisms for offline functionality

## Data Flow

1. **Anime Discovery**: Frontend fetches trending/popular anime from backend API
2. **Backend Proxy**: Server proxies requests to AniList GraphQL API
3. **Review System**: Reviews stored locally in browser localStorage
4. **PWA Features**: Service worker handles caching and offline scenarios
5. **Real-time Updates**: TanStack Query manages cache invalidation and updates

## External Dependencies

### Core Dependencies
- **AniList API**: External GraphQL API for anime data
- **Neon Database**: PostgreSQL database service (configured via DATABASE_URL)
- **CDN Resources**: Google Fonts (Inter), Font Awesome icons

### Key Libraries
- **Frontend**: React, TypeScript, Vite, Wouter, TanStack Query
- **UI**: Radix UI, Tailwind CSS, shadcn/ui components
- **Backend**: Express.js, Drizzle ORM, Zod validation
- **Development**: ESLint, PostCSS, Autoprefixer

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds React app to `dist/public`
- **Backend**: ESBuild bundles server code to `dist/index.js`
- **Assets**: Static assets served from public directory

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string (required for Drizzle)
- **NODE_ENV**: Environment mode (development/production)
- **PWA**: Manifest and service worker for app installation

### Hosting Requirements
- Node.js runtime for Express server
- PostgreSQL database (fully integrated with Drizzle ORM)
- HTTPS for PWA features and service worker
- Static file serving capabilities

## Changelog

```
Changelog:
- June 29, 2025. Initial setup
- June 29, 2025. Updated color scheme to Scarlet (#FF220C), Magnolia (#F3EFF5), and Jet (#2F2D2E) based on user preferences. Redesigned logo with circular gradient design and play button icon.
- June 29, 2025. Integrated PostgreSQL database with Drizzle ORM, replacing in-memory storage with DatabaseStorage implementation.
- June 29, 2025. Updated color scheme to Black (#06070E), Claret (#9C0D38), and Timberwolf (#DAD2D8) based on user's new color palette preference.
- June 29, 2025. Enhanced review system with season/episode tracking, episode lists, related anime display, and tabbed detail view. Added comprehensive anime relations and episode information from AniList API.
- June 29, 2025. Implemented comprehensive anime data coverage with 6 categories (Trending, Popular, Airing Now, Upcoming, Top Rated, All Time Popular), auto-refresh service for real-time updates every 30 minutes, data status indicator, and manual refresh capability. Added custom anime hero image.
- June 29, 2025. Enhanced PWA for full Google Play compatibility with advanced service worker (background sync, push notifications, periodic sync), comprehensive manifest with shortcuts and app identity, install prompts, multiple icon sizes including maskable icons, app screenshots, and Android-specific features like digital asset links.
- June 29, 2025. Fixed critical navigation, authentication, and PWA issues identified in PageSpeed Insights testing. Implemented working navigation throughout the site with proper accessibility labels, created complete page structure (Search, Favorites, Reviews, Profile), added authentication system with login/logout functionality, optimized service worker for performance compliance, and resolved button accessibility issues for screen readers.
- June 29, 2025. Implemented comprehensive account management system with mobile drawer navigation and desktop dropdown menu. Added secure password reset with 12+ character requirement (uppercase, lowercase, special characters recommended), username change functionality with 6-month restriction, profile editing capabilities, and complete user authentication integration with PostgreSQL database storage.
- June 29, 2025. Completed production deployment preparation with admin user system, comprehensive watchlist functionality, and database integration. Removed all demo content, implemented role-based access control for admin users, added full CRUD operations for watchlist management (add, remove, update status and ratings), created production-ready Favorites page with status grouping and episode tracking, and established proper database schema with foreign key relationships.
- June 29, 2025. Implemented guest browsing with protected features and reverted to agreed 3-color scheme. Users can now browse anime without authentication while reviews and watchlist features require login. Reverted color scheme back to Black (#06070E), Claret (#9C0D38), and Timberwolf (#DAD2D8) as originally agreed. Added comprehensive SEO meta tags for all pages, implemented ProtectedFeature component to gracefully handle unauthorized access, added navigation back to home from profile page, and integrated new AniGuide logo assets (72x72, 96x96, 128x128, 192x192, 512x512, 1024x1024) for PWA manifest and favicon. Completely replaced all SVG logos throughout the app (header, mobile navigation, service worker notifications) with the new AniGuide PNG logo assets.
- June 29, 2025. Fixed HTTPS deployment configuration for production readiness. Added trust proxy settings, HTTPS redirect middleware for production environment, security headers (HSTS, X-Frame-Options, X-Content-Type-Options), protocol detection for proper HTTPS handling in authentication flows, and updated PWA manifest with protocol handlers for deployment compatibility.
- June 29, 2025. Implemented comprehensive production-ready service worker with offline support, background sync, and push notifications. Created sw-production.js with intelligent caching strategies (cache-first for static assets, network-first for API requests), background sync for offline review/watchlist actions, push notification infrastructure with VAPID support, offline page with branded design, service worker manager utility for registration and communication, notification component with online/offline status indicators and push notification controls, and complete integration throughout the app for seamless offline functionality. Fixed production deployment issues by completely removing service worker interference with external requests, allowing all anime images and CDN resources to load naturally while maintaining PWA offline capabilities. Corrected PWA manifest configuration by removing problematic protocol handlers that caused HTTPS compatibility issues, added proper offline page caching, and ensured PWA Builder compatibility for Google Play Store deployment. Service worker now only handles internal app resources while external anime images load directly without interference. Fixed Android TWA compatibility by replacing all data: URLs in manifest.json with real file paths - created actual SVG icon files (/icons/trending.svg, /icons/search.svg, /icons/popular.svg) and PNG screenshot placeholders (/screenshots/mobile-discover.png, /screenshots/desktop-browse.png) to resolve bubblewrap errors during Android app wrapping process. Added digital asset links configuration at /.well-known/assetlinks.json with package name com.onrender.aniguide.twa and SHA256 fingerprint for Google Play Store deployment verification, completing all requirements for Android TWA submission.
- June 30, 2025. Updated digital asset links configuration with package name com.brando.aniguide2 and SHA256 certificate fingerprint (3C:1A:FD:43:63:ED:76:D9:4A:1E:98:8D:8E:07:21:8A:B5:99:A7:70:07:CB:59:BB:07:AA:BE:40:93:8B:A3:0F) for final Android TWA deployment verification. Fixed authentication system loop that was causing excessive 401 errors by replacing TanStack Query with simpler useState/useEffect pattern in useAuth hook. Completed color scheme compliance throughout the app with jet color (#2F2D2E) text in anime details and reviews, scarlet (#9C0D38) action buttons with timberwolf (#DAD2D8) text, and scarlet star ratings when selected. Finalized authentication UX with desktop direct home access, mobile splash screen, protected feature prompts for guests, and stable logout flow.
- July 1, 2025. Completed comprehensive authentication system with password reset functionality. Fixed all 401 authentication errors by implementing complete forgot password flow with secure token generation, database schema updates for password reset columns, enhanced login page with modal dialogs for password recovery, and comprehensive error handling. Added password reset routes (/api/auth/forgot-password, /api/auth/reset-password) with proper validation and security measures. Authentication system now includes user registration, login, session management, password reset, and logout functionality with PostgreSQL database integration. All authentication flows tested and verified working correctly.
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```