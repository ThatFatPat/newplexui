import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Plus, Star, Clock, Calendar, User } from 'lucide-react';
import { PlexMedia } from '../types';
import { plexService } from '../services/plexService';
import { useConfig } from '../contexts/ConfigContext';

const MediaDetails = () => {
  const { type, id } = useParams<{ type: string; id: string }>();
  const { config } = useConfig();
  const [media, setMedia] = useState<PlexMedia | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMediaDetails = async () => {
      if (!config.plex.token || !type || !id) return;
      
      try {
        setLoading(true);
        const details = await plexService.getMediaDetails(parseInt(id));
        setMedia(details);
      } catch (error) {
        console.error('Error fetching media details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMediaDetails();
  }, [config.plex.token, type, id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!media) {
    return (
      <div className="min-h-full bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Media Not Found</h2>
          <p className="text-gray-400">The requested media could not be found.</p>
        </div>
      </div>
    );
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="min-h-full bg-dark-900">
      {/* Hero Section */}
      <div className="relative h-96 md:h-[500px] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={media.art ? plexService.getImageUrl(media.art, 1920) : '/placeholder-backdrop.jpg'}
            alt={media.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-black/50 to-transparent" />
        </div>

        <div className="relative h-full flex items-end">
          <div className="container mx-auto px-4 pb-8">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl"
            >
              <div className="flex flex-col md:flex-row gap-6">
                {/* Poster */}
                <div className="flex-shrink-0">
                  <img
                    src={media.thumb ? plexService.getImageUrl(media.thumb, 300) : '/placeholder-poster.jpg'}
                    alt={media.title}
                    className="w-48 h-72 object-cover rounded-lg shadow-lg"
                  />
                </div>

                {/* Info */}
                <div className="flex-1">
                  <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                    {media.title}
                  </h1>

                  <div className="flex items-center space-x-4 text-sm text-gray-300 mb-4">
                    {media.year && <span>{media.year}</span>}
                    {media.rating && (
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-500 mr-1" />
                        <span>{media.rating.toFixed(1)}</span>
                      </div>
                    )}
                    {media.duration && (
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{formatDuration(media.duration)}</span>
                      </div>
                    )}
                    <span className="capitalize">{media.type}</span>
                  </div>

                  {media.summary && (
                    <p className="text-gray-300 text-lg mb-6 leading-relaxed">
                      {media.summary}
                    </p>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link
                      to={`/player/${media.type}/${media.id}`}
                      className="btn-primary flex items-center justify-center space-x-2"
                    >
                      <Play className="w-5 h-5" />
                      <span>Play Now</span>
                    </Link>
                    
                    <button className="btn-secondary flex items-center justify-center space-x-2">
                      <Plus className="w-5 h-5" />
                      <span>Add to List</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Details Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-2xl font-bold text-white mb-6">Details</h2>
              
              <div className="card p-6 space-y-4">
                {media.director && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Director</h3>
                    <p className="text-gray-300">{media.director}</p>
                  </div>
                )}

                {media.studio && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Studio</h3>
                    <p className="text-gray-300">{media.studio}</p>
                  </div>
                )}

                {media.genres && media.genres.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Genres</h3>
                    <div className="flex flex-wrap gap-2">
                      {media.genres.map((genre, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-primary-600 text-white text-sm rounded-full"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {media.actors && media.actors.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Cast</h3>
                    <div className="flex flex-wrap gap-2">
                      {media.actors.slice(0, 10).map((actor, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-dark-700 text-white text-sm rounded-full"
                        >
                          {actor}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-2xl font-bold text-white mb-6">Information</h2>
              
              <div className="card p-6 space-y-4">
                {media.addedAt && (
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-primary-500" />
                    <div>
                      <p className="text-sm text-gray-400">Added</p>
                      <p className="text-white">{formatDate(media.addedAt)}</p>
                    </div>
                  </div>
                )}

                {media.lastViewedAt && (
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-primary-500" />
                    <div>
                      <p className="text-sm text-gray-400">Last Watched</p>
                      <p className="text-white">{formatDate(media.lastViewedAt)}</p>
                    </div>
                  </div>
                )}

                {media.contentRating && (
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Content Rating</p>
                    <span className="px-2 py-1 bg-yellow-600 text-white text-sm rounded">
                      {media.contentRating}
                    </span>
                  </div>
                )}

                {media.viewCount && media.viewCount > 0 && (
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Times Watched</p>
                    <p className="text-white">{media.viewCount}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaDetails;
