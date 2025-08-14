import { useParams } from 'react-router-dom';

import { Play, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const Player = () => {
  const { type, id } = useParams<{ type: string; id: string }>();

  return (
    <div className="min-h-full bg-dark-900">
      <div className="relative h-screen">
        {/* Video Player Placeholder */}
        <div className="absolute inset-0 bg-black flex items-center justify-center">
          <div className="text-center">
            <Play className="w-16 h-16 text-white mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Video Player</h2>
            <p className="text-gray-400">
              Playing {type} with ID: {id}
            </p>
            <p className="text-gray-500 text-sm mt-2">
              This is a placeholder for the video player component
            </p>
          </div>
        </div>

        {/* Back Button */}
        <Link
          to={`/media/${type}/${id}`}
          className="absolute top-4 left-4 z-10 btn-secondary flex items-center space-x-2"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </Link>
      </div>
    </div>
  );
};

export default Player;
