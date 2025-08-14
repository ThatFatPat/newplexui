import { useState, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, Star, Clock, ArrowLeft, Plus, Eye, Film, Tv, Calendar, Users, Download } from 'lucide-react';
import type { PlexMedia } from '../types';
import './MediaDetails.css';

const MediaDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);

  const media = useMemo(() => {
    if (!id) return null;
    // For now, create a placeholder media object
    // In a real app, this would fetch from Plex API using the ID
    const details: PlexMedia = {
      id: parseInt(id),
      title: 'Sample Media',
      type: 'movie',
      year: 2024,
      summary: 'This is a sample media item for demonstration purposes. In a real application, this would show the actual movie or TV show details fetched from your Plex server.',
      rating: 8.5,
      duration: 7200000, // 2 hours in milliseconds
      thumb: undefined,
      art: undefined,
      banner: undefined,
      genres: ['Action', 'Adventure', 'Sci-Fi'],
      addedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      viewCount: 0,
      lastViewedAt: undefined,
    };
    return details;
  }, [id]);

  const handleRefresh = useCallback(() => {
    setLoading(true);
    // Simulate refresh
    setTimeout(() => setLoading(false), 1000);
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
  }

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
          {media.banner ? (
            <img src={media.banner} alt={media.title} />
          ) : (
            <div className="placeholder-banner">
              {media.type === 'movie' ? <Film className="w-24 h-24" /> : <Tv className="w-24 h-24" />}
            </div>
          )}
        </div>
        
        <div className="hero-content">
          <div className="hero-left">
            <div className="media-poster">
              {media.thumb ? (
                <img src={media.thumb} alt={media.title} />
              ) : (
                <div className="placeholder-poster">
                  {media.type === 'movie' ? <Film className="w-16 h-16" /> : <Tv className="w-16 h-16" />}
                </div>
              )}
            </div>
            
            <div className="media-info">
              <div className="media-type">
                {media.type === 'movie' ? <Film className="w-5 h-5" /> : <Tv className="w-5 h-5" />}
                <span>{media.type === 'movie' ? 'Movie' : 'TV Show'}</span>
              </div>
              
              <h1 className="media-title">{media.title}</h1>
              
              <div className="media-meta">
                {media.year && (
                  <div className="meta-item">
                    <Calendar className="w-4 h-4" />
                    <span>{media.year}</span>
                  </div>
                )}
                
                {media.duration && (
                  <div className="meta-item">
                    <Clock className="w-4 h-4" />
                    <span>{formatDuration(media.duration)}</span>
                  </div>
                )}
                
                {media.rating && (
                  <div className="meta-item">
                    <Star className="w-4 h-4 fill-current" />
                    <span>{media.rating}</span>
                  </div>
                )}
                
                {media.viewCount !== undefined && (
                  <div className="meta-item">
                    <Eye className="w-4 h-4" />
                    <span>{media.viewCount} views</span>
                  </div>
                )}
              </div>
              
              {media.genres && media.genres.length > 0 && (
                <div className="genres">
                  {media.genres.map((genre, index) => (
                    <span key={index} className="genre-tag">{genre}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
          
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
            <p className="summary">{media.summary}</p>
            
            {media.addedAt && (
              <div className="info-section">
                <h3>Added to Library</h3>
                <p>{new Date(media.addedAt).toLocaleDateString()}</p>
              </div>
            )}
            
            {media.lastViewedAt && (
              <div className="info-section">
                <h3>Last Watched</h3>
                <p>{new Date(media.lastViewedAt).toLocaleDateString()}</p>
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
            
            {media.type === 'show' && (
              <div className="sidebar-section">
                <h3>Show Information</h3>
                <div className="show-stats">
                  <div className="stat-item">
                    <span className="stat-label">Seasons</span>
                    <span className="stat-value">3</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Episodes</span>
                    <span className="stat-value">24</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaDetails;
