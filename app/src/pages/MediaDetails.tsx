import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, Star, Clock, ArrowLeft, Plus, Eye } from 'lucide-react';
import type { PlexMedia } from '../types';

const MediaDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [media, setMedia] = useState<PlexMedia | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMediaDetails = async () => {
      if (!id) return;

      try {
        setLoading(true);
        // For now, create a placeholder media object
        const details: PlexMedia = {
          id: parseInt(id),
          title: 'Sample Media',
          type: 'movie',
          year: 2024,
          summary: 'This is a sample media item for demonstration purposes.',
          rating: 8.5,
          duration: 7200000, // 2 hours in milliseconds
          thumb: undefined,
          art: undefined,
          banner: undefined,
          genres: ['Action', 'Adventure'],
          addedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          viewCount: 0,
          lastViewedAt: undefined,
        };

        setMedia(details);
      } catch (error) {
        console.error('Error fetching media details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMediaDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-full bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!media) {
    return (
      <div className="min-h-full bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Media not found</h1>
            <Link to="/" className="text-blue-500 hover:text-blue-400">
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-900">
      {/* Backdrop */}
      <div className="relative h-96 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={media.art ? '/placeholder-backdrop.jpg' : '/placeholder-backdrop.jpg'}
            alt={media.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent" />
        </div>

        {/* Back Button */}
        <div className="absolute top-4 left-4">
          <Link
            to="/"
            className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Poster */}
          <div className="flex-shrink-0">
            <div className="w-64 h-96 bg-gray-800 rounded-lg overflow-hidden">
              <img
                src={media.thumb ? '/placeholder-poster.jpg' : '/placeholder-poster.jpg'}
                alt={media.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Details */}
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-white mb-4">{media.title}</h1>

            <div className="flex items-center space-x-4 mb-4 text-gray-300">
              {media.year && <span>{media.year}</span>}
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
              <span className="capitalize">{media.type}</span>
            </div>

            {media.genres && media.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {media.genres.map((genre, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}

            {media.summary && (
              <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                {media.summary}
              </p>
            )}

            <div className="flex space-x-4">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium flex items-center">
                <Play className="w-5 h-5 mr-2" />
                Play
              </button>
              <button className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium flex items-center">
                <Plus className="w-5 h-5 mr-2" />
                Add to List
              </button>
              <button className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium flex items-center">
                <Eye className="w-5 h-5 mr-2" />
                Mark as Watched
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaDetails;
