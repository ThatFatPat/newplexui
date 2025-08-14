import axios from 'axios';
import { SonarrSeries, SonarrImage } from '../types';

class SonarrService {
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

  async getSeries(): Promise<SonarrSeries[]> {
    try {
      const response = await axios.get(`${this.baseURL}/series`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching Sonarr series:', error);
      throw error;
    }
  }

  async getSeriesById(id: number): Promise<SonarrSeries> {
    try {
      const response = await axios.get(`${this.baseURL}/series/${id}`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching Sonarr series by ID:', error);
      throw error;
    }
  }

  async searchSeries(query: string): Promise<SonarrSeries[]> {
    try {
      const response = await axios.get(`${this.baseURL}/series/lookup`, {
        headers: this.getHeaders(),
        params: { term: query },
      });
      return response.data;
    } catch (error) {
      console.error('Error searching Sonarr series:', error);
      throw error;
    }
  }

  async addSeries(series: {
    tvdbId: number;
    title: string;
    qualityProfileId: number;
    rootFolderPath: string;
    seasonFolder: boolean;
    monitored: boolean;
    searchForMissingEpisodes: boolean;
  }): Promise<SonarrSeries> {
    try {
      const response = await axios.post(`${this.baseURL}/series`, series, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error adding Sonarr series:', error);
      throw error;
    }
  }

  async updateSeries(series: SonarrSeries): Promise<SonarrSeries> {
    try {
      const response = await axios.put(`${this.baseURL}/series`, series, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error updating Sonarr series:', error);
      throw error;
    }
  }

  async deleteSeries(id: number, deleteFiles: boolean = false): Promise<void> {
    try {
      await axios.delete(`${this.baseURL}/series/${id}`, {
        headers: this.getHeaders(),
        params: { deleteFiles },
      });
    } catch (error) {
      console.error('Error deleting Sonarr series:', error);
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

  getImageUrl(image: SonarrImage): string {
    if (image.remoteUrl) {
      return image.remoteUrl;
    }
    return `${this.baseURL}/image/${image.url}`;
  }
}

export const sonarrService = new SonarrService();
