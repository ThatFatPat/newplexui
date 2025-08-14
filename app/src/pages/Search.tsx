import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search as SearchIcon, Filter, X } from 'lucide-react';
import { SearchResult } from '../types';
import { plexService } from '../services/plexService';
import { sonarrService } from '../services/sonarrService';
import { radarrService } from '../services/radarrService';
import { useConfig } from '../contexts/ConfigContext';
import MediaCard from '../components/MediaCard';

const Search = () => {
  const { config } = useConfig();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all',
    source: 'all',
  });

  const searchAll = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    const allResults: SearchResult[] = [];

    try {
      // Search Plex
      if (config.plex.token) {
        try {
          const plexResults = await plexService.searchLibrary(1, searchQuery);
          allResults.push(...plexResults.map(item => ({
            id: `plex-${item.id}`,
            title: item.title,
            year: item.year,
            type: item.type as 'movie' | 'show',
            overview: item.summary,
            poster: item.thumb,
            backdrop: item.art,
            rating: item.rating,
            genres: item.genres,
            source: 'plex' as const,
          })));
        } catch (error) {
          console.error('Plex search error:', error);
        }
      }

      // Search Sonarr
      if (config.sonarr.apiKey) {
        try {
          const sonarrResults = await sonarrService.searchSeries(searchQuery);
          allResults.push(...sonarrResults.map(item => ({
            id: `sonarr-${item.id}`,
            title: item.title,
            year: item.year,
            type: 'show' as const,
            overview: item.overview,
            poster: item.images?.find(img => img.coverType === 'poster')?.remoteUrl,
            backdrop: item.images?.find(img => img.coverType === 'fanart')?.remoteUrl,
            rating: item.ratings?.value,
            genres: item.genres,
            source: 'sonarr' as const,
          })));
        } catch (error) {
          console.error('Sonarr search error:', error);
        }
      }

      // Search Radarr
      if (config.radarr.apiKey) {
        try {
          const radarrResults = await radarrService.searchMovies(searchQuery);
          allResults.push(...radarrResults.map(item => ({
            id: `radarr-${item.id}`,
            title: item.title,
            year: item.year,
            type: 'movie' as const,
            overview: item.overview,
            poster: item.images?.find(img => img.coverType === 'poster')?.remoteUrl,
            backdrop: item.images?.find(img => img.coverType === 'fanart')?.remoteUrl,
            rating: item.ratings?.value,
            genres: item.genres,
            source: 'radarr' as const,
          })));
        } catch (error) {
          console.error('Radarr search error:', error);
        }
      }

      // Apply filters
      let filteredResults = allResults;
      if (filters.type !== 'all') {
        filteredResults = filteredResults.filter(result => result.type === filters.type);
      }
      if (filters.source !== 'all') {
        filteredResults = filteredResults.filter(result => result.source === filters.source);
      }

      setResults(filteredResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchAll(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, filters]);

  const clearSearch = () => {
    setQuery('');
    setResults([]);
  };

  return (
    <div className="min-h-full bg-dark-900 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-6">Search</h1>
          
          {/* Search Bar */}
          <div className="relative max-w-2xl">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for movies, TV shows, and more..."
              className="input-field w-full pl-10 pr-12 py-4 text-lg"
            />
            {query && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-dark-700 rounded"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mt-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <span className="text-gray-400 text-sm">Filters:</span>
            </div>
            
            <select
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
              className="input-field text-sm"
            >
              <option value="all">All Types</option>
              <option value="movie">Movies</option>
              <option value="show">TV Shows</option>
            </select>

            <select
              value={filters.source}
              onChange={(e) => setFilters(prev => ({ ...prev, source: e.target.value }))}
              className="input-field text-sm"
            >
              <option value="all">All Sources</option>
              <option value="plex">Plex</option>
              <option value="sonarr">Sonarr</option>
              <option value="radarr">Radarr</option>
            </select>
          </div>
        </div>

        {/* Search Results */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          </div>
        ) : query ? (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">
                Search Results ({results.length})
              </h2>
            </div>

            {results.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                {results.map((result) => (
                  <div key={result.id} className="relative">
                    <div className="aspect-[2/3] rounded-lg overflow-hidden bg-dark-800">
                      <img
                        src={result.poster || '/placeholder-poster.jpg'}
                        alt={result.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-dark-800/80 text-white">
                          {result.source}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2">
                      <h3 className="text-white font-medium text-sm line-clamp-2">
                        {result.title}
                      </h3>
                      {result.year && (
                        <p className="text-gray-400 text-xs">{result.year}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <SearchIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">No results found</h3>
                <p className="text-gray-500">
                  Try adjusting your search terms or filters
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <SearchIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">Start searching</h3>
            <p className="text-gray-500">
              Search for movies, TV shows, and more across your media libraries
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Search;
