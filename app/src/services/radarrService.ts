export interface RadarrMovie {
  id: number;
  title: string;
  titleSlug: string;
  tmdbId: number;
  year: number;
  overview: string;
  status: string;
  monitored: boolean;
  qualityProfileId: number;
  rootFolderPath: string;
  tags: string[];
  added: string;
  images: RadarrImage[];
  hasFile: boolean;
  sizeOnDisk: number;
  downloadedQuality: string;
}

export interface RadarrImage {
  coverType: string;
  url: string;
  remoteUrl: string;
}

export interface RadarrQueueItem {
  id: number;
  movieId: number;
  movie: {
    title: string;
    year: number;
  };
  status: string;
  size: number;
  sizeleft: number;
  estimatedCompletionTime: string;
  downloadId: string;
}

export interface RadarrConfig {
  url: string;
  apiKey: string;
}

class RadarrService {
  private config: RadarrConfig;

  constructor(config: RadarrConfig) {
    this.config = config;
  }

  private async makeRequest(endpoint: string, options?: RequestInit): Promise<any> {
    if (!this.config.apiKey || !this.config.url) {
      throw new Error('Radarr configuration is incomplete');
    }

    const url = `${this.config.url}/api/v3${endpoint}`;
    const headers = {
      'X-Api-Key': this.config.apiKey,
      'Content-Type': 'application/json',
      ...options?.headers,
    };

    try {
      const response = await fetch(url, { 
        headers,
        ...options 
      });
      
      if (!response.ok) {
        throw new Error(`Radarr API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Radarr API request failed:', error);
      throw error;
    }
  }

  async getMovies(): Promise<RadarrMovie[]> {
    try {
      return await this.makeRequest('/movie');
    } catch (error) {
      console.error('Failed to fetch Radarr movies:', error);
      return [];
    }
  }

  async getQueue(): Promise<RadarrQueueItem[]> {
    try {
      return await this.makeRequest('/queue');
    } catch (error) {
      console.error('Failed to fetch Radarr queue:', error);
      return [];
    }
  }

  async searchMovies(query: string): Promise<any[]> {
    try {
      const response = await this.makeRequest(`/movie/lookup?term=${encodeURIComponent(query)}`);
      return response || [];
    } catch (error) {
      console.error('Failed to search Radarr movies:', error);
      return [];
    }
  }

  async addMovie(movieData: {
    title: string;
    titleSlug: string;
    tmdbId: number;
    qualityProfileId: number;
    rootFolderPath: string;
    monitored: boolean;
    tags: string[];
  }): Promise<RadarrMovie | null> {
    try {
      const response = await this.makeRequest('/movie', {
        method: 'POST',
        body: JSON.stringify(movieData),
      });
      return response;
    } catch (error) {
      console.error('Failed to add movie to Radarr:', error);
      return null;
    }
  }

  async getQualityProfiles(): Promise<any[]> {
    try {
      return await this.makeRequest('/qualityprofile');
    } catch (error) {
      console.error('Failed to fetch quality profiles:', error);
      return [];
    }
  }

  async getRootFolders(): Promise<any[]> {
    try {
      return await this.makeRequest('/rootfolder');
    } catch (error) {
      console.error('Failed to fetch root folders:', error);
      return [];
    }
  }

  async getTags(): Promise<any[]> {
    try {
      return await this.makeRequest('/tag');
    } catch (error) {
      console.error('Failed to fetch tags:', error);
      return [];
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.makeRequest('/system/status');
      return true;
    } catch (error) {
      console.error('Radarr connection test failed:', error);
      return false;
    }
  }
}

export default RadarrService;
