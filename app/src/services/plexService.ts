export interface PlexMedia {
  id: number;
  title: string;
  type: 'movie' | 'show';
  year?: number;
  summary?: string;
  rating?: number;
  duration?: number;
  thumb?: string;
  art?: string;
  banner?: string;
  genres?: string[];
  addedAt?: string;
  updatedAt?: string;
  viewCount?: number;
  lastViewedAt?: string;
  guid?: string;
}

import type { PlexSeason } from '../types';

export interface PlexConfig {
  url: string;
  token: string;
}

class PlexService {
  private config: PlexConfig;

  constructor(config: PlexConfig) {
    this.config = config;
  }

  private async makeRequest(endpoint: string): Promise<any> {
    if (!this.config.token || !this.config.url) {
      throw new Error('Plex configuration is incomplete');
    }

    const url = `${this.config.url}${endpoint}`;
    const headers = {
      'X-Plex-Token': this.config.token,
      'Accept': 'application/json'
    };

    try {
      const response = await fetch(url, { headers });

      if (!response.ok) {
        throw new Error(`Plex API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Plex API request failed:', error);
      throw error;
    }
  }

  async getLibrary(): Promise<PlexMedia[]> {
    try {
      const data = await this.makeRequest('/library/sections');

      if (!data.MediaContainer || !data.MediaContainer.Directory) {
        return [];
      }

      const sections = data.MediaContainer.Directory;
      const allMedia: PlexMedia[] = [];

      for (const section of sections) {
        if (section.type === 'movie' || section.type === 'show') {
          const sectionData = await this.makeRequest(`/library/sections/${section.key}/all`);

          if (sectionData.MediaContainer && sectionData.MediaContainer.Metadata) {
            const mediaItems = sectionData.MediaContainer.Metadata.map((item: any) => ({
              id: parseInt(item.ratingKey),
              title: item.title,
              type: section.type as 'movie' | 'show',
              year: item.year ? parseInt(item.year) : undefined,
              summary: item.summary,
              rating: item.rating ? parseFloat(item.rating) : undefined,
              duration: item.duration ? parseInt(item.duration) : undefined,
              thumb: item.thumb ? `${this.config.url}${item.thumb}?X-Plex-Token=${this.config.token}` : undefined,
              art: item.art ? `${this.config.url}${item.art}?X-Plex-Token=${this.config.token}` : undefined,
              banner: item.banner ? `${this.config.url}${item.banner}?X-Plex-Token=${this.config.token}` : undefined,
              genres: item.Genre ? item.Genre.map((g: any) => g.tag) : [],
              addedAt: item.addedAt ? new Date(parseInt(item.addedAt) * 1000).toISOString() : undefined,
              updatedAt: item.updatedAt ? new Date(parseInt(item.updatedAt) * 1000).toISOString() : undefined,
              viewCount: item.viewCount ? parseInt(item.viewCount) : 0,
              lastViewedAt: item.lastViewedAt ? new Date(parseInt(item.lastViewedAt) * 1000).toISOString() : undefined,
              guid: item.guid || undefined
            }));

            allMedia.push(...mediaItems);
          }
        }
      }

      return allMedia;
    } catch (error) {
      console.error('Failed to fetch Plex library:', error);
      return [];
    }
  }

  async getMediaDetails(mediaId: number): Promise<PlexMedia | null> {
    try {
      const data = await this.makeRequest(`/library/metadata/${mediaId}`);

      if (!data.MediaContainer || !data.MediaContainer.Metadata || !data.MediaContainer.Metadata[0]) {
        return null;
      }

      const item = data.MediaContainer.Metadata[0];

      return {
        id: parseInt(item.ratingKey),
        title: item.title,
        type: item.type as 'movie' | 'show',
        year: item.year ? parseInt(item.year) : undefined,
        summary: item.summary,
        rating: item.rating ? parseFloat(item.rating) : undefined,
        duration: item.duration ? parseInt(item.duration) : undefined,
        thumb: item.thumb ? `${this.config.url}${item.thumb}?X-Plex-Token=${this.config.token}` : undefined,
        art: item.art ? `${this.config.url}${item.art}?X-Plex-Token=${this.config.token}` : undefined,
        banner: item.banner ? `${this.config.url}${item.banner}?X-Plex-Token=${this.config.token}` : undefined,
        genres: item.Genre ? item.Genre.map((g: any) => g.tag) : [],
        addedAt: item.addedAt ? new Date(parseInt(item.addedAt) * 1000).toISOString() : undefined,
        updatedAt: item.updatedAt ? new Date(parseInt(item.updatedAt) * 1000).toISOString() : undefined,
        viewCount: item.viewCount ? parseInt(item.viewCount) : 0,
        lastViewedAt: item.lastViewedAt ? new Date(parseInt(item.lastViewedAt) * 1000).toISOString() : undefined,
        guid: item.guid || undefined
      };
    } catch (error) {
      console.error('Failed to fetch media details:', error);
      return null;
    }
  }
  /**
   * Fetches seasons and episodes for a given show ID.
   * @param showId The ID of the show.
   * @returns An array of PlexSeason objects, or an empty array if no seasons are found.  Throws an error if the request fails.
   */
  async getShowSeasons(showId: number): Promise<PlexSeason[]> {
    try {
      const data = await this.makeRequest(`/library/metadata/${showId}/children`);
      if (!data.MediaContainer || !data.MediaContainer.Metadata) {
        return [];
      }
      // For each season, fetch its episodes
      const seasons = await Promise.all(
        data.MediaContainer.Metadata.map(async (season: any) => {
          let episodes: any[] = [];
          try {
            const episodesData = await this.makeRequest(`/library/metadata/${season.ratingKey}/children`);
            if (episodesData.MediaContainer && episodesData.MediaContainer.Metadata) {
              episodes = episodesData.MediaContainer.Metadata.map((episode: any) => ({
                id: parseInt(episode.ratingKey),
                title: episode.title,
                duration: episode.duration ? parseInt(episode.duration) : undefined,
                summary: episode.summary || undefined,
                thumb: episode.thumb ? `${this.config.url}${episode.thumb}?X-Plex-Token=${this.config.token}` : undefined,
              }));
            }
          } catch (e) {
            // If fetching episodes fails, leave episodes empty
          }
          return {
            id: parseInt(season.ratingKey),
            title: season.title,
            episodes,
          };
        })
      );
      return seasons;
    } catch (error) {
      console.error('Failed to fetch show seasons:', error);
      throw error;
    }
  }

  async searchLibrary(query: string): Promise<PlexMedia[]> {
    try {
      const data = await this.makeRequest(`/search?query=${encodeURIComponent(query)}`);

      if (!data.MediaContainer || !data.MediaContainer.Metadata) {
        return [];
      }

      return data.MediaContainer.Metadata.map((item: any) => ({
        id: parseInt(item.ratingKey),
        title: item.title,
        type: item.type as 'movie' | 'show',
        year: item.year ? parseInt(item.year) : undefined,
        summary: item.summary,
        rating: item.rating ? parseFloat(item.rating) : undefined,
        duration: item.duration ? parseInt(item.duration) : undefined,
        thumb: item.thumb ? `${this.config.url}${item.thumb}?X-Plex-Token=${this.config.token}` : undefined,
        art: item.art ? `${this.config.url}${item.art}?X-Plex-Token=${this.config.token}` : undefined,
        banner: item.banner ? `${this.config.url}${item.banner}?X-Plex-Token=${this.config.token}` : undefined,
        genres: item.Genre ? item.Genre.map((g: any) => g.tag) : [],
        addedAt: item.addedAt ? new Date(parseInt(item.addedAt) * 1000).toISOString() : undefined,
        updatedAt: item.updatedAt ? new Date(parseInt(item.updatedAt) * 1000).toISOString() : undefined,
        viewCount: item.viewCount ? parseInt(item.viewCount) : 0,
        lastViewedAt: item.lastViewedAt ? new Date(parseInt(item.lastViewedAt) * 1000).toISOString() : undefined
      }));
    } catch (error) {
      console.error('Failed to search Plex library:', error);
      return [];
    }
  }
}

export default PlexService;

