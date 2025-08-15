import { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, Grid, List, Play, Eye, Star, Clock, Film, Tv, Download, AlertCircle, Folder, Download as QueueIcon, RefreshCw, Pause, CheckCircle, AlertTriangle } from 'lucide-react';
import { useConfig } from '../contexts/ConfigContext';
import PlexService from '../services/plexService';
import SonarrService from '../services/sonarrService';
import RadarrService from '../services/radarrService';
import './Library.css';

interface LibraryItem {
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
  source: 'plex' | 'sonarr' | 'radarr';
  status?: string;
  progress?: number;
  downloadSpeed?: string;
  eta?: string;
}

const Library = () => {
  const { config } = useConfig();
  const [activeTab, setActiveTab] = useState<'plex' | 'downloads'>('plex');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [plexItems, setPlexItems] = useState<LibraryItem[]>([]);
  const [downloadQueue, setDownloadQueue] = useState<LibraryItem[]>([]);

  // Initialize services
  const plexService = useMemo(() => {
    if (config.plex?.token && config.plex?.host && config.plex?.port && config.plex?.scheme) {
      return new PlexService({
        url: `${config.plex.scheme}://${config.plex.host}:${config.plex.port}`,
        token: config.plex.token
      });
    }
    return null;
  }, [config.plex]);

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

  const fetchLibraryData = useCallback(async () => {
    if (!plexService) return;
    
    setLoading(true);
    try {
      const plexData = await plexService.getLibrary();
      
      const mappedPlexItems: LibraryItem[] = plexData.map(item => ({
        ...item,
        source: 'plex' as const
      }));
      
      setPlexItems(mappedPlexItems);
    } catch (error) {
      console.error('Error fetching Plex library:', error);
      setPlexItems([]);
    } finally {
      setLoading(false);
    }
  }, [plexService]);

  const fetchDownloadQueue = useCallback(async () => {
    const queueItems: LibraryItem[] = [];
    
    try {
      if (sonarrService) {
        const sonarrQueue = await sonarrService.getQueue();
        const sonarrItems: LibraryItem[] = sonarrQueue.map(item => ({
          id: item.seriesId,
          title: item.series.title,
          type: 'show' as const,
          year: item.series.year,
          source: 'sonarr' as const,
          status: item.status,
          progress: item.sizeleft > 0 ? ((item.size - item.sizeleft) / item.size) * 100 : 0,
          downloadSpeed: item.downloadId ? 'Downloading...' : undefined,
          eta: item.estimatedCompletionTime ? new Date(item.estimatedCompletionTime).toLocaleString() : undefined
        }));
        queueItems.push(...sonarrItems);
      }

      if (radarrService) {
        const radarrQueue = await radarrService.getQueue();
        const radarrItems: LibraryItem[] = radarrQueue.map(item => ({
          id: item.movieId,
          title: item.movie.title,
          type: 'movie' as const,
          year: item.movie.year,
          source: 'radarr' as const,
          status: item.status,
          progress: item.sizeleft > 0 ? ((item.size - item.sizeleft) / item.size) * 100 : 0,
          downloadSpeed: item.downloadId ? 'Downloading...' : undefined,
          eta: item.estimatedCompletionTime ? new Date(item.estimatedCompletionTime).toLocaleString() : undefined
        }));
        queueItems.push(...radarrItems);
      }

      setDownloadQueue(queueItems);
    } catch (error) {
      console.error('Error fetching download queue:', error);
      setDownloadQueue([]);
    } finally {
      setLoading(false);
    }
  }, [sonarrService, radarrService]);

  const getCurrentItems = useCallback(() => {
    return activeTab === 'plex' ? plexItems : downloadQueue;
  }, [activeTab, plexItems, downloadQueue]);

  const filteredItems = useMemo(() => {
    const items = getCurrentItems();
    if (!searchQuery) return items;
    
    return items.filter(item =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.year && item.year.toString().includes(searchQuery)) ||
      (item.genres && item.genres.some(genre => 
        genre.toLowerCase().includes(searchQuery.toLowerCase())
      ))
    );
  }, [getCurrentItems, searchQuery]);

    const sortedItems = useMemo(() => {
        const items = getCurrentItems();
        return [...items].sort((a, b) => {
            const titleA = a.title?.toLowerCase() || '';
            const titleB = b.title?.toLowerCase() || '';
            return titleA.localeCompare(titleB);
        });
    }, [getCurrentItems]);

  const getSourceIcon = useCallback((source: string) => {
    switch (source) {
      case 'plex':
        return <Play className="w-4 h-4 text-blue-500" />;
      case 'sonarr':
        return <Tv className="w-4 h-4 text-green-500" />;
      case 'radarr':
        return <Film className="w-4 h-4 text-purple-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  }, []);

  const getStatusIcon = useCallback((status: string | undefined) => {
    switch (status?.toLowerCase()) {
      case 'downloading':
        return <Download className="w-4 h-4 text-blue-500 animate-pulse" />;
      case 'paused':
        return <Pause className="w-4 h-4 text-yellow-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Download className="w-4 h-4 text-gray-500" />;
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchLibraryData(),
        fetchDownloadQueue()
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setLoading(false);
    }
  }, [fetchLibraryData, fetchDownloadQueue]);

  // Load data on mount
  useMemo(() => {
    if (plexService) {
      fetchLibraryData();
    }
    if (sonarrService || radarrService) {
      fetchDownloadQueue();
    }
  }, [plexService, sonarrService, radarrService, fetchLibraryData, fetchDownloadQueue]);

  return (
    <div className="library-page">
      <div className="library-header">
        <div className="header-content">
          <h1 className="page-title">Library</h1>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="refresh-button"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        <div className="tabs">
          <button
            onClick={() => setActiveTab('plex')}
            className={`tab ${activeTab === 'plex' ? 'active' : ''}`}
          >
            <Folder className="w-4 h-4" />
            <span>Plex Library</span>
            <span className="tab-count">{plexItems.length}</span>
          </button>
          <button
            onClick={() => setActiveTab('downloads')}
            className={`tab ${activeTab === 'downloads' ? 'active' : ''}`}
          >
            <QueueIcon className="w-4 h-4" />
            <span>Download Queue</span>
            <span className="tab-count">{downloadQueue.length}</span>
          </button>
        </div>
      </div>

      {/* Search and View Controls */}
      <div className="controls">
        <div className="search-container">
          <div className="search-icon">
            <Search className="h-5 w-5" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
            placeholder={`Search ${activeTab === 'plex' ? 'Plex Library' : 'Download Queue'}...`}
          />
        </div>

        <div className="view-controls">
          <button
            onClick={() => setViewMode('grid')}
            className={`view-button ${viewMode === 'grid' ? 'active' : ''}`}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`view-button ${viewMode === 'list' ? 'active' : ''}`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="content">
        {activeTab === 'plex' ? (
          // Plex Library View
          <div className={`plex-grid ${viewMode === 'list' ? 'list-view' : ''}`}>
            {sortedItems.map((item) => (
              <Link
                to={`/media/${item.type}/${item.id}`}
                key={item.id}
                className="media-card"
              >
                <div className="card-image">
                  {item.thumb ? (
                    <img src={item.thumb} alt={item.title} />
                  ) : (
                    <div className="placeholder-image">
                      {item.type === 'movie' ? <Film className="w-8 h-8" /> : <Tv className="w-8 h-8" />}
                    </div>
                  )}
                  <div className="card-overlay">
                    <Play className="w-6 h-6" />
                  </div>
                </div>
                <div className="card-content">
                  <h3 className="card-title">{item.title}</h3>
                  {item.year && <p className="card-year">{item.year}</p>}
                  {item.rating && (
                    <div className="card-rating">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span>{item.rating}</span>
                    </div>
                  )}
                  {item.genres && item.genres.length > 0 && (
                    <div className="card-genres">
                      {item.genres.slice(0, 2).map((genre, index) => (
                        <span key={`${genre}-${index}`} className="genre-tag">{genre}</span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          // Download Queue View
          <div className="download-queue">
            {filteredItems.map((item) => (
              <div key={item.id} className="queue-item">
                <div className="queue-item-left">
                  <div className="queue-icon">
                    {getSourceIcon(item.source)}
                  </div>
                  <div className="queue-info">
                    <h3 className="queue-title">{item.title}</h3>
                    <p className="queue-details">
                      {item.type === 'movie' ? 'Movie' : 'TV Show'}{item.year ? ` • ${item.year}` : ''}
                    </p>
                  </div>
                </div>
                
                <div className="queue-item-center">
                  <div className="queue-status">
                    {getStatusIcon(item.status)}
                    <span className="status-text">{item.status}</span>
                  </div>
                  {item.progress !== undefined && (
                    <div className="progress-container">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                      <span className="progress-text">{Math.round(item.progress)}%</span>
                    </div>
                  )}
                </div>

                <div className="queue-item-right">
                  {item.downloadSpeed && (
                    <div className="download-speed">
                      <span>{item.downloadSpeed}</span>
                    </div>
                  )}
                  {item.eta && (
                    <div className="eta">
                      <Clock className="w-4 h-4" />
                      <span>{item.eta}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Library;
