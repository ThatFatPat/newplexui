import { PlexAPI } from '@lukehagar/plexjs';
import { PlexMedia, PlexLibrary, PlexServer } from '../types';

class PlexService {
  private plexAPI: PlexAPI | null = null;
  private config: { host: string; port: number; token: string; scheme: 'http' | 'https' } | null = null;

  initialize(config: { host: string; port: number; token: string; scheme: 'http' | 'https' }) {
    this.config = config;
    this.plexAPI = new PlexAPI({
      accessToken: config.token,
      baseUrl: `${config.scheme}://${config.host}:${config.port}`,
    });
  }

  private getAPI(): PlexAPI {
    if (!this.plexAPI) {
      throw new Error('Plex API not initialized. Call initialize() first.');
    }
    return this.plexAPI;
  }

  async getServers(): Promise<PlexServer[]> {
    try {
      const response = await this.getAPI().server.getServerList();
      return response.MediaContainer.Server || [];
    } catch (error) {
      console.error('Error fetching Plex servers:', error);
      throw error;
    }
  }

  async getLibraries(): Promise<PlexLibrary[]> {
    try {
      const response = await this.getAPI().library.getAllLibraries();
      return response.MediaContainer.Directory || [];
    } catch (error) {
      console.error('Error fetching Plex libraries:', error);
      throw error;
    }
  }

  async getLibraryItems(libraryId: number, limit: number = 50, offset: number = 0): Promise<PlexMedia[]> {
    try {
      const response = await this.getAPI().library.getLibraryItems(libraryId, {
        limit,
        offset,
        sort: 'addedAt:desc',
      });
      return response.MediaContainer.Metadata || [];
    } catch (error) {
      console.error('Error fetching library items:', error);
      throw error;
    }
  }

  async searchLibrary(libraryId: number, query: string): Promise<PlexMedia[]> {
    try {
      const response = await this.getAPI().library.getSearchLibrary(libraryId, {
        query,
        limit: 50,
      });
      return response.MediaContainer.Metadata || [];
    } catch (error) {
      console.error('Error searching library:', error);
      throw error;
    }
  }

  async getMediaDetails(mediaId: number): Promise<PlexMedia> {
    try {
      const response = await this.getAPI().library.getMediaMetaData(mediaId);
      return response.MediaContainer.Metadata[0];
    } catch (error) {
      console.error('Error fetching media details:', error);
      throw error;
    }
  }

  async getRecentlyAdded(limit: number = 20): Promise<PlexMedia[]> {
    try {
      const response = await this.getAPI().library.getRecentlyAddedLibrary({
        limit,
      });
      return response.MediaContainer.Metadata || [];
    } catch (error) {
      console.error('Error fetching recently added:', error);
      throw error;
    }
  }

  async getOnDeck(): Promise<PlexMedia[]> {
    try {
      const response = await this.getAPI().library.getOnDeck();
      return response.MediaContainer.Metadata || [];
    } catch (error) {
      console.error('Error fetching on deck:', error);
      throw error;
    }
  }

  async markAsWatched(mediaId: number): Promise<void> {
    try {
      await this.getAPI().media.markPlayed(mediaId);
    } catch (error) {
      console.error('Error marking as watched:', error);
      throw error;
    }
  }

  async markAsUnwatched(mediaId: number): Promise<void> {
    try {
      await this.getAPI().media.markUnplayed(mediaId);
    } catch (error) {
      console.error('Error marking as unwatched:', error);
      throw error;
    }
  }

  async updatePlayProgress(mediaId: number, time: number, duration: number): Promise<void> {
    try {
      await this.getAPI().media.updatePlayProgress(mediaId, {
        time: Math.floor(time / 1000), // Convert to seconds
        duration: Math.floor(duration / 1000),
      });
    } catch (error) {
      console.error('Error updating play progress:', error);
      throw error;
    }
  }

  getStreamUrl(mediaId: number, partId: number): string {
    if (!this.config) {
      throw new Error('Plex API not initialized');
    }
    return `${this.config.scheme}://${this.config.host}:${this.config.port}/library/parts/${partId}/file?X-Plex-Token=${this.config.token}`;
  }

  getImageUrl(path: string, width: number = 300): string {
    if (!this.config) {
      throw new Error('Plex API not initialized');
    }
    return `${this.config.scheme}://${this.config.host}:${this.config.port}${path}?X-Plex-Token=${this.config.token}&width=${width}`;
  }
}

export const plexService = new PlexService();
