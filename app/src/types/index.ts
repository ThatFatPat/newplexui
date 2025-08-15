// Plex Types
export interface PlexMedia {
  id: number;
  title: string;
  type: 'movie' | 'show' | 'episode';
  year?: number;
  rating?: number;
  summary?: string;
  thumb?: string;
  art?: string;
  banner?: string;
  duration?: number;
  viewCount?: number;
  lastViewedAt?: string;
  addedAt?: string;
  updatedAt?: string;
  genres?: string[];
  actors?: { id: number; tag: string; thumb: string; role: string; }[];
  director?: string;
  studio?: string;
  contentRating?: string;
  audienceRating?: number;
  userRating?: number;
  mediaType?: string;
  guid?: string;
  tagline?: string;
  originallyAvailableAt?: string;
}

export interface PlexLibrary {
  id: number;
  name: string;
  type: 'movie' | 'show' | 'music' | 'photo';
  agent: string;
  scanner: string;
  language: string;
  uuid: string;
  updatedAt: number;
  createdAt: number;
  scannedAt: number;
  count: number;
  thumb?: string;
  art?: string;
  banner?: string;
}

export interface PlexServer {
  id: string;
  name: string;
  host: string;
  port: number;
  scheme: string;
  address: string;
  localAddresses: string;
  machineIdentifier: string;
  createdAt: number;
  updatedAt: number;
  owned: boolean;
  synced: boolean;
  sourceTitle: string;
  ownerId: number;
  home: boolean;
}

// Sonarr Types
export interface SonarrSeries {
  id: number;
  title: string;
  path: string;
  tvdbId: number;
  tvRageId: number;
  tvMazeId: number;
  firstAired: string;
  airTime: string;
  overview: string;
  network: string;
  runtime: number;
  genre: string[];
  cleanTitle: string;
  sortTitle: string;
  seasonCount: number;
  totalEpisodeCount: number;
  episodeCount: number;
  episodeFileCount: number;
  sizeOnDisk: number;
  status: string;
  added: string;
  ratings: {
    votes: number;
    value: number;
  };
  qualityProfileId: number;
  seasonFolder: boolean;
  monitored: boolean;
  useSceneNumbering: boolean;
  images: SonarrImage[];
  seasons: SonarrSeason[];
  year: number;
  profileId: number;
  seriesType: string;
  imdbId: string;
  titleSlug: string;
  certification: string;
  genres: string[];
  tags: number[];
}

export interface SonarrImage {
  coverType: string;
  url: string;
  remoteUrl: string;
}

export interface SonarrSeason {
  seasonNumber: number;
  monitored: boolean;
  statistics: {
    episodeCount: number;
    episodeFileCount: number;
    totalEpisodeCount: number;
    sizeOnDisk: number;
    percentOfEpisodes: number;
  };
}

// Radarr Types
export interface RadarrMovie {
  id: number;
  title: string;
  originalTitle: string;
  originalLanguage: {
    id: number;
    name: string;
  };
  alternateTitles: RadarrAlternateTitle[];
  secondaryYearSourceId: number;
  sortTitle: string;
  sizeOnDisk: number;
  status: string;
  overview: string;
  inCinemas: string;
  physicalRelease: string;
  digitalRelease: string;
  images: RadarrImage[];
  website: string;
  year: number;
  hasFile: boolean;
  youTubeTrailerId: string;
  studio: string;
  path: string;
  qualityProfileId: number;
  monitored: boolean;
  minimumAvailability: string;
  isAvailable: boolean;
  folderName: string;
  runtime: number;
  cleanTitle: string;
  imdbId: string;
  tmdbId: number;
  titleSlug: string;
  genres: string[];
  tags: number[];
  added: string;
  ratings: {
    votes: number;
    value: number;
    type: string;
  };
  movieFile: RadarrMovieFile;
  collection: RadarrCollection;
}

export interface RadarrAlternateTitle {
  sourceType: string;
  movieId: number;
  title: string;
  sourceId: number;
  votes: number;
  voteCount: number;
  language: {
    id: number;
    name: string;
  };
  id: number;
}

export interface RadarrImage {
  coverType: string;
  url: string;
  remoteUrl: string;
}

export interface RadarrMovieFile {
  movieId: number;
  relativePath: string;
  path: string;
  size: number;
  dateAdded: string;
  indexerFlags: number;
  quality: {
    quality: {
      id: number;
      name: string;
      source: string;
      resolution: number;
    };
    revision: {
      version: number;
      real: number;
      isRepack: boolean;
    };
  };
  mediaInfo: {
    audioChannels: number;
    audioCodec: string;
    audioLanguages: string[];
    audioStreamCount: number;
    videoBitDepth: number;
    videoBitrate: number;
    videoCodec: string;
    videoFps: number;
    resolution: string;
    runTime: string;
    scanType: string;
    subtitles: string[];
  };
  originalFilePath: string;
  qualityCutoffNotMet: boolean;
  languages: {
    id: number;
    name: string;
  }[];
  releaseGroup: string;
  edition: string;
  id: number;
}

export interface RadarrCollection {
  name: string;
  tmdbId: number;
  images: RadarrImage[];
  overview: string;
  monitored: boolean;
  rootFolderPath: string;
  qualityProfileId: number;
  searchOnAdd: boolean;
  minimumAvailability: string;
  id: number;
}

// App Types
export interface AppConfig {
  plex: {
    host: string;
    port: number;
    token: string;
    scheme: 'http' | 'https';
  };
  sonarr: {
    host: string;
    port: number;
    apiKey: string;
    scheme: 'http' | 'https';
  };
  radarr: {
    host: string;
    port: number;
    apiKey: string;
    scheme: 'http' | 'https';
  };
}

export interface SearchResult {
  id: string;
  title: string;
  year?: number;
  type: 'movie' | 'show';
  overview?: string;
  poster?: string;
  backdrop?: string;
  rating?: number;
  genres?: string[];
  source: 'plex' | 'sonarr' | 'radarr' | 'tmdb';
}

export interface User {
  id: string;
  username: string;
  email?: string;
  avatar?: string;
  preferences: {
    theme: 'dark' | 'light';
    language: string;
    quality: string;
  };
}

export interface PlexSeason {
  id: number;
  title: string;
  episodes: PlexEpisode[];
}

export interface PlexEpisode {
  id: number;
  title: string;
  duration?: number;
  summary?: string;
  thumb?: string;
}
