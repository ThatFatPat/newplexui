import { useState } from 'react';
import { Search as SearchIcon } from 'lucide-react';

interface SearchResult {
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
}

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    
    // For now, return placeholder results
    const placeholderResults: SearchResult[] = [
      {
        id: '1',
        title: 'Sample Movie',
        year: 2024,
        type: 'movie',
        overview: 'This is a sample movie for demonstration purposes.',
        poster: '/placeholder-poster.jpg',
        backdrop: '/placeholder-backdrop.jpg',
        rating: 8.5,
        genres: ['Action', 'Adventure'],
        source: 'plex'
      },
      {
        id: '2',
        title: 'Sample TV Show',
        year: 2023,
        type: 'show',
        overview: 'This is a sample TV show for demonstration purposes.',
        poster: '/placeholder-poster.jpg',
        backdrop: '/placeholder-backdrop.jpg',
        rating: 7.8,
        genres: ['Drama', 'Thriller'],
        source: 'sonarr'
      }
    ];

    // Simulate API delay
    setTimeout(() => {
      setResults(placeholderResults);
      setLoading(false);
    }, 500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-full bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Search</h1>
          <p className="text-gray-400">Find movies, TV shows, and more across your services</p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for movies, TV shows, actors, directors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        {/* Results */}
        {loading && (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Searching...</p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">
              Found {results.length} result{results.length !== 1 ? 's' : ''}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {results.map((result) => (
                <div
                  key={result.id}
                  className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-700 transition-colors cursor-pointer"
                >
                  <div className="aspect-[2/3] bg-gray-700">
                    <img
                      src={result.poster || '/placeholder-poster.jpg'}
                      alt={result.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-white text-sm truncate mb-1">
                      {result.title}
                    </h3>
                    {result.year && (
                      <p className="text-xs text-gray-400">{result.year}</p>
                    )}
                    {result.rating && (
                      <div className="flex items-center mt-1">
                        <span className="text-xs text-yellow-500">★</span>
                        <span className="text-xs text-gray-400 ml-1">{result.rating}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && searchQuery && results.length === 0 && (
          <div className="text-center py-16">
            <SearchIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-medium text-white mb-2">No results found</h3>
            <p className="text-gray-400">
              Try adjusting your search terms or check your service connections.
            </p>
          </div>
        )}

        {!loading && !searchQuery && (
          <div className="text-center py-16">
            <SearchIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-medium text-white mb-2">Start searching</h3>
            <p className="text-gray-400">
              Enter a search term above to find movies, TV shows, and more.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
