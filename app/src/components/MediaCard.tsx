import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Plus, Eye, Star, Clock } from 'lucide-react';
import { PlexMedia } from '../types';
import { plexService } from '../services/plexService';

interface MediaCardProps {
  media: PlexMedia;
  showProgress?: boolean;
}

const MediaCard = ({ media, showProgress = false }: MediaCardProps) => {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const getImageUrl = () => {
    if (imageError) return '/placeholder-poster.jpg';
    if (media.thumb) {
      return plexService.getImageUrl(media.thumb, 300);
    }
    return '/placeholder-poster.jpg';
  };

  const getProgressPercentage = () => {
    if (!media.viewCount || !media.duration) return 0;
    return Math.min((media.viewCount / media.duration) * 100, 100);
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2 }}
      className="group relative"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Link to={`/media/${media.type}/${media.id}`}>
        <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-dark-800">
          {/* Poster Image */}
          <img
            src={getImageUrl()}
            alt={media.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            onError={() => setImageError(true)}
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {/* Play Button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: isHovered ? 1 : 0 }}
                transition={{ duration: 0.2 }}
                className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center shadow-lg"
              >
                <Play className="w-6 h-6 text-white ml-1" />
              </motion.div>
            </div>

            {/* Bottom Info */}
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <h3 className="text-white font-semibold text-sm line-clamp-2 mb-1">
                {media.title}
              </h3>
              
              <div className="flex items-center justify-between text-xs text-gray-300">
                <div className="flex items-center space-x-2">
                  {media.year && <span>{media.year}</span>}
                  {media.rating && (
                    <div className="flex items-center">
                      <Star className="w-3 h-3 text-yellow-500 mr-1" />
                      <span>{media.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
                
                {media.duration && (
                  <div className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    <span>{formatDuration(media.duration)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          {showProgress && media.viewCount && media.duration && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-dark-700">
              <div
                className="h-full bg-primary-500 transition-all duration-300"
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </div>
          )}

          {/* Watched Indicator */}
          {media.viewCount && media.viewCount > 0 && (
            <div className="absolute top-2 right-2">
              <Eye className="w-4 h-4 text-green-500" />
            </div>
          )}

          {/* Type Badge */}
          <div className="absolute top-2 left-2">
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-dark-800/80 text-white">
              {media.type}
            </span>
          </div>
        </div>
      </Link>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
        transition={{ duration: 0.2 }}
        className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2"
      >
        <button className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center hover:bg-primary-700 transition-colors">
          <Plus className="w-4 h-4 text-white" />
        </button>
      </motion.div>
    </motion.div>
  );
};

export default MediaCard;
