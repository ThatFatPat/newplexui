console.log('MediaDetails.tsx loaded at', new Date().toISOString());
// ...existing code...
import { useState, useMemo, useCallback, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, Star, Clock, ArrowLeft, Plus, Eye, Film, Tv, Calendar, Download, ChevronDown, ChevronRight } from 'lucide-react';
import type { PlexMedia, PlexSeason } from '../types';
import { useConfig } from '../contexts/ConfigContext';
import PlexService from '../services/plexService';
import SonarrService from '../services/sonarrService';


// Helper to get Sonarr config (since config is private)
function getSonarrConfig(sonarrService: SonarrService) {
  // @ts-ignore
  return sonarrService.config || sonarrService["config"];
}

async function setSonarrEpisodeMonitored(
  sonarrService: SonarrService | null,
  episodeId: number,
  monitored = true
): Promise<void> {
  if (!sonarrService || !episodeId) return;
  const allSeries = await sonarrService.getSeries();
  let foundEp: any = null;
  for (const series of allSeries) {
    const episodes: any[] = await sonarrService.getEpisodes(series.id);
    const ep = episodes.find((e: any) => e.id === episodeId);
    if (ep) {
      foundEp = ep;
      break;
    }
  }
  if (!foundEp) return;
  const config = getSonarrConfig(sonarrService);
  await fetch(`${config.url}/api/v3/episode/${episodeId}`, {
    method: 'PUT',
    headers: {
      'X-Api-Key': config.apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ...foundEp, monitored }),
  });
}

