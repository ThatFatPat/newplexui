import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { AppConfig } from './types';
import { plexService } from './services/plexService';
import { sonarrService } from './services/sonarrService';
import { radarrService } from './services/radarrService';

// Components
import Layout from './components/Layout';
import Home from './pages/Home';
import Search from './pages/Search';
import Library from './pages/Library';
import MediaDetails from './pages/MediaDetails';
import Settings from './pages/Settings';
import Player from './pages/Player';
import Onboarding from './pages/Onboarding';

// Context
import { ConfigProvider } from './contexts/ConfigContext';

const defaultConfig: AppConfig = {
  plex: {
    host: 'localhost',
    port: 32400,
    token: '',
    scheme: 'http',
  },
  sonarr: {
    host: 'localhost',
    port: 8989,
    apiKey: '',
    scheme: 'http',
  },
  radarr: {
    host: 'localhost',
    port: 7878,
    apiKey: '',
    scheme: 'http',
  },
};

function App() {
  const [config, setConfig] = useState<AppConfig>(() => {
    const saved = localStorage.getItem('newplexui-config');
    return saved ? JSON.parse(saved) : defaultConfig;
  });
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    // Check if services are configured
    const hasPlexToken = config.plex.token.length > 0;
    const hasSonarrKey = config.sonarr.apiKey.length > 0;
    const hasRadarrKey = config.radarr.apiKey.length > 0;
    
    setIsConfigured(hasPlexToken || hasSonarrKey || hasRadarrKey);

    // Initialize services if configured
    if (hasPlexToken) {
      plexService.initialize(config.plex);
    }
    if (hasSonarrKey) {
      sonarrService.initialize(config.sonarr);
    }
    if (hasRadarrKey) {
      radarrService.initialize(config.radarr);
    }
  }, [config]);

  const updateConfig = (newConfig: AppConfig) => {
    setConfig(newConfig);
    localStorage.setItem('newplexui-config', JSON.stringify(newConfig));
  };

  return (
    <ConfigProvider value={{ config, updateConfig, isConfigured }}>
      <Router>
        <div className="min-h-screen bg-dark-900 text-white">
          <AnimatePresence mode="wait">
            {!isConfigured ? (
              <motion.div
                key="onboarding"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Onboarding />
              </motion.div>
            ) : (
              <motion.div
                key="app"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Layout>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/search" element={<Search />} />
                    <Route path="/library/:type" element={<Library />} />
                    <Route path="/media/:type/:id" element={<MediaDetails />} />
                    <Route path="/player/:type/:id" element={<Player />} />
                    <Route path="/settings" element={<Settings />} />
                  </Routes>
                </Layout>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Router>
    </ConfigProvider>
  );
}

export default App;
