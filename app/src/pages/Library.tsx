import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Grid, List, Play, Eye, Star, Clock, Film, Tv, Download, AlertCircle } from 'lucide-react';
import { useConfig } from '../contexts/ConfigContext';

interface LibraryItem {
  id: string;
  title: string;
  year?: number;
  type: 'movie' | 'show';
  overview?: string;
  poster?: string;
  backdrop?: string;
  rating?: number;
  genres?: string[];
  source: 'plex' | 'sonarr' | 'radarr';
  addedAt?: string;
  size?: number;
  quality?: string;
  status?: string;
}

const Library = () => {
  const { type = 'all' } = useParams<{ type: string }>();
  const { config } = useConfig();
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [errors, setErrors] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    source: 'all',
    quality: 'all',
    status: 'all',
  });

  useEffect(() => {
    fetchLibraryItems();
  }, [config, type]);

  const fetchLibraryItems = async () => {
    setLoading(true);
    setErrors([]);
    const allItems: LibraryItem[] = [];

    try {
      // Fetch from Plex
      if (config.plex.token) {
        try {
          console.log('🔍 Fetching Plex items...');
          const plexItems = await fetchPlexItems();
          console.log(`✅ Found ${plexItems.length} Plex items`);
          allItems.push(...plexItems);
        } catch (error) {
          console.error('❌ Error fetching Plex items:', error);
          setErrors(prev => [...prev, `Plex: ${error instanceof Error ? error.message : 'Unknown error'}`]);
        }
      } else {
        console.log('⚠️ No Plex token configured');
      }

      // Fetch from Sonarr
      if (config.sonarr.apiKey) {
        try {
          console.log('🔍 Fetching Sonarr items...');
          const sonarrItems = await fetchSonarrItems();
          console.log(`✅ Found ${sonarrItems.length} Sonarr items`);
          allItems.push(...sonarrItems);
        } catch (error) {
          console.error('❌ Error fetching Sonarr items:', error);
          setErrors(prev => [...prev, `Sonarr: ${error instanceof Error ? error.message : 'Unknown error'}`]);
        }
      } else {
        console.log('⚠️ No Sonarr API key configured');
      }

      // Fetch from Radarr
      if (config.radarr.apiKey) {
        try {
          console.log('🔍 Fetching Radarr items...');
          const radarrItems = await fetchRadarrItems();
          console.log(`✅ Found ${radarrItems.length} Radarr items`);
          allItems.push(...radarrItems);
        } catch (error) {
          console.error('❌ Error fetching Radarr items:', error);
          setErrors(prev => [...prev, `Radarr: ${error instanceof Error ? error.message : 'Unknown error'}`]);
        }
      } else {
        console.log('⚠️ No Radarr API key configured');
      }

      console.log(`🎬 Total items found: ${allItems.length}`);
      setItems(allItems);
    } catch (error) {
      console.error('❌ Error fetching library items:', error);
      setErrors(prev => [...prev, `General: ${error instanceof Error ? error.message : 'Unknown error'}`]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlexItems = async (): Promise<LibraryItem[]> => {
    const baseUrl = `${config.plex.scheme}://${config.plex.host}:${config.plex.port}`;

    console.log(`🌐 Plex URL: ${baseUrl}`);

    // Get libraries
    const librariesResponse = await fetch(`${baseUrl}/library/sections?X-Plex-Token=${config.plex.token}`);

    if (!librariesResponse.ok) {
      throw new Error(`Plex libraries request failed: ${librariesResponse.status} ${librariesResponse.statusText}`);
    }

    const librariesData = await librariesResponse.json();
    console.log('📚 Plex libraries:', librariesData.MediaContainer?.Directory?.length || 0);

    const plexItems: LibraryItem[] = [];

    for (const library of librariesData.MediaContainer.Directory || []) {
      console.log(`📖 Processing library: ${library.title} (${library.type})`);

      if (type === 'all' || library.type === type) {
        const itemsResponse = await fetch(`${baseUrl}/library/sections/${library.key}/all?X-Plex-Token=${config.plex.token}`);

        if (!itemsResponse.ok) {
          console.warn(`⚠️ Failed to fetch items from library ${library.title}: ${itemsResponse.status}`);
          continue;
        }

        const itemsData = await itemsResponse.json();
        const metadata = itemsData.MediaContainer.Metadata || [];
        console.log(`📺 Found ${metadata.length} items in ${library.title}`);

        for (const item of metadata) {
          plexItems.push({
            id: `plex-${item.ratingKey}`,
            title: item.title,
            year: item.year,
            type: item.type === 'movie' ? 'movie' : 'show',
            overview: item.summary,
            poster: item.thumb ? `${baseUrl}${item.thumb}?X-Plex-Token=${config.plex.token}` : undefined,
            backdrop: item.art ? `${baseUrl}${item.art}?X-Plex-Token=${config.plex.token}` : undefined,
            rating: item.rating,
            genres: item.genre ? item.genre.map((g: any) => g.tag) : [],
            source: 'plex',
            addedAt: item.addedAt,
            size: item.Media?.[0]?.size,
            quality: item.Media?.[0]?.videoResolution,
          });
        }
      }
    }

    return plexItems;
  };

  const fetchSonarrItems = async (): Promise<LibraryItem[]> => {
    const baseUrl = `${config.sonarr.scheme}://${config.sonarr.host}:${config.sonarr.port}`;

    console.log(`🌐 Sonarr URL: ${baseUrl}`);

    const response = await fetch(`${baseUrl}/api/v3/series?apikey=${config.sonarr.apiKey}`);

    if (!response.ok) {
      throw new Error(`Sonarr request failed: ${response.status} ${response.statusText}`);
    }

    const series = await response.json();
    console.log(`📺 Found ${series.length} series in Sonarr`);

    return series.map((show: any) => ({
      id: `sonarr-${show.id}`,
      title: show.title,
      year: show.year,
      type: 'show',
      overview: show.overview,
      poster: show.images?.find((img: any) => img.coverType === 'poster')?.remoteUrl,
      backdrop: show.images?.find((img: any) => img.coverType === 'fanart')?.remoteUrl,
      rating: show.ratings?.value,
      genres: show.genres,
      source: 'sonarr',
      addedAt: show.added,
      status: show.status,
      quality: show.qualityProfileId,
    }));
  };

  const fetchRadarrItems = async (): Promise<LibraryItem[]> => {
    const baseUrl = `${config.radarr.scheme}://${config.radarr.host}:${config.radarr.port}`;

    console.log(`🌐 Radarr URL: ${baseUrl}`);

    const response = await fetch(`${baseUrl}/api/v3/movie?apikey=${config.radarr.apiKey}`);

    if (!response.ok) {
      throw new Error(`Radarr request failed: ${response.status} ${response.statusText}`);
    }

    const movies = await response.json();
    console.log(`🎬 Found ${movies.length} movies in Radarr`);

    return movies.map((movie: any) => ({
      id: `radarr-${movie.id}`,
      title: movie.title,
      year: movie.year,
      type: 'movie',
      overview: movie.overview,
      poster: movie.images?.find((img: any) => img.coverType === 'poster')?.remoteUrl,
      backdrop: movie.images?.find((img: any) => img.coverType === 'fanart')?.remoteUrl,
      rating: movie.ratings?.value,
      genres: movie.genres,
      source: 'radarr',
      addedAt: movie.added,
      status: movie.status,
      quality: movie.qualityProfileId,
    }));
  };

  const filteredItems = items.filter(item => {
    // Type filter
    if (type !== 'all' && item.type !== type) return false;

    // Search filter
    if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;

    // Source filter
    if (filters.source !== 'all' && item.source !== filters.source) return false;

    // Quality filter
    if (filters.quality !== 'all' && item.quality !== filters.quality) return false;

    // Status filter
    if (filters.status !== 'all' && item.status !== filters.status) return false;

    return true;
  });

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'plex': return <Play className="w-4 h-4 text-blue-500" />;
      case 'sonarr': return <Tv className="w-4 h-4 text-green-500" />;
      case 'radarr': return <Film className="w-4 h-4 text-purple-500" />;
      default: return <Download className="w-4 h-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-full bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading your library...</p>
              {errors.length > 0 && (
                <div className="mt-4">
                  <p className="text-red-400 text-sm">Some services failed to load:</p>
                  {errors.map((error, index) => (
                    <p key={index} className="text-red-300 text-xs">{error}</p>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {type === 'all' ? 'Library' : `${type.charAt(0).toUpperCase() + type.slice(1)} Library`}
              </h1>
              <p className="text-gray-400">
                {filteredItems.length} items found
              </p>
              {errors.length > 0 && (
                <div className="mt-2 flex items-center space-x-2 text-yellow-400 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.length} service(s) had connection issues</span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search your library..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={filters.source}
                onChange={(e) => setFilters(prev => ({ ...prev, source: e.target.value }))}
                className="bg-gray-800 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Sources</option>
                <option value="plex">Plex</option>
                <option value="sonarr">Sonarr</option>
                <option value="radarr">Radarr</option>
              </select>
              <select
                value={filters.quality}
                onChange={(e) => setFilters(prev => ({ ...prev, quality: e.target.value }))}
                className="bg-gray-800 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Qualities</option>
                <option value="4K">4K</option>
                <option value="1080p">1080p</option>
                <option value="720p">720p</option>
              </select>
            </div>
          </div>
        </div>

        {/* Library Items */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {filteredItems.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-700 transition-colors duration-200 cursor-pointer group"
              >
                <div className="relative aspect-[2/3] bg-gray-700">
                  {item.poster ? (
                    <img
                      src={item.poster}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-gray-400 text-xs">No Image</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Play className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="absolute top-2 right-2">
                    {getSourceIcon(item.source)}
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-white text-sm truncate mb-1">{item.title}</h3>
                  {item.year && (
                    <p className="text-xs text-gray-400">{item.year}</p>
                  )}
                  {item.rating && (
                    <div className="flex items-center mt-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-current mr-1" />
                      <span className="text-xs text-gray-400">{item.rating}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredItems.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors duration-200 cursor-pointer"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-24 bg-gray-700 rounded overflow-hidden flex-shrink-0">
                    {item.poster ? (
                      <img
                        src={item.poster}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-gray-400 text-xs">No Image</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-lg font-medium text-white truncate">{item.title}</h3>
                      {getSourceIcon(item.source)}
                    </div>
                    {item.year && (
                      <p className="text-sm text-gray-400">{item.year}</p>
                    )}
                    {item.overview && (
                      <p className="text-sm text-gray-300 mt-2 line-clamp-2">{item.overview}</p>
                    )}
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-400">
                      {item.rating && (
                        <div className="flex items-center">
                          <Star className="w-3 h-3 text-yellow-500 fill-current mr-1" />
                          <span>{item.rating}</span>
                        </div>
                      )}
                      {item.genres && item.genres.length > 0 && (
                        <span>{item.genres.slice(0, 2).join(', ')}</span>
                      )}
                      {item.addedAt && (
                        <div className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          <span>{new Date(item.addedAt).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg">
                      <Play className="w-4 h-4" />
                    </button>
                    <button className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg">
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {filteredItems.length === 0 && !loading && (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-white mb-2">No items found</h3>
              <p className="text-gray-400">
                {searchQuery ? 'Try adjusting your search terms or filters.' : 'Your library appears to be empty.'}
              </p>
              {errors.length > 0 && (
                <div className="mt-4 p-4 bg-red-900 rounded-lg">
                  <p className="text-red-300 text-sm font-medium mb-2">Connection Issues:</p>
                  {errors.map((error, index) => (
                    <p key={index} className="text-red-200 text-xs">{error}</p>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Library;
