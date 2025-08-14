import axios from 'axios';
import { RadarrMovie, RadarrImage } from '../types';

class RadarrService {
  private baseURL: string = '';
  private apiKey: string = '';

  initialize(config: { host: string; port: number; apiKey: string; scheme: 'http' | 'https' }) {
    this.baseURL = `${config.scheme}://${config.host}:${config.port}/api/v3`;
    this.apiKey = config.apiKey;
  }

  private getHeaders() {
    return {
      'X-Api-Key': this.apiKey,
      'Content-Type': 'application/json',
    };
  }

  async getMovies(): Promise<RadarrMovie[]> {
    try {
      const response = await axios.get(`${this.baseURL}/movie`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching Radarr movies:', error);
      throw error;
    }
  }

  async getMovieById(id: number): Promise<RadarrMovie> {
    try {
      const response = await axios.get(`${this.baseURL}/movie/${id}`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching Radarr movie by ID:', error);
      throw error;
    }
  }

  async searchMovies(query: string): Promise<RadarrMovie[]> {
    try {
      const response = await axios.get(`${this.baseURL}/movie/lookup`, {
        headers: this.getHeaders(),
        params: { term: query },
      });
      return response.data;
    } catch (error) {
      console.error('Error searching Radarr movies:', error);
      throw error;
    }
  }

  async addMovie(movie: {
    tmdbId: number;
    title: string;
    qualityProfileId: number;
    rootFolderPath: string;
    monitored: boolean;
    searchForMovie: boolean;
  }): Promise<RadarrMovie> {
    try {
      const response = await axios.post(`${this.baseURL}/movie`, movie, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error adding Radarr movie:', error);
      throw error;
    }
  }

  async updateMovie(movie: RadarrMovie): Promise<RadarrMovie> {
    try {
      const response = await axios.put(`${this.baseURL}/movie`, movie, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error updating Radarr movie:', error);
      throw error;
    }
  }

  async deleteMovie(id: number, deleteFiles: boolean = false): Promise<void> {
    try {
      await axios.delete(`${this.baseURL}/movie/${id}`, {
        headers: this.getHeaders(),
        params: { deleteFiles },
      });
    } catch (error) {
      console.error('Error deleting Radarr movie:', error);
      throw error;
    }
  }

  async getQualityProfiles(): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseURL}/qualityprofile`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching quality profiles:', error);
      throw error;
    }
  }

  async getRootFolders(): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseURL}/rootfolder`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching root folders:', error);
      throw error;
    }
  }

  async getSystemStatus(): Promise<any> {
    try {
      const response = await axios.get(`${this.baseURL}/system/status`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching system status:', error);
      throw error;
    }
  }

  async getCalendar(startDate?: string, endDate?: string): Promise<any[]> {
    try {
      const params: any = {};
      if (startDate) params.start = startDate;
      if (endDate) params.end = endDate;

      const response = await axios.get(`${this.baseURL}/calendar`, {
        headers: this.getHeaders(),
        params,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching calendar:', error);
      throw error;
    }
  }

  async getWantedMissing(page: number = 1, pageSize: number = 20): Promise<any> {
    try {
      const response = await axios.get(`${this.baseURL}/wanted/missing`, {
        headers: this.getHeaders(),
        params: { page, pageSize },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching wanted missing:', error);
      throw error;
    }
  }

  async getHistory(page: number = 1, pageSize: number = 20): Promise<any> {
    try {
      const response = await axios.get(`${this.baseURL}/history`, {
        headers: this.getHeaders(),
        params: { page, pageSize },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching history:', error);
      throw error;
    }
  }

  async getCollections(): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseURL}/collection`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching collections:', error);
      throw error;
    }
  }

  async getCollectionById(id: number): Promise<any> {
    try {
      const response = await axios.get(`${this.baseURL}/collection/${id}`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching collection by ID:', error);
      throw error;
    }
  }

  async addCollection(collection: {
    tmdbId: number;
    title: string;
    qualityProfileId: number;
    rootFolderPath: string;
    monitored: boolean;
    searchForMovie: boolean;
  }): Promise<any> {
    try {
      const response = await axios.post(`${this.baseURL}/collection`, collection, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error adding collection:', error);
      throw error;
    }
  }

  getImageUrl(image: RadarrImage): string {
    if (image.remoteUrl) {
      return image.remoteUrl;
    }
    return `${this.baseURL}/image/${image.url}`;
  }
}

export const radarrService = new RadarrService();
