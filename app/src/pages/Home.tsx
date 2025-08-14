import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Film, Tv, Settings } from 'lucide-react';
import { useConfig } from '../contexts/ConfigContext';

const Home = () => {
  const { config } = useConfig();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Simple loading state for now
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-900 p-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Welcome to NewPlexUI</h1>
        <p className="text-gray-400">Your unified media management dashboard</p>
      </div>

      {/* Connection Status */}
      <div className="mb-8 p-6 bg-gray-800 rounded-lg border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4">Service Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
            <div className={`w-3 h-3 rounded-full ${config.plex.token ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-white">Plex</span>
            <span className="text-sm text-gray-400 ml-auto">
              {config.plex.token ? 'Connected' : 'Not configured'}
            </span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
            <div className={`w-3 h-3 rounded-full ${config.sonarr.apiKey ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-white">Sonarr</span>
            <span className="text-sm text-gray-400 ml-auto">
              {config.sonarr.apiKey ? 'Connected' : 'Not configured'}
            </span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
            <div className={`w-3 h-3 rounded-full ${config.radarr.apiKey ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-white">Radarr</span>
            <span className="text-sm text-gray-400 ml-auto">
              {config.radarr.apiKey ? 'Connected' : 'Not configured'}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/search"
            className="p-6 bg-gray-800 rounded-lg border border-gray-700 hover:bg-gray-700 transition-colors group"
          >
            <Search className="w-8 h-8 text-blue-500 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-white mb-2">Search</h3>
            <p className="text-gray-400 text-sm">Find movies, shows, and more</p>
          </Link>

          <Link
            to="/library"
            className="p-6 bg-gray-800 rounded-lg border border-gray-700 hover:bg-gray-700 transition-colors group"
          >
            <Film className="w-8 h-8 text-green-500 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-white mb-2">Library</h3>
            <p className="text-gray-400 text-sm">Browse your media collection</p>
          </Link>

          <Link
            to="/library"
            className="p-6 bg-gray-800 rounded-lg border border-gray-700 hover:bg-gray-700 transition-colors group"
          >
            <Tv className="w-8 h-8 text-purple-500 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-white mb-2">TV Shows</h3>
            <p className="text-gray-400 text-sm">Explore your TV series</p>
          </Link>

          <Link
            to="/settings"
            className="p-6 bg-gray-800 rounded-lg border border-gray-700 hover:bg-gray-700 transition-colors group"
          >
            <Settings className="w-8 h-8 text-yellow-500 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-white mb-2">Settings</h3>
            <p className="text-gray-400 text-sm">Configure your services</p>
          </Link>
        </div>
      </div>

      {/* Setup Guide */}
      {(!config.plex.token || !config.sonarr.apiKey || !config.radarr.apiKey) && (
        <div className="p-6 bg-blue-900 border border-blue-700 rounded-lg">
          <h2 className="text-xl font-semibold text-white mb-4">Get Started</h2>
          <p className="text-blue-200 mb-4">
            Configure your Plex, Sonarr, and Radarr services to start using NewPlexUI.
          </p>
          <Link
            to="/settings"
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Settings className="w-4 h-4 mr-2" />
            Configure Services
          </Link>
        </div>
      )}
    </div>
  );
};

export default Home;
