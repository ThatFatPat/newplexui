import { useState, useMemo, useCallback, useEffect } from 'react';
import { Search as SearchIcon, Film, Tv, Plus, Star, X } from 'lucide-react';
import { useConfig } from '../contexts/ConfigContext';
import SonarrService from '../services/sonarrService';
import RadarrService from '../services/radarrService';
import PlexService from '../services/plexService';
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
  onAdd: (options: any) => void;
}

interface QualityProfile {
  id: number;
  name: string;
}

interface RootFolder {
  path: string;
  id: number;
}

const AddToServiceModal = ({ isOpen, onClose, item, onAdd }: AddToServiceModalProps) => {
  const { config } = useConfig();
  const [options, setOptions] = useState({
    qualityProfileId: 1,
    rootFolderPath: '',
    monitored: true,
    searchForMissingEpisodes: true,
    seasonFolder: true,
    tags: []
  });
  const [qualityProfiles, setQualityProfiles] = useState<QualityProfile[]>([]);
  const [rootFolders, setRootFolders] = useState<RootFolder[]>([]);
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

    const plexService = useMemo(() => {
        if (config.plex?.token && config.plex?.host && config.plex?.port && config.plex?.scheme) {
            return new PlexService({
                url: `${config.plex.scheme}://${config.plex.host}:${config.plex.port}`,
                token: config.plex.token
            });
        }
        return null;
    }, [config.plex]);

  useEffect(() => {
    if (!isOpen || !item) return;

    const fetchData = async () => {
      try {
        if (item.type === 'movie' && radarrService) {
          const profiles = await radarrService.getQualityProfiles();
          setQualityProfiles(profiles);
          const folders = await radarrService.getRootFolders();
          setRootFolders(folders);
        } else if (item.type === 'show' && sonarrService) {
          const profiles = await sonarrService.getQualityProfiles();
          setQualityProfiles(profiles);
          const folders = await sonarrService.getRootFolders();
          setRootFolders(folders);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [isOpen, item, radarrService, sonarrService]);

  if (!isOpen || !item) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(options);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add to {item?.type === 'show' ? 'Sonarr' : 'Radarr'}</h2>
          <button onClick={onClose} className="close-button">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="modal-body">
          <div className="item-preview">
            {item.posterPath ? (
              <img src={item.posterPath} alt={item.title} />
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
            {/* Quality profile */}
            <div className="form-group">
              <label>Quality Profile:</label>
              <select
                value={options.qualityProfileId}
                onChange={(e) => setOptions({ ...options, qualityProfileId: parseInt(e.target.value) })}
                className="form-select"
              >
                {qualityProfiles.map((profile) => (
                  <option key={profile.id} value={profile.id}>
                    {profile.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Root folder */}
            <div className="form-group">
              <label>Root Folder:</label>
              <select
                value={options.rootFolderPath}
                onChange={(e) => setOptions({ ...options, rootFolderPath: e.target.value })}
                className="form-select"
                required
              >
                <option value="">Select a folder...</option>
                {rootFolders.map((folder) => (
                  <option key={folder.id} value={folder.path}>
                    {folder.path}
                  </option>
                ))}
              </select>
            </div>

            {item?.type === 'show' && (
              <div className="sonarr-options">
                <div className="form-group checkbox-group">
                  <label className="toggle-label">
                    <input
                      type="checkbox"
                      checked={options.searchForMissingEpisodes}
                      onChange={(e) => setOptions({ ...options, searchForMissingEpisodes: e.target.checked })}
                      className="toggle-input"
                    />
                    <span className="toggle-text">Search for missing episodes</span>
                  </label>
                </div>

                <div className="form-group checkbox-group">
                  <label className="toggle-label">
                    <input
                      type="checkbox"
                      checked={options.seasonFolder}
                      onChange={(e) => setOptions({ ...options, seasonFolder: e.target.checked })}
                      className="toggle-input"
                    />
                    <span className="toggle-text">Use season folders</span>
                  </label>
                </div>
              </div>
            )}

            {/* Monitor option */}
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
                Add to {item?.type === 'show' ? 'Sonarr' : 'Radarr'}
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
    const [existingMedia, setExistingMedia] = useState<{[key: string]: boolean}>({});

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

    const plexService = useMemo(() => {
        if (config.plex?.token && config.plex?.host && config.plex?.port && config.plex?.scheme) {
            return new PlexService({
                url: `${config.plex.scheme}://${config.plex.host}:${config.plex.port}`,
                token: config.plex.token
            });
        }
        return null;
    }, [config.plex]);

    const searchMedia = useCallback(async (query: string) => {
        if (!query.trim() || (!sonarrService && !radarrService)) return;
        setLoading(true);

        try {
            let results: SearchResult[] = [];

            if (radarrService) {
                const movies = await radarrService.searchMovies(query);
                movies.forEach((m: any) => {
                    results.push({
                        id: m.tmdbId || m.imdbId || m.titleSlug,
                        title: m.title,
                        type: 'movie',
                        year: m.year,
                        overview: m.overview,
                        posterPath: m.remotePoster,
                        releaseDate: m.inCinemas,
                        runtime: m.runtime,
                        genres: m.genres,
                        voteAverage: m.ratings?.value,
                        voteCount: m.ratings?.votes
                    });
                });
            }

            if (sonarrService) {
                const shows = await sonarrService.searchSeries(query);
                shows.forEach((s: any) => {
                    results.push({
                        id: s.tvdbId || s.imdbId || s.titleSlug,
                        title: s.title,
                        type: 'show',
                        year: s.year,
                        overview: s.overview,
                        posterPath: s.remotePoster,
                        firstAirDate: s.firstAired,
                        episodeRunTime: s.runtime ? [s.runtime] : [],
                        numberOfSeasons: s.seasons?.length,
                        genres: s.genres,
                        status: s.status
                    });
                });
            }

            // Relevance sorting
            results = results.sort((a, b) => {
                const queryLower = query.toLowerCase();
                const aTitleLower = a.title.toLowerCase();
                const bTitleLower = b.title.toLowerCase();

                const aExactMatch = aTitleLower === queryLower;
                const bExactMatch = bTitleLower === queryLower;

                if (aExactMatch && !bExactMatch) return -1; // a is better
                if (!aExactMatch && bExactMatch) return 1; // b is better

                // Basic relevance using vote count, can be improved
                const aRelevance = a.voteCount || 0;
                const bRelevance = b.voteCount || 0;

                return bRelevance - aRelevance;
            });

             // Check existing media
            if (plexService) {
                try {
                    const plexLibrary = await plexService.getLibrary();
                    const existing = {};

                    results.forEach(item => {
                        const exists = plexLibrary.some(plexItem => plexItem.title === item.title && plexItem.type === item.type);
                        existing[item.id] = exists;
                    });

                    setExistingMedia(existing);

                } catch (error) {
                    console.error('Error fetching Plex library:', error);
                }
            }

            setSearchResults(results);

        } catch (error) {
            console.error('Search error:', error);
            setSearchResults([]);
        } finally {
            setLoading(false);
        }
    }, [sonarrService, radarrService, plexService]);

    const handleSearch = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            searchMedia(searchQuery);
        }
    }, [searchQuery, searchMedia]);

    const handleAddToService = useCallback(async (options: any) => {
        if (!selectedItem || !sonarrService || !radarrService) return;

        try {
            if (selectedItem.type === 'show') {
                const result = await sonarrService.addSeries({
                    title: selectedItem.title,
                    titleSlug: selectedItem.title.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                    tvdbId: selectedItem.id,
                    qualityProfileId: options.qualityProfileId,
                    rootFolderPath: options.rootFolderPath,
                    monitored: options.monitored,
                    searchForMissingEpisodes: options.searchForMissingEpisodes,
                    seasonFolder: options.seasonFolder,
                    tags: options.tags
                });
                if (result) alert(`Successfully added ${selectedItem.title} to Sonarr!`);
            } else if (selectedItem.type === 'movie') {
                const result = await radarrService.addMovie({
                    title: selectedItem.title,
                    titleSlug: selectedItem.title.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                    tmdbId: selectedItem.id,
                    qualityProfileId: options.qualityProfileId,
                    rootFolderPath: options.rootFolderPath,
                    monitored: options.monitored,
                    tags: options.tags
                });
                if (result) alert(`Successfully added ${selectedItem.title} to Radarr!`);
            }
        } catch (error) {
            console.error(`Error adding to ${selectedItem.type === 'show' ? 'Sonarr' : 'Radarr'}:`, error);
            alert(`Failed to add ${selectedItem.title}. Check configuration.`);
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

            {loading && <div className="loading"><div className="spinner"></div><p>Searching...</p></div>}

            {searchResults.length > 0 && (
                <div className="search-results">
                    <h2>Results ({searchResults.length})</h2>
                    <div className="results-grid">
                        {searchResults.map((item) => (
                            <div key={`${item.type}-${item.id}`} className="result-card">
                                <div className="card-image">
                                    {item.posterPath ? (
                                        <img src={item.posterPath} alt={item.title} />
                                    ) : (
                                        <div className="placeholder-image">
                                            {item.type === 'movie' ? <Film className="w-12 h-12" /> : <Tv className="w-12 h-12" />}
                                        </div>
                                    )}
                                    <div className="card-overlay">
                                        {existingMedia[item.id] ? (
                                            <a href={`/media/${item.type}/${item.id}`} className="view-button">
                                                <Star className="w-5 h-5" />
                                                View in Library
                                            </a>
                                        ) : (
                                            <button onClick={() => openAddModal(item)} className="add-button">
                                                <Plus className="w-5 h-5" />
                                                Add to {item.type === 'movie' ? 'Radarr' : 'Sonarr'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="card-content">
                                    <div className="card-header">
                                        <h3 className="card-title">{item.title}</h3>
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
                                    {item.overview && <p className="overview">{item.overview}</p>}
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
