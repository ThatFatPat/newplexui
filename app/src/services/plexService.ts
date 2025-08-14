// This service is temporarily disabled due to TypeScript compatibility issues with @lukehagar/plexjs
// We're using direct fetch calls in the components instead

/*
import type { PlexMedia, PlexLibrary, PlexServer } from '@lukehagar/plexjs';
import { PlexAPI } from '@lukehagar/plexjs';
import type { AppConfig } from '../types';

export class PlexService {
  private config: AppConfig['plex'];
  private api: PlexAPI | null = null;

  constructor(config: AppConfig['plex']) {
    this.config = config;
  }

  private getAPI(): PlexAPI {
    if (!this.api) {
      this.api = new PlexAPI({
        baseUrl: `${this.config.scheme}://${this.config.host}:${this.config.port}`,
        token: this.config.token,
      });
    }
    return this.api;
  }

  async getServers(): Promise<PlexServer[]> {
    try {
      const response = await this.getAPI().server.getServerList();
      return response.MediaContainer.Server || [];
    } catch (error) {
      console.error('Error fetching servers:', error);
      return [];
    }
  }

  async getLibraries(): Promise<PlexLibrary[]> {
    try {
      const response = await this.getAPI().library.getAllLibraries();
      return response.MediaContainer.Directory || [];
    } catch (error) {
      console.error('Error fetching libraries:', error);
      return [];
    }
  }

  async getLibraryItems(libraryId: number, limit = 50): Promise<PlexMedia[]> {
    try {
      const response = await this.getAPI().library.getLibraryItems(libraryId, {
        limit,
      });
      return response.MediaContainer.Metadata || [];
    } catch (error) {
      console.error('Error fetching library items:', error);
      return [];
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
      return [];
    }
  }

  async getMediaDetails(mediaId: number): Promise<PlexMedia | null> {
    try {
      const response = await this.getAPI().library.getMediaMetaData(mediaId);
      return response.MediaContainer.Metadata[0];
    } catch (error) {
      console.error('Error fetching media details:', error);
      return null;
    }
  }

  async getRecentlyAdded(limit = 20): Promise<PlexMedia[]> {
    try {
      const response = await this.getAPI().library.getRecentlyAddedLibrary({
        limit,
      });
      return response.MediaContainer.Metadata || [];
    } catch (error) {
      console.error('Error fetching recently added:', error);
      return [];
    }
  }

  async getOnDeck(): Promise<PlexMedia[]> {
    try {
      const response = await this.getAPI().library.getOnDeck();
      return response.MediaContainer.Metadata || [];
    } catch (error) {
      console.error('Error fetching on deck:', error);
      return [];
    }
  }

  async markAsWatched(mediaId: number): Promise<void> {
    try {
      await this.getAPI().media.markAsWatched(mediaId);
    } catch (error) {
      console.error('Error marking as watched:', error);
    }
  }

  async markAsUnwatched(mediaId: number): Promise<void> {
    try {
      await this.getAPI().media.markAsUnwatched(mediaId);
    } catch (error) {
      console.error('Error marking as unwatched:', error);
    }
  }

  async updatePlayProgress(mediaId: number, time: number): Promise<void> {
    try {
      await this.getAPI().media.updatePlayProgress(mediaId, {
        time,
        state: 'playing',
      });
    } catch (error) {
      console.error('Error updating play progress:', error);
    }
  }

  getStreamUrl(mediaId: number, partId: number): string {
    return `${this.config.scheme}://${this.config.host}:${this.config.port}/library/parts/${partId}/file?X-Plex-Token=${this.config.token}`;
  }
}

export const plexService = new PlexService({
  scheme: 'http',
  host: 'localhost',
  port: 32400,
  token: '',
});
*/

// Placeholder export to prevent import errors
export const plexService = {
  getServers: async () => [],
  getLibraries: async () => [],
  getLibraryItems: async () => [],
  searchLibrary: async () => [],
  getMediaDetails: async () => null,
  getRecentlyAdded: async () => [],
  getOnDeck: async () => [],
  markAsWatched: async () => {},
  markAsUnwatched: async () => {},
  updatePlayProgress: async () => {},
  getStreamUrl: () => '',
};
