import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Play, Plus, Eye, Clock, Star, Search, Film, Tv, Settings } from 'lucide-react';
import { PlexMedia } from '../types';
import { plexService } from '../services/plexService';
import { useConfig } from '../contexts/ConfigContext';
import MediaCard from '../components/MediaCard';
import HeroSection from '../components/HeroSection';

const Home = () => {
  const { config } = useConfig();
  const [recentlyAdded, setRecentlyAdded] = useState<PlexMedia[]>([]);
  const [onDeck, setOnDeck] = useState<PlexMedia[]>([]);
  const [featured, setFeatured] = useState<PlexMedia[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!config.plex.token) return;
      
      try {
        setLoading(true);
        const [recent, deck, featuredData] = await Promise.all([
          plexService.getRecentlyAdded(20),
          plexService.getOnDeck(),
          plexService.getRecentlyAdded(5), // Use recent as featured for now
        ]);
        
        setRecentlyAdded(recent);
        setOnDeck(deck);
        setFeatured(featuredData);
      } catch (error) {
        console.error('Error fetching home data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [config.plex.token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-dark-900">
      {/* Hero Section */}
      {featured.length > 0 && (
        <HeroSection media={featured[0]} />
      )}

      {/* Content Sections */}
      <div className="px-4 py-6 space-y-8">
        {/* On Deck */}
        {onDeck.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <Clock className="w-5 h-5 mr-2 text-primary-500" />
                Continue Watching
              </h2>
              <Link 
                to="/library/show" 
                className="text-primary-500 hover:text-primary-400 text-sm font-medium"
              >
                View All
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
              {onDeck.slice(0, 8).map((media) => (
                <MediaCard key={media.id} media={media} />
              ))}
            </div>
          </section>
        )}

        {/* Recently Added */}
        {recentlyAdded.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <Plus className="w-5 h-5 mr-2 text-primary-500" />
                Recently Added
              </h2>
              <Link 
                to="/search" 
                className="text-primary-500 hover:text-primary-400 text-sm font-medium"
              >
                View All
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
              {recentlyAdded.slice(0, 8).map((media) => (
                <MediaCard key={media.id} media={media} />
              ))}
            </div>
          </section>
        )}

        {/* Quick Actions */}
        <section>
          <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/search"
              className="card p-6 hover:bg-dark-700 transition-colors group"
            >
              <Search className="w-8 h-8 text-primary-500 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-white mb-2">Search</h3>
              <p className="text-gray-400 text-sm">Find movies, shows, and more</p>
            </Link>
            
            <Link
              to="/library/movie"
              className="card p-6 hover:bg-dark-700 transition-colors group"
            >
              <Film className="w-8 h-8 text-primary-500 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-white mb-2">Movies</h3>
              <p className="text-gray-400 text-sm">Browse your movie collection</p>
            </Link>
            
            <Link
              to="/library/show"
              className="card p-6 hover:bg-dark-700 transition-colors group"
            >
              <Tv className="w-8 h-8 text-primary-500 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-white mb-2">TV Shows</h3>
              <p className="text-gray-400 text-sm">Explore your TV series</p>
            </Link>
            
            <Link
              to="/settings"
              className="card p-6 hover:bg-dark-700 transition-colors group"
            >
              <Settings className="w-8 h-8 text-primary-500 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-white mb-2">Settings</h3>
              <p className="text-gray-400 text-sm">Configure your services</p>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
