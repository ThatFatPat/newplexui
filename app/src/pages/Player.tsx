

import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';
import { ArrowLeft } from 'lucide-react';
import PlexService from '../services/plexService';
import { useConfig } from '../contexts/ConfigContext';


const Player = () => {
  const { type, id } = useParams<{ type: string; id: string }>();
  const { config } = useConfig();
  const [media, setMedia] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [parentId, setParentId] = useState<number | null>(null);
  const [partUrl, setPartUrl] = useState<string | null>(null);
  const navigate = useNavigate();

  const plexService = useMemo(() => {
    if (config.plex?.token && config.plex?.host && config.plex?.port && config.plex?.scheme) {
      return new PlexService({
        url: `${config.plex.scheme}://${config.plex.host}:${config.plex.port}`,
        token: config.plex.token
      });
    }
    return null;
  }, [config.plex]);

  // Fetch media details and part URL
  useEffect(() => {
    if (!plexService || !id || !config.plex?.token || !config.plex?.scheme || !config.plex?.host || !config.plex?.port) return;
    setLoading(true);
    plexService.getMediaDetails(Number(id))
      .then((data) => {
        setMedia(data);
        // If this is an episode, try to get parent show id from the raw API response
        if (data && data.type === 'episode' && data.raw && data.raw.parentRatingKey) {
          setParentId(Number(data.raw.parentRatingKey));
        }
        // Try to get the direct file part URL
        let partId = null;
        if (data && data.raw && data.raw.Media && data.raw.Media[0] && data.raw.Media[0].Part && data.raw.Media[0].Part[0]) {
          partId = data.raw.Media[0].Part[0].id;
        }
        if (partId) {
          const url = `${config.plex.scheme}://${config.plex.host}:${config.plex.port}/library/parts/${partId}/file?X-Plex-Token=${config.plex.token}`;
          setPartUrl(url);
        } else {
          setPartUrl(null);
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load media details.');
        setLoading(false);
      });
  }, [plexService, id, config.plex]);

  // Prefer direct file URL, fallback to transcoder
  let streamUrl = partUrl;
  if (!streamUrl && media && id && config.plex?.token && config.plex?.scheme && config.plex?.host && config.plex?.port) {
    streamUrl = `${config.plex.scheme}://${config.plex.host}:${config.plex.port}/video/:/transcode/universal/start?mediaIndex=0&partIndex=0&protocol=http&path=%2Flibrary%2Fmetadata%2F${id}&X-Plex-Token=${config.plex.token}`;
  }

  // Back button logic
  const handleBack = () => {
    if (type === 'movie') {
      navigate(`/media/movie/${id}`);
    } else if (type === 'episode' && parentId) {
      navigate(`/media/show/${parentId}`);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-0 m-0">
      <div className="w-full max-w-5xl flex flex-col items-center justify-center p-4">
        <button
          onClick={handleBack}
          className="mb-4 btn-secondary flex items-center space-x-2"
          style={{ alignSelf: 'flex-start' }}
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
        <div className="w-full flex flex-col items-center justify-center bg-black rounded-lg shadow-lg overflow-hidden" style={{ minHeight: '60vh' }}>
          {loading ? (
            <div className="text-white">Loading...</div>
          ) : error ? (
            <div className="text-red-400">{error}</div>
          ) : streamUrl ? (
            <video
              src={streamUrl}
              controls
              autoPlay
              style={{ width: '100%', height: 'auto', maxHeight: '70vh', background: 'black' }}
              poster={media?.thumb}
            >
              Sorry, your browser does not support embedded videos.
            </video>
          ) : (
            <div className="text-white">No stream available.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Player;
