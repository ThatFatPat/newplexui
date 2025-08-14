// Utility to test API connections
export const testAPIConnections = async (config: any) => {
  const results = {
    plex: { success: false, data: null, error: null as string | null },
    sonarr: { success: false, data: null, error: null as string | null },
    radarr: { success: false, data: null, error: null as string | null }
  };

  // Test Plex
  if (config.plex.token) {
    try {
      const baseUrl = `${config.plex.scheme}://${config.plex.host}:${config.plex.port}`;
      const response = await fetch(`${baseUrl}/library/sections?X-Plex-Token=${config.plex.token}`);

      if (response.ok) {
        const data = await response.json();
        results.plex = { success: true, data, error: null };
      } else {
        results.plex = { success: false, data: null, error: `HTTP ${response.status}` };
      }
    } catch (error) {
      results.plex = { success: false, data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Test Sonarr
  if (config.sonarr.apiKey) {
    try {
      const baseUrl = `${config.sonarr.scheme}://${config.sonarr.host}:${config.sonarr.port}`;
      const response = await fetch(`${baseUrl}/api/v3/system/status?apikey=${config.sonarr.apiKey}`);

      if (response.ok) {
        const data = await response.json();
        results.sonarr = { success: true, data, error: null };
      } else {
        results.sonarr = { success: false, data: null, error: `HTTP ${response.status}` };
      }
    } catch (error) {
      results.sonarr = { success: false, data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Test Radarr
  if (config.radarr.apiKey) {
    try {
      const baseUrl = `${config.radarr.scheme}://${config.radarr.host}:${config.radarr.port}`;
      const response = await fetch(`${baseUrl}/api/v3/system/status?apikey=${config.radarr.apiKey}`);

      if (response.ok) {
        const data = await response.json();
        results.radarr = { success: true, data, error: null };
      } else {
        results.radarr = { success: false, data: null, error: `HTTP ${response.status}` };
      }
    } catch (error) {
      results.radarr = { success: false, data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  return results;
};
