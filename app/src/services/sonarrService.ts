export interface SonarrSeries {
  id: number;
  title: string;
  titleSlug: string;
  tvdbId: number;
  year: number;
  overview: string;
  status: string;
  monitored: boolean;
  qualityProfileId: number;
  rootFolderPath: string;
  seasonFolder: boolean;
  searchForMissingEpisodes: boolean;
  tags: string[];
  seasons: SonarrSeason[];
  added: string;
  images: SonarrImage[];
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

export interface SonarrImage {
  coverType: string;
  url: string;
  remoteUrl: string;
}

export interface SonarrQueueItem {
  id: number;
  seriesId: number;
  series: {
    title: string;
    year: number;
  };
  episode: {
    title: string;
    seasonNumber: number;
    episodeNumber: number;
  };
  status: string;
  size: number;
  sizeleft: number;
  estimatedCompletionTime: string;
  downloadId: string;
}

export interface SonarrConfig {
  url: string;
  apiKey: string;
}

class SonarrService {
  private config: SonarrConfig;

  constructor(config: SonarrConfig) {
    this.config = config;
  }

  private async makeRequest(endpoint: string, options?: RequestInit): Promise<any> {
    if (!this.config.apiKey || !this.config.url) {
      throw new Error('Sonarr configuration is incomplete');
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
        throw new Error(`Sonarr API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Sonarr API request failed:', error);
      throw error;
    }
  }

  async getSeries(): Promise<SonarrSeries[]> {
    try {
      return await this.makeRequest('/series');
    } catch (error) {
      console.error('Failed to fetch Sonarr series:', error);
      return [];
    }
  }

  async getQueue(): Promise<SonarrQueueItem[]> {
    try {
      return await this.makeRequest('/queue');
    } catch (error) {
      console.error('Failed to fetch Sonarr queue:', error);
      return [];
    }
  }

  async searchSeries(query: string): Promise<any[]> {
    try {
      const response = await this.makeRequest(`/series/lookup?term=${encodeURIComponent(query)}`);
      return response || [];
    } catch (error) {
      console.error('Failed to search Sonarr series:', error);
      return [];
    }
  }

  async addSeries(seriesData: {
    title: string;
    titleSlug: string;
    tvdbId: number;
    qualityProfileId: number;
    rootFolderPath: string;
    monitored: boolean;
    searchForMissingEpisodes: boolean;
    seasonFolder: boolean;
    tags: string[];
  }): Promise<SonarrSeries | null> {
    try {
      const response = await this.makeRequest('/series', {
        method: 'POST',
        body: JSON.stringify(seriesData),
      });
      return response;
    } catch (error) {
      console.error('Failed to add series to Sonarr:', error);
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
      console.error('Sonarr connection test failed:', error);
      return false;
    }
  }
}

export default SonarrService;
