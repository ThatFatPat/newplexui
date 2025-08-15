
import { useState, useMemo, useCallback, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, Star, Clock, ArrowLeft, Plus, Eye, Film, Tv, Calendar, Download } from 'lucide-react';
import type { PlexMedia, PlexSeason } from '../types';
import { useConfig } from '../contexts/ConfigContext';
import PlexService from '../services/plexService';
import './MediaDetails.css';

interface MediaDetailsParams {
  id?: string;
  [key: string]: string | undefined;
}

const MediaDetails = () => {
  const { id } = useParams<MediaDetailsParams>();
  const [loading, setLoading] = useState(false);
  const [media, setMedia] = useState<PlexMedia | null>(null);
  const { config } = useConfig();

  const plexService = useMemo(() => {
    if (config.plex?.token && config.plex?.host && config.plex?.port && config.plex?.scheme) {
      return new PlexService({
        url: `${config.plex.scheme}://${config.plex.host}:${config.plex.port}`,
        token: config.plex.token
      });
    }
    return null;
  }, [config.plex]);

  const [seasons, setSeasons] = useState<PlexSeason[]>([]);

  useEffect(() => {
    if (!id || !plexService) return;

    const fetchMediaDetails = async () => {
      setLoading(true);
      try {
        const mediaData = await plexService.getMediaDetails(parseInt(id));
        setMedia(mediaData);

        // Fetch seasons and episodes if it's a show
        if (mediaData?.type === 'show') {
          console.log("Fetching Seasons and Episodes for ", mediaData.title);
          const libraryData: any = await plexService.getLibrary();
        }
      } catch (error: any) {
        console.error('Error fetching media details:', error);
      } finally {
        setLoading(false);
      };
    };

    const fetchSeasons = async () => {
      if (!id || !plexService) return;
      setLoading(true);
      try {
        const showChildren: any = await plexService.getShowChildren(parseInt(id));
        console.log("Show Children", showChildren);
      } catch (error: any) {
        console.error('Error fetching show children:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchMediaDetails();
  }, [id, plexService]);

  useEffect(() => {
    fetchSeasons();
  }, [id, plexService]);

  const fetchSeasons = async () => {
    if (!id || !plexService) return;
    setLoading(true);
    try {
      const showChildren: any = await plexService.getShowChildren(parseInt(id));
      console.log("Show Children", showChildren);
    } catch (error: any) {
      console.error('Error fetching show children:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSeasons();
  }, [id, plexService]);

  const handleRefresh = useCallback(async () => {

  }, []);

  const formatDuration = (ms: number) => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  };

  if (!media) {
    return (
      <div className="media-details-page">
        <div className="error-state">
          <h2>Media not found</h2>
          <p>The requested media item could not be found.</p>
          <Link to="/library" className="back-link">
            <ArrowLeft className="w-4 h-4" />
            Back to Library
          </Link>
        </div>
      </div>
    );
  };

  return (
    <div className="media-details-page">
      {/* Header */}
      <div className="details-header">
        <div className="header-content">
          <Link to="/library" className="back-button">
            <ArrowLeft className="w-5 h-5" />
            Back to Library
          </Link>
          <div className="header-actions">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="refresh-button"
            >
              <Download className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-background">
          {media?.banner ? (
            <img src={media.banner} alt={media.title} className="full-banner" />
          ) : (
            <div className="placeholder-banner">
              {media.type === 'movie' ? <Film className="w-24 h-24" /> : <Tv className="w-24 h-24" />}
            </div>
          )}
        </div>

        {/* Hero Content (Poster, Info, Actions) */}
        <div className="hero-content">
          {/* Left Section (Poster, Media Info) */}
          <div className="hero-left">
            <div className="media-poster">
              {media?.thumb ? (
                <img src={media.thumb} alt={media.title} />
              ) : (
                <div className="placeholder-poster">
                  {media.type === 'movie' ? <Film className="w-16 h-16" /> : <Tv className="w-16 h-16" />}
                </div>
              )}
            </div>

            {/* Media Info (Type, Title, Meta, Genres) */}
            <div className="media-info">
              <div className="media-type">
                {media?.type === 'movie' ? <Film className="w-5 h-5" /> : <Tv className="w-5 h-5" />}
                <span>{media.type === 'movie' ? 'Movie' : 'TV Show'}</span>
              </div>

              <h1 className="media-title">{media?.title}</h1>

              <div className="media-meta">
                {media?.year && (
                  <div className="meta-item">
                    <Calendar className="w-4 h-4" />
                    <span>{media.year}</span>
                  </div>
                )}

                {media?.duration && (
                  <div className="meta-item">
                    <Clock className="w-4 h-4" />
                    <span>{formatDuration(media.duration)}</span>
                  </div>
                )}

                {media?.rating && (
                  <div className="meta-item">
                    <Star className="w-4 h-4 fill-current" />
                    <span>{media.rating}</span>
                  </div>
                )}

                {media?.viewCount !== undefined && (
                  <div className="meta-item">
                    <Eye className="w-4 h-4" />
                    <span>{media.viewCount} views</span>
                  </div>
                )}
              </div>

              {media?.genres && media.genres.length > 0 && (
                <div className="genres">
                  {media.genres.map((genre, index) => (
                    <span key={index} className="genre-tag">{genre}</span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Section (Play Button, Add to List Button) */}
          <div className="hero-right">
            <button className="play-button">
              <Play className="w-6 h-6" />
              <span>Play</span>
            </button>

            <button className="add-button">
              <Plus className="w-5 h-5" />
              <span>Add to List</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="details-content">
        <div className="content-grid">
          {/* Main Info */}
          <div className="main-info">
            <h2>Overview</h2>
            <p className="summary">{media?.summary}</p>

            {media?.tagline && (
              <div className="info-section">
                <h3>Tagline</h3>
                <p>{media.tagline}</p>
              </div>
            )}

            {media?.originallyAvailableAt && (
              <div className="info-section">
                <h3>Release Date</h3>
                <p>{new Date(media.originallyAvailableAt).toLocaleDateString()}</p>
              </div>
            )}

            {media?.addedAt && (
              <div className="info-section">
                <h3>Added to Library</h3>
                <p>{new Date(media.addedAt).toLocaleDateString()}</p>
              </div>
            )}

            {media?.lastViewedAt && (
              <div className="info-section">
                <h3>Last Watched</h3>
                <p>{new Date(media.lastViewedAt).toLocaleDateString()}</p>
              </div>
            )}

            {media?.actors && media.actors.length > 0 && (
              <div className="info-section">
                <h3>Cast</h3>
                <div className="cast-list">
                  {media.actors.map((actor) => (
                    <div key={actor.id} className="cast-member">
                      <img src={actor.thumb || ''} alt={actor.tag} />
                      <span>{actor.tag}</span>
                      {actor.role && <span className="cast-role">({actor.role})</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="sidebar">
            <div className="sidebar-section">
              <h3>Quick Actions</h3>
              <div className="action-buttons">
                <button className="action-button">
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
                <button className="action-button">
                  <Eye className="w-4 h-4" />
                  <span>Mark as Watched</span>
                </button>
                <button className="action-button">
                  <Star className="w-4 h-4" />
                  <span>Rate</span>
                </button>
              </div>
            </div>

            {media?.type === 'show' && (
              <div className="sidebar-section">
                <h3>Show Information</h3>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaDetails;
