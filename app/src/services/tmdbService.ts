export interface TMDBMovie {
  id: number;
  title: string;
  type: 'movie';
  year?: number;
  overview?: string;
  posterPath?: string;
  backdropPath?: string;
  voteAverage?: number;
  voteCount?: number;
  releaseDate?: string;
  genres?: string[];
  runtime?: number;
}

export interface TMDBShow {
  id: number;
  name: string;
  type: 'show';
  year?: number;
  overview?: string;
  posterPath?: string;
  backdropPath?: string;
  voteAverage?: number;
  voteCount?: number;
  firstAirDate?: string;
  genres?: string[];
  episodeRunTime?: number[];
  status?: string;
  numberOfSeasons?: number;
  numberOfEpisodes?: number;
}

export type TMDBResult = TMDBMovie | TMDBShow;

export interface TMDBConfig {
  apiKey: string;
  baseUrl: string;
}

class TMDBService {
  private config: TMDBConfig;

  constructor(config: TMDBConfig) {
    this.config = config;
  }

  private async makeRequest(endpoint: string): Promise<any> {
    if (!this.config.apiKey) {
      throw new Error('TMDB API key is required');
    }

    const url = `${this.config.baseUrl}${endpoint}&api_key=${this.config.apiKey}`;

    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('TMDB API request failed:', error);
      throw error;
    }
  }

  async searchMovies(query: string): Promise<TMDBMovie[]> {
    try {
      const data = await this.makeRequest(`/search/movie?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`);
      
      if (!data.results) {
        return [];
      }

      return data.results.map((movie: any) => ({
        id: movie.id,
        title: movie.title,
        type: 'movie' as const,
        year: movie.release_date ? new Date(movie.release_date).getFullYear() : undefined,
        overview: movie.overview,
        posterPath: movie.poster_path,
        backdropPath: movie.backdrop_path,
        voteAverage: movie.vote_average,
        voteCount: movie.vote_count,
        releaseDate: movie.release_date,
        genres: movie.genre_ids || [],
        runtime: movie.runtime
      }));
    } catch (error) {
      console.error('Failed to search TMDB movies:', error);
      return [];
    }
  }

  async searchShows(query: string): Promise<TMDBShow[]> {
    try {
      const data = await this.makeRequest(`/search/tv?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`);
      
      if (!data.results) {
        return [];
      }

      return data.results.map((show: any) => ({
        id: show.id,
        name: show.name,
        type: 'show' as const,
        year: show.first_air_date ? new Date(show.first_air_date).getFullYear() : undefined,
        overview: show.overview,
        posterPath: show.poster_path,
        backdropPath: show.backdrop_path,
        voteAverage: show.vote_average,
        voteCount: show.vote_count,
        firstAirDate: show.first_air_date,
        genres: show.genre_ids || [],
        episodeRunTime: show.episode_run_time,
        status: show.status,
        numberOfSeasons: show.number_of_seasons,
        numberOfEpisodes: show.number_of_episodes
      }));
    } catch (error) {
      console.error('Failed to search TMDB shows:', error);
      return [];
    }
  }

  async searchAll(query: string): Promise<TMDBResult[]> {
    try {
      const [movies, shows] = await Promise.all([
        this.searchMovies(query),
        this.searchShows(query)
      ]);

      // Combine and sort by relevance (vote average * vote count)
      const allResults = [...movies, ...shows].map(item => ({
        ...item,
        relevanceScore: (item.voteAverage || 0) * (item.voteCount || 0)
      }));

      return allResults
        .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))
        .map(({ relevanceScore, ...item }) => item);
    } catch (error) {
      console.error('Failed to search TMDB:', error);
      return [];
    }
  }

  async getMovieDetails(movieId: number): Promise<TMDBMovie | null> {
    try {
      const data = await this.makeRequest(`/movie/${movieId}?language=en-US`);
      
      return {
        id: data.id,
        title: data.title,
        type: 'movie' as const,
        year: data.release_date ? new Date(data.release_date).getFullYear() : undefined,
        overview: data.overview,
        posterPath: data.poster_path,
        backdropPath: data.backdrop_path,
        voteAverage: data.vote_average,
        voteCount: data.vote_count,
        releaseDate: data.release_date,
        genres: data.genres ? data.genres.map((g: any) => g.name) : [],
        runtime: data.runtime
      };
    } catch (error) {
      console.error('Failed to fetch movie details:', error);
      return null;
    }
  }

  async getShowDetails(showId: number): Promise<TMDBShow | null> {
    try {
      const data = await this.makeRequest(`/tv/${showId}?language=en-US`);
      
      return {
        id: data.id,
        name: data.name,
        type: 'show' as const,
        year: data.first_air_date ? new Date(data.first_air_date).getFullYear() : undefined,
        overview: data.overview,
        posterPath: data.poster_path,
        backdropPath: data.backdrop_path,
        voteAverage: data.vote_average,
        voteCount: data.vote_count,
        firstAirDate: data.first_air_date,
        genres: data.genres ? data.genres.map((g: any) => g.name) : [],
        episodeRunTime: data.episode_run_time,
        status: data.status,
        numberOfSeasons: data.number_of_seasons,
        numberOfEpisodes: data.number_of_episodes
      };
    } catch (error) {
      console.error('Failed to fetch show details:', error);
      return null;
    }
  }

  getImageUrl(path: string, size: 'w92' | 'w154' | 'w185' | 'w342' | 'w500' | 'w780' | 'original' = 'w500'): string {
    if (!path) return '';
    return `https://image.tmdb.org/t/p/${size}${path}`;
  }

  getBackdropUrl(path: string, size: 'w300' | 'w780' | 'w1280' | 'original' = 'w1280'): string {
    if (!path) return '';
    return `https://image.tmdb.org/t/p/${size}${path}`;
  }
}

export default TMDBService;
