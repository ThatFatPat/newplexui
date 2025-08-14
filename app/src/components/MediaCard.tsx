import { motion } from 'framer-motion';
import { Play, Eye, Star, Film } from 'lucide-react';
import type { PlexMedia } from '../types';

interface MediaCardProps {
  media: PlexMedia;
}

const MediaCard = ({ media }: MediaCardProps) => {
  const getPosterUrl = (media: PlexMedia) => {
    if (media.thumb) {
      return media.thumb;
    }
    return null;
  };

  const posterUrl = getPosterUrl(media);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className="group cursor-pointer"
    >
      <div className="relative bg-gray-800 rounded-lg overflow-hidden border-2 border-transparent hover:border-blue-500 transition-all duration-200">
        <div className="relative aspect-[2/3]">
          {posterUrl ? (
            <img
              src={posterUrl}
              alt={media.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <div className={`w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center ${posterUrl ? 'hidden' : ''}`}>
            <div className="text-center text-gray-400">
              <Film className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs font-medium">{media.title}</p>
            </div>
          </div>
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 flex space-x-2">
              <button className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full">
                <Play className="w-4 h-4" />
              </button>
              <button className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-full">
                <Eye className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        <div className="p-3">
          <h3 className="text-sm font-medium text-white truncate">{media.title}</h3>
          {media.year && (
            <p className="text-xs text-gray-400">{media.year}</p>
          )}
          {media.rating && (
            <div className="flex items-center mt-1">
              <Star className="w-3 h-3 text-yellow-500 fill-current" />
              <span className="text-xs text-gray-400 ml-1">{media.rating}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MediaCard;
