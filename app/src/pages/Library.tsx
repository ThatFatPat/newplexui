import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PlexMedia } from '../types';
import { plexService } from '../services/plexService';
import { useConfig } from '../contexts/ConfigContext';
import MediaCard from '../components/MediaCard';

const Library = () => {
  const { type } = useParams<{ type: string }>();
  const { config } = useConfig();
  const [media, setMedia] = useState<PlexMedia[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMedia = async () => {
      if (!config.plex.token || !type) return;
      
      try {
        setLoading(true);
        // For now, we'll fetch from the first library of the specified type
        // In a real app, you'd want to get the specific library ID
        const libraries = await plexService.getLibraries();
        const targetLibrary = libraries.find(lib => lib.type === type);
        
        if (targetLibrary) {
          const items = await plexService.getLibraryItems(targetLibrary.id, 100);
          setMedia(items);
        }
      } catch (error) {
        console.error('Error fetching library:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMedia();
  }, [config.plex.token, type]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-dark-900 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        <h1 className="text-3xl font-bold text-white mb-6 capitalize">
          {type} Library
        </h1>
        
        {media.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {media.map((item) => (
              <MediaCard key={item.id} media={item} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400">No {type} found in your library.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Library;
