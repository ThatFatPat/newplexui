# API Services Documentation

This document describes the dedicated API service files that have been created to handle all external API interactions.

## Services Overview

### 1. PlexService (`src/services/plexService.ts`)
Handles all Plex Media Server API interactions.

**Features:**
- Fetch library content (movies and TV shows)
- Get media details
- Search library
- Handle Plex authentication and image URLs

**Configuration:**
```typescript
const plexService = new PlexService({
  url: 'http://192.168.1.100:32400', // Your Plex server URL
  token: 'your-plex-token'            // Your Plex API token
});
```

### 2. SonarrService (`src/services/sonarrService.ts`)
Handles all Sonarr (TV show management) API interactions.

**Features:**
- Fetch TV series
- Get download queue
- Search for series
- Add series to monitoring
- Get quality profiles, root folders, and tags

**Configuration:**
```typescript
const sonarrService = new SonarrService({
  url: 'http://192.168.1.100:8989', // Your Sonarr server URL
  apiKey: 'your-sonarr-api-key'      // Your Sonarr API key
});
```

### 3. RadarrService (`src/services/radarrService.ts`)
Handles all Radarr (movie management) API interactions.

**Features:**
- Fetch movies
- Get download queue
- Search for movies
- Add movies to monitoring
- Get quality profiles, root folders, and tags

**Configuration:**
```typescript
const radarrService = new RadarrService({
  url: 'http://192.168.1.100:7878', // Your Radarr server URL
  apiKey: 'your-radarr-api-key'      // Your Radarr API key
});
```

### 4. TMDBService (`src/services/tmdbService.ts`)
Handles The Movie Database (TMDB) API interactions for searching movies and TV shows.

**Features:**
- Search movies and TV shows
- Get detailed information
- Handle poster and backdrop images
- Sort results by relevance

**Configuration:**
```typescript
const tmdbService = new TMDBService({
  apiKey: 'your-tmdb-api-key',           // Your TMDB API key
  baseUrl: 'https://api.themoviedb.org/3' // TMDB API base URL
});
```

## Usage in Components

### Library Component
The Library component now uses real API calls to:
- Fetch Plex library content
- Get Sonarr and Radarr download queues
- Display real data instead of mock data

### Search Component
The Search component now uses real API calls to:
- Search TMDB for movies and TV shows
- Add results to Sonarr/Radarr with real API calls
- Display real poster images and metadata

## Configuration Requirements

### Plex
- Host, port, scheme (http/https), and API token
- Configured in your app's configuration

### Sonarr
- Host, port, scheme (http/https), and API key
- Configured in your app's configuration

### Radarr
- Host, port, scheme (http/https), and API key
- Configured in your app's configuration

### TMDB
- API key (get from https://www.themoviedb.org/settings/api)
- Currently hardcoded in Search component - replace with your actual API key

## Error Handling

All services include comprehensive error handling:
- Network errors are caught and logged
- API errors return appropriate error messages
- Failed requests return empty arrays or null values
- Services gracefully handle missing configuration

## Benefits of Dedicated Services

1. **Separation of Concerns**: API logic is separated from UI components
2. **Reusability**: Services can be used across multiple components
3. **Maintainability**: Easy to update API endpoints or add new features
4. **Testing**: Services can be unit tested independently
5. **Error Handling**: Centralized error handling and logging
6. **Type Safety**: Full TypeScript support with proper interfaces

## Next Steps

1. **Configure API Keys**: Replace placeholder API keys with your actual keys
2. **Environment Variables**: Move API keys to environment variables for security
3. **Error Boundaries**: Add React error boundaries for better error handling
4. **Loading States**: Enhance loading states and user feedback
5. **Caching**: Add caching layer for frequently accessed data
6. **Rate Limiting**: Implement rate limiting for API calls
