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
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```