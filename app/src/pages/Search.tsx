import { useState, useMemo, useCallback } from 'react';
import { Search as SearchIcon, Film, Tv, Plus, Eye, Star, Calendar, Clock, Users, CheckCircle, AlertCircle, X } from 'lucide-react';
import { useConfig } from '../contexts/ConfigContext';
import TMDBService from '../services/tmdbService';
import SonarrService from '../services/sonarrService';
import RadarrService from '../services/radarrService';
import './Search.css';

interface SearchResult {
  id: number;
  title: string;
  type: 'movie' | 'show';
  year?: number;
  overview?: string;
  posterPath?: string;
  backdropPath?: string;
  voteAverage?: number;
  voteCount?: number;
  releaseDate?: string;
  firstAirDate?: string;
  genres?: string[];
  runtime?: number;
  episodeRunTime?: number[];
  status?: string;
  numberOfSeasons?: number;
  numberOfEpisodes?: number;
}

interface AddToServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: SearchResult | null;
  onAdd: (service: 'sonarr' | 'radarr', options: any) => void;
}

const AddToServiceModal = ({ isOpen, onClose, item, onAdd }: AddToServiceModalProps) => {
  const [selectedService, setSelectedService] = useState<'sonarr' | 'radarr'>('radarr');
  const [options, setOptions] = useState({
    qualityProfileId: 1,
    rootFolderPath: '',
    monitored: true,
    searchForMissingEpisodes: true,
    seasonFolder: true,
    tags: []
  });

  if (!isOpen || !item) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(selectedService, options);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add to {selectedService === 'sonarr' ? 'Sonarr' : 'Radarr'}</h2>
          <button onClick={onClose} className="close-button">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="modal-body">
          <div className="item-preview">
            {item.posterPath ? (
              <img src={`https://image.tmdb.org/t/p/w200${item.posterPath}`} alt={item.title} />
            ) : (
              <div className="placeholder-poster">
                {item.type === 'movie' ? <Film className="w-8 h-8" /> : <Tv className="w-8 h-8" />}
              </div>
            )}
            <div className="item-info">
              <h3>{item.title}</h3>
              <p>{item.year} • {item.type === 'movie' ? 'Movie' : 'TV Show'}</p>
              {item.overview && <p className="overview">{item.overview}</p>}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="add-form">
            <div className="form-group">
              <label>Service:</label>
              <div className="service-selector">
                <button
                  type="button"
                  className={`service-option ${selectedService === 'radarr' ? 'active' : ''}`}
                  onClick={() => setSelectedService('radarr')}
                >
                  <Film className="w-4 h-4" />
                  Radarr (Movies)
                </button>
                <button
                  type="button"
                  className={`service-option ${selectedService === 'sonarr' ? 'active' : ''}`}
                  onClick={() => setSelectedService('sonarr')}
                >
                  <Tv className="w-4 h-4" />
                  Sonarr (TV Shows)
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Quality Profile:</label>
              <select
                value={options.qualityProfileId}
                onChange={(e) => setOptions({ ...options, qualityProfileId: parseInt(e.target.value) })}
                className="form-select"
              >
                <option value={1}>HD-1080p</option>
                <option value={2}>HD-720p</option>
                <option value={3}>Bluray-1080p</option>
                <option value={4}>Bluray-720p</option>
              </select>
            </div>

            <div className="form-group">
              <label>Root Folder:</label>
              <select
                value={options.rootFolderPath}
                onChange={(e) => setOptions({ ...options, rootFolderPath: e.target.value })}
                className="form-select"
                required
              >
                <option value="">Select a folder...</option>
                <option value="/movies">/movies</option>
                <option value="/tv">/tv</option>
                <option value="/downloads/movies">/downloads/movies</option>
                <option value="/downloads/tv">/downloads/tv</option>
              </select>
            </div>

            {selectedService === 'sonarr' && (
              <>
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={options.searchForMissingEpisodes}
                      onChange={(e) => setOptions({ ...options, searchForMissingEpisodes: e.target.checked })}
                    />
                    Search for missing episodes
                  </label>
                </div>

                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={options.seasonFolder}
                      onChange={(e) => setOptions({ ...options, seasonFolder: e.target.checked })}
                    />
                    Use season folders
                  </label>
                </div>
              </>
            )}

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={options.monitored}
                  onChange={(e) => setOptions({ ...options, monitored: e.target.checked })}
                />
                Monitor for new releases
              </label>
            </div>

            <div className="form-actions">
              <button type="button" onClick={onClose} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                <Plus className="w-4 h-4" />
                Add to {selectedService === 'sonarr' ? 'Sonarr' : 'Radarr'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const Search = () => {
  const { config } = useConfig();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SearchResult | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Initialize services
  const tmdbService = useMemo(() => {
    // For now, we'll use a placeholder API key - in production this should come from config
    // You can set this in your .env file as REACT_APP_TMDB_API_KEY
    const apiKey = 'your-tmdb-api-key-here'; // Replace with actual API key
    if (apiKey && apiKey !== 'your-tmdb-api-key-here') {
      return new TMDBService({
        apiKey,
        baseUrl: 'https://api.themoviedb.org/3'
      });
    }
    return null;
  }, []);

  const sonarrService = useMemo(() => {
    if (config.sonarr?.apiKey && config.sonarr?.host && config.sonarr?.port && config.sonarr?.scheme) {
      return new SonarrService({
        url: `${config.sonarr.scheme}://${config.sonarr.host}:${config.sonarr.port}`,
        apiKey: config.sonarr.apiKey
      });
    }
    return null;
  }, [config.sonarr]);

  const radarrService = useMemo(() => {
    if (config.radarr?.apiKey && config.radarr?.host && config.radarr?.port && config.radarr?.scheme) {
      return new RadarrService({
        url: `${config.radarr.scheme}://${config.radarr.host}:${config.radarr.port}`,
        apiKey: config.radarr.apiKey
      });
    }
    return null;
  }, [config.radarr]);

  const searchMedia = useCallback(async (query: string) => {
    if (!query.trim() || !tmdbService) return;
    
    setLoading(true);
    try {
      const results = await tmdbService.searchAll(query);
      
      const mappedResults: SearchResult[] = results.map(item => ({
        id: item.id,
        title: item.type === 'movie' ? item.title : item.name,
        type: item.type,
        year: item.year,
        overview: item.overview,
        posterPath: item.posterPath,
        backdropPath: item.backdropPath,
        voteAverage: item.voteAverage,
        voteCount: item.voteCount,
        releaseDate: item.type === 'movie' ? item.releaseDate : undefined,
        firstAirDate: item.type === 'show' ? item.firstAirDate : undefined,
        genres: item.genres,
        runtime: item.type === 'movie' ? item.runtime : undefined,
        episodeRunTime: item.type === 'show' ? item.episodeRunTime : undefined,
        status: item.type === 'show' ? item.status : undefined,
        numberOfSeasons: item.type === 'show' ? item.numberOfSeasons : undefined,
        numberOfEpisodes: item.type === 'show' ? item.numberOfEpisodes : undefined
      }));
      
      setSearchResults(mappedResults);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, [tmdbService]);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchMedia(searchQuery);
    }
  }, [searchQuery, searchMedia]);

  const handleAddToService = useCallback(async (service: 'sonarr' | 'radarr', options: any) => {
    if (!selectedItem || !sonarrService || !radarrService) return;
    
    try {
      if (service === 'sonarr' && selectedItem.type === 'show') {
        const seriesData = {
          title: selectedItem.title,
          titleSlug: selectedItem.title.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          tvdbId: selectedItem.id,
          qualityProfileId: options.qualityProfileId,
          rootFolderPath: options.rootFolderPath,
          monitored: options.monitored,
          searchForMissingEpisodes: options.searchForMissingEpisodes,
          seasonFolder: options.seasonFolder,
          tags: options.tags
        };
        
        const result = await sonarrService.addSeries(seriesData);
        if (result) {
          alert(`Successfully added ${selectedItem.title} to Sonarr!`);
        } else {
          throw new Error('Failed to add series');
        }
      } else if (service === 'radarr' && selectedItem.type === 'movie') {
        const movieData = {
          title: selectedItem.title,
          titleSlug: selectedItem.title.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          tmdbId: selectedItem.id,
          qualityProfileId: options.qualityProfileId,
          rootFolderPath: options.rootFolderPath,
          monitored: options.monitored,
          tags: options.tags
        };
        
        const result = await radarrService.addMovie(movieData);
        if (result) {
          alert(`Successfully added ${selectedItem.title} to Radarr!`);
        } else {
          throw new Error('Failed to add movie');
        }
      } else {
        throw new Error(`Cannot add ${selectedItem.type} to ${service}`);
      }
    } catch (error) {
      console.error(`Error adding to ${service}:`, error);
      alert(`Failed to add ${selectedItem.title} to ${service === 'sonarr' ? 'Sonarr' : 'Radarr'}. Please check your configuration.`);
    }
  }, [selectedItem, sonarrService, radarrService]);

  const openAddModal = useCallback((item: SearchResult) => {
    setSelectedItem(item);
    setShowModal(true);
  }, []);

  return (
    <div className="search-page">
      <div className="search-header">
        <h1>Search Media</h1>
        <p>Find movies and TV shows to add to your collection</p>
      </div>

      <form onSubmit={handleSearch} className="search-form">
        <div className="search-input-container">
          <SearchIcon className="search-icon" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for movies or TV shows..."
            className="search-input"
            required
          />
          <button type="submit" className="search-button" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {loading && (
        <div className="loading">
          <div className="spinner"></div>
          <p>Searching...</p>
        </div>
      )}

      {searchResults.length > 0 && (
        <div className="search-results">
          <h2>Results ({searchResults.length})</h2>
          <div className="results-grid">
            {searchResults.map((item) => (
              <div key={`${item.type}-${item.id}`} className="result-card">
                <div className="card-image">
                  {item.posterPath ? (
                    <img src={`https://image.tmdb.org/t/p/w300${item.posterPath}`} alt={item.title} />
                  ) : (
                    <div className="placeholder-image">
                      {item.type === 'movie' ? <Film className="w-12 h-12" /> : <Tv className="w-12 h-12" />}
                    </div>
                  )}
                  <div className="card-overlay">
                    <button
                      onClick={() => openAddModal(item)}
                      className="add-button"
                    >
                      <Plus className="w-5 h-5" />
                      Add to {item.type === 'movie' ? 'Radarr' : 'Sonarr'}
                    </button>
                  </div>
                </div>
                
                <div className="card-content">
                  <div className="card-header">
                    <h3 className="card-title">{item.title}</h3>
                    <div className="card-type">
                      {item.type === 'movie' ? <Film className="w-4 h-4" /> : <Tv className="w-4 h-4" />}
                    </div>
                  </div>
                  
                  <div className="card-meta">
                    {item.year && <span className="year">{item.year}</span>}
                    {item.voteAverage && (
                      <div className="rating">
                        <Star className="w-4 h-4 fill-current" />
                        <span>{item.voteAverage.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                  
                  {item.overview && (
                    <p className="overview">{item.overview}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <AddToServiceModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        item={selectedItem}
        onAdd={handleAddToService}
      />
    </div>
  );
};

export default Search;
