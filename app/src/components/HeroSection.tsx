import { motion } from 'framer-motion';
import { Play, Star, Clock } from 'lucide-react';
import type { PlexMedia } from '../types';

interface HeroSectionProps {
  media: PlexMedia;
}

const HeroSection = ({ media }: HeroSectionProps) => {
  const getBackdropUrl = (media: PlexMedia) => {
    if (media.art) {
      return media.art;
    }
    if (media.banner) {
      return media.banner;
    }
    return null;
  };

  const backdropUrl = getBackdropUrl(media);

  return (
    <div className="relative h-96 md:h-[500px] overflow-hidden">
      <div className="absolute inset-0">
        {backdropUrl ? (
          <img
            src={backdropUrl}
            alt={media.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">{media.title}</p>
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent" />
      </div>
      
      <div className="relative h-full flex items-end">
        <div className="container mx-auto px-4 pb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {media.title}
            </h1>
            
            <div className="flex items-center space-x-4 mb-4 text-gray-300">
              {media.year && (
                <span>{media.year}</span>
              )}
              {media.rating && (
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-500 fill-current mr-1" />
                  <span>{media.rating}</span>
                </div>
              )}
              {media.duration && (
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>{Math.floor(media.duration / 60000)}m</span>
                </div>
              )}
            </div>
            
            {media.summary && (
              <p className="text-gray-300 text-lg mb-6 line-clamp-2">
                {media.summary}
              </p>
            )}
            
            <div className="flex space-x-4">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center">
                <Play className="w-5 h-5 mr-2" />
                Play
              </button>
              <button className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium">
                More Info
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