async function setSonarrSeasonMonitored(
  sonarrService: SonarrService | null,
  seriesId: number,
  seasonNumber: number,
  monitored = true
): Promise<void> {
  if (!sonarrService || !seriesId || seasonNumber == null) {
    console.log('setSonarrSeasonMonitored: missing sonarrService, seriesId, or seasonNumber', { sonarrService, seriesId, seasonNumber });
    return;
  }
  const seriesArr = await sonarrService.getSeries();
  const series = seriesArr.find((s: any) => s.id === seriesId);
  if (!series) {
    console.log('setSonarrSeasonMonitored: series not found', { seriesId, seriesArr });
    return;
  }
  const newSeasons = (series.seasons || []).map((s: any) =>
    s.seasonNumber === seasonNumber ? { ...s, monitored } : s
  );
  const config = getSonarrConfig(sonarrService);
  const url = `${config.url}/api/v3/series/${seriesId}`;
  const payload = { ...series, seasons: newSeasons };
  console.log('setSonarrSeasonMonitored: sending PUT', { url, payload });
  await fetch(url, {
    method: 'PUT',
    headers: {
      'X-Api-Key': config.apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
}

import './MediaDetails.css';

interface MediaDetailsParams {
  id?: string;
  [key: string]: string | undefined;
}

const MediaDetails = () => {
  const [showSeasonModal, setShowSeasonModal] = useState(false);
  const [seasonToDownload, setSeasonToDownload] = useState<number | null>(null);
  const [downloadingSeason, setDownloadingSeason] = useState<{ [seasonNum: number]: boolean }>({});
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
  // Allow multiple expanded seasons
  const [expandedSeasons, setExpandedSeasons] = useState<Set<number>>(new Set());
  const [sonarrEpisodes, setSonarrEpisodes] = useState<any[]>([]);
  const [sonarrSeriesId, setSonarrSeriesId] = useState<number | null>(null);
  const [downloading, setDownloading] = useState<{ [epId: number]: boolean }>({});

  useEffect(() => {
    if (!id || !plexService) return;
    const fetchMediaDetails = async () => {
      setLoading(true);
      try {
        const mediaData = await plexService.getMediaDetails(parseInt(id));
        setMedia(mediaData);
        if (mediaData?.type === 'show') {
          const seasonsData = await plexService.getShowSeasons(parseInt(id));
          setSeasons(seasonsData);
        }
      } catch (error: any) {
        console.error('Error fetching media details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMediaDetails();
  }, [id, plexService]);
  const sonarrService = useMemo(() => {
    if (config.sonarr?.apiKey && config.sonarr?.host && config.sonarr?.port && config.sonarr?.scheme) {
      return new SonarrService({
        url: `${config.sonarr.scheme}://${config.sonarr.host}:${config.sonarr.port}`,
        apiKey: config.sonarr.apiKey
      });
    }
    return null;
  }, [config.sonarr]);

  useEffect(() => {
    if (!id || !plexService) return;
    const fetchMediaDetails = async () => {
      setLoading(true);
      try {
        const mediaData = await plexService.getMediaDetails(parseInt(id));
        setMedia(mediaData);
        if (mediaData?.type === 'show') {
          const seasonsData = await plexService.getShowSeasons(parseInt(id));
          setSeasons(seasonsData);
          // Try to find matching Sonarr series
          if (sonarrService) {
            let sonarrSeries = null;
            const allSeries = await sonarrService.getSeries();
            if (mediaData.guid && mediaData.guid.startsWith('tvdb://')) {
              const tvdbId = parseInt(mediaData.guid.replace('tvdb://', ''));
              sonarrSeries = allSeries.find((s: any) => s.tvdbId === tvdbId);
            }
            if (!sonarrSeries) {
              sonarrSeries = allSeries.find((s: any) => s.title.toLowerCase() === mediaData.title.toLowerCase());
            }
            if (sonarrSeries) {
              setSonarrSeriesId(sonarrSeries.id);
              const episodes = await sonarrService.getEpisodes(sonarrSeries.id);
              // Fetch episodeFile for each episode if needed
              const episodesWithFiles = await Promise.all(episodes.map(async (ep: any) => {
                let episodeFile = null;
                if (ep.episodeFileId) {
                  episodeFile = await sonarrService.getEpisodeFile(ep.episodeFileId);
                }
                return {
                  ...ep,
                  episodeFile,
                  seriesImages: sonarrSeries.images || [],
                };
              }));
              setSonarrEpisodes(episodesWithFiles);
            }
          }
        }
      } catch (error: any) {
        console.error('Error fetching media details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMediaDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, plexService, sonarrService]);

  const handleRefresh = useCallback(async () => {
    // Implement refresh logic here
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

  // --- HERO SECTION RESTORED ---
  // Transparent background, no banner fallback

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

      {/* Hero Section Restored */}
      <div className="hero-section">
        <div className="hero-background" style={{ background: 'transparent' }}>
          {media?.banner ? (
            <img src={media.banner} alt={media.title} className="full-banner" />
          ) : null}
        </div>
        <div className="hero-content">
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
          <div className="hero-right">
            {media?.type === 'movie' && (
              <Link to={`/player/movie/${media.id}`} className="play-button">
                <Play className="w-6 h-6" />
                <span>Play</span>
              </Link>
            )}
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

            {/* --- SEASONS/EPISODES LIST --- */}
            {media?.type === 'show' && sonarrEpisodes && sonarrEpisodes.length > 0 && (() => {
              // Build a union of all season numbers from Sonarr and Plex
              const sonarrSeasonNumbers = Array.from(new Set(sonarrEpisodes.map((ep: any) => ep.seasonNumber)));
              const plexSeasonNumbers = seasons.map((season) => {
                let seasonNum = null;
                if (typeof season.title === 'string') {
                  const match = season.title.match(/(\d+)/);
                  if (match) seasonNum = parseInt(match[1]);
                }
                if (!seasonNum) seasonNum = season.id;
                return seasonNum;
              });
              const allSeasonNumbers = Array.from(new Set([...sonarrSeasonNumbers, ...plexSeasonNumbers])).sort((a, b) => a - b);

              return (
                <div className="seasons-list details-seasons-list">
                  <h2>Seasons & Episodes</h2>
                  {allSeasonNumbers.map((seasonNum) => {
                    // Find Plex and Sonarr season info
                    const plexSeason = seasons.find((season) => {
                      let seasonNumGuess = null;
                      if (typeof season.title === 'string') {
                        const match = season.title.match(/(\d+)/);
                        if (match) seasonNumGuess = parseInt(match[1]);
                      }
                      if (!seasonNumGuess) seasonNumGuess = season.id;
                      return seasonNumGuess === seasonNum;
                    });
                    const sonarrSeasonEpisodes = sonarrEpisodes.filter((ep: any) => ep.seasonNumber === seasonNum);
                    const hasAnyEpisodeDownloading = sonarrSeasonEpisodes.some((ep: any) => downloading[ep.id]);
                    const allDownloaded = sonarrSeasonEpisodes.length > 0 && sonarrSeasonEpisodes.every((ep: any) => ep.hasFile);
                    const anyUndownloaded = sonarrSeasonEpisodes.some((ep: any) => !ep.hasFile);
                    const isExpanded = expandedSeasons.has(seasonNum);
                    return (
                      <div key={seasonNum} className="season-block">
                        <div className="season-header" onClick={() => {
                          setExpandedSeasons(prev => {
                            const next = new Set(prev);
                            if (next.has(seasonNum)) next.delete(seasonNum); else next.add(seasonNum);
                            return next;
                          });
                        }}>
                          <div className="season-title-row">
                            <button className="expand-btn" aria-label={isExpanded ? 'Collapse' : 'Expand'}>
                              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            </button>
                            <span className="season-title">{plexSeason?.title || `Season ${seasonNum}`}</span>
                            {anyUndownloaded && (
                              <button
                                className="download-season-btn"
                                disabled={downloadingSeason[seasonNum] || hasAnyEpisodeDownloading}
                                onClick={e => {
                                  e.stopPropagation();
                                  setSeasonToDownload(seasonNum);
                                  setShowSeasonModal(true);
                                }}
                              >
                                <Download className="w-4 h-4" />
                                {downloadingSeason[seasonNum] ? 'Downloading...' : 'Download Season'}
                              </button>
                            )}
                            {allDownloaded && <span className="season-downloaded">All Downloaded</span>}
                          </div>
                        </div>
                        {isExpanded && (
                          <div className="episodes-list">
                            {sonarrSeasonEpisodes.length === 0 && (
                              <div className="no-episodes">No episodes found for this season.</div>
                            )}
                            {sonarrSeasonEpisodes.map((ep: any) => {
                              // Prefer Plex episode thumb, then Sonarr episodeFile.coverImage, then Sonarr seriesImages
                              let thumb = '';
                              let plexEp = null;
                              if (plexSeason && plexSeason.episodes) {
                                plexEp = plexSeason.episodes[ep.episodeNumber - 1] ?? null;
                              }
                              {/* Thumbnail */ }
                              // Debug: log full episode objects
                              console.log('plexEp:', plexEp, 'sonarrEp:', ep);
                              // Try Plex thumb, then Sonarr images (screenshot, poster, banner), then fallback
                              if (plexEp && plexEp.thumb) {
                                thumb = plexEp.thumb;
                              }
                              else if (ep.images && Array.isArray(ep.images)) {
                                // Try screenshot, then poster, then banner
                                const img = ep.images.find((img: any) => img.coverType === 'screenshot')
                                  || ep.images.find((img: any) => img.coverType === 'poster')
                                  || ep.images.find((img: any) => img.coverType === 'banner')
                                  || ep.images[0];
                                if (img && (img.remoteUrl || img.url)) {
                                  thumb = img.remoteUrl || img.url;
                                }
                              }
                              // Fallback: use Sonarr series images (poster/banner)
                              else if (ep.seriesImages && Array.isArray(ep.seriesImages)) {
                                const img = ep.seriesImages.find((img: any) => img.coverType === 'poster')
                                  || ep.seriesImages.find((img: any) => img.coverType === 'banner')
                                  || ep.seriesImages[0];
                                if (img && (img.remoteUrl || img.url)) {
                                  thumb = img.remoteUrl || img.url;
                                  console.log('Sonarr series fallback image:', thumb, ep.title, img.coverType);
                                }
                              }
                              console.log('No thumbnail found for episode:', ep.title);
                              return (
                                <div key={ep.id} className={`episode-row${ep.hasFile ? ' downloaded' : ''}`} style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                                  <div className="episode-thumb">
                                    {thumb ? (
                                      <img src={thumb} alt={`Episode ${ep.episodeNumber}`} />
                                    ) : (
                                      <div className="thumb-placeholder"><Tv className="w-6 h-6" /></div>
                                    )}
                                  </div>
                                  <div className="episode-details-flex">
                                    <div className="episode-title-row-flex">
                                      <span className="episode-number-badge">{ep.episodeNumber}</span>
                                      <span className="episode-title">{ep.title || `Episode ${ep.episodeNumber}`}</span>
                                      <div className="episode-title-actions">
                                        {ep.hasFile ? (
                                          <>
                                            <Link to={`/player/episode/${ep.id}`} className="episode-play-btn" title="Play Episode">
                                              <Play className="w-5 h-5" />
                                            </Link>
                                            <span className="downloaded-label">Downloaded</span>
                                          </>
                                        ) : (
                                          <button
                                            className="download-episode-btn"
                                            disabled={!!downloading[ep.id]}
                                            onClick={async () => {
                                              setDownloading(d => ({ ...d, [ep.id]: true }));
                                              try {
                                                console.log('Download Episode button clicked', { sonarrService, ep });
                                                if (sonarrService) {
                                                  await setSonarrEpisodeMonitored(sonarrService, ep.id, true);
                                                  await sonarrService.searchEpisode(ep.id);
                                                }
                                              } finally {
                                                setDownloading(d => ({ ...d, [ep.id]: false }));
                                              }
                                            }}
                                          >
                                            <Download className="w-4 h-4" />
                                            {downloading[ep.id] ? 'Downloading...' : 'Download'}
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                    <div className="episode-meta">
                                      <span>S{seasonNum}E{ep.episodeNumber}</span>
                                      {ep.airDate && <span> | Air Date: {ep.airDate}</span>}
                                      {ep.runtime && <span> | {ep.runtime} min</span>}
                                    </div>
                                    {ep.overview && <div className="episode-overview">{ep.overview}</div>}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {showSeasonModal && seasonToDownload !== null && (
                    <div className="modal-overlay" onClick={() => setShowSeasonModal(false)}>
                      <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                          <h2>Download Entire Season?</h2>
                          <button onClick={() => setShowSeasonModal(false)} className="close-button">✕</button>
                        </div>
                        <div className="modal-body">
                          <p>Are you sure you want to search and download all episodes for this season?</p>
                          <button
                            className="download-season-btn confirm"
                            disabled={typeof seasonToDownload !== 'number' ? true : !!downloadingSeason[seasonToDownload as number]}
                            onClick={async () => {
                              if (seasonToDownload === null) return;
                              setDownloadingSeason(d => ({ ...d, [seasonToDownload]: true }));
                              try {
                                alert('Download Season handler triggered!');
                                console.log('Download Season button clicked', { sonarrService, sonarrSeriesId, seasonToDownload });
                                // Always mark the season as monitored in Sonarr before triggering download
                                if (sonarrService && sonarrSeriesId !== null && seasonToDownload !== null) {
                                  await setSonarrSeasonMonitored(sonarrService, sonarrSeriesId, seasonToDownload, true);
                                }
                                // Find all episode IDs for this season
                                const episodeIds = sonarrEpisodes.filter((ep: any) => ep.seasonNumber === seasonToDownload && !ep.hasFile).map((ep: any) => ep.id);
                                console.log('Episode IDs to download:', episodeIds);
                                if (sonarrService && episodeIds.length > 0) {
                                  // Ensure all episodes in this season are monitored
                                  for (const epId of episodeIds) {
                                    await setSonarrEpisodeMonitored(sonarrService, epId, true);
                                  }
                                  await sonarrService.searchEpisodes(episodeIds);
                                }
                              } finally {
                                setDownloadingSeason(d => ({ ...d, [seasonToDownload]: false }));
                                setShowSeasonModal(false);
                              }
                            }}
                          >
                            <Download className="w-5 h-5" /> Confirm Download
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

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
