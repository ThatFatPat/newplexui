import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Play, Plus, Info, Star, Clock } from 'lucide-react';
import { PlexMedia } from '../types';
import { plexService } from '../services/plexService';

interface HeroSectionProps {
  media: PlexMedia;
}

const HeroSection = ({ media }: HeroSectionProps) => {
  const getBackdropUrl = () => {
    if (media.art) {
      return plexService.getImageUrl(media.art, 1920);
    }
    if (media.banner) {
      return plexService.getImageUrl(media.banner, 1920);
    }
    return '/placeholder-backdrop.jpg';
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  return (
    <div className="relative h-96 md:h-[500px] lg:h-[600px] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={getBackdropUrl()}
          alt={media.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative h-full flex items-end">
        <div className="container mx-auto px-4 pb-8 md:pb-12">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-2xl"
          >
            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
              {media.title}
            </h1>

            {/* Meta Info */}
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

            {/* Description */}
            {media.summary && (
              <p className="text-gray-300 text-sm md:text-base mb-6 line-clamp-3">
                {media.summary}
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to={`/player/${media.type}/${media.id}`}
                className="btn-primary flex items-center justify-center space-x-2"
              >
                <Play className="w-5 h-5" />
                <span>Play Now</span>
              </Link>
              
              <Link
                to={`/media/${media.type}/${media.id}`}
                className="btn-secondary flex items-center justify-center space-x-2"
              >
                <Info className="w-5 h-5" />
                <span>More Info</span>
              </Link>
              
              <button className="btn-secondary flex items-center justify-center space-x-2">
                <Plus className="w-5 h-5" />
                <span>Add to List</span>
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute bottom-4 left-1/2 transform -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1 h-3 bg-white/60 rounded-full mt-2"
          />
        </div>
      </motion.div>
    </div>
  );
};

export default HeroSection;
