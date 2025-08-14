import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Save, TestTube, Trash2 } from 'lucide-react';
import { useConfig } from '../contexts/ConfigContext';
import { AppConfig } from '../types';

const Settings = () => {
  const { config, updateConfig } = useConfig();
  const [tempConfig, setTempConfig] = useState<AppConfig>(config);
  const [saving, setSaving] = useState(false);

  const updateTempConfig = (service: keyof AppConfig, field: string, value: any) => {
    setTempConfig(prev => ({
      ...prev,
      [service]: {
        ...prev[service],
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    // Simulate save delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    updateConfig(tempConfig);
    setSaving(false);
  };

  const resetToDefaults = () => {
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
    setTempConfig(defaultConfig);
  };

  return (
    <div className="min-h-full bg-dark-900 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <div className="flex items-center space-x-3 mb-8">
          <SettingsIcon className="w-8 h-8 text-primary-500" />
          <h1 className="text-3xl font-bold text-white">Settings</h1>
        </div>

        <div className="space-y-8">
          {/* Plex Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card p-6"
          >
            <h2 className="text-xl font-semibold text-white mb-6">Plex Configuration</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Host
                </label>
                <input
                  type="text"
                  value={tempConfig.plex.host}
                  onChange={(e) => updateTempConfig('plex', 'host', e.target.value)}
                  className="input-field w-full"
                  placeholder="localhost"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Port
                </label>
                <input
                  type="number"
                  value={tempConfig.plex.port}
                  onChange={(e) => updateTempConfig('plex', 'port', parseInt(e.target.value))}
                  className="input-field w-full"
                  placeholder="32400"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Access Token
                </label>
                <input
                  type="password"
                  value={tempConfig.plex.token}
                  onChange={(e) => updateTempConfig('plex', 'token', e.target.value)}
                  className="input-field w-full"
                  placeholder="Your Plex token"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Find your token in Plex Web App → Settings → Account
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Protocol
                </label>
                <select
                  value={tempConfig.plex.scheme}
                  onChange={(e) => updateTempConfig('plex', 'scheme', e.target.value)}
                  className="input-field w-full"
                >
                  <option value="http">HTTP</option>
                  <option value="https">HTTPS</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Sonarr Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card p-6"
          >
            <h2 className="text-xl font-semibold text-white mb-6">Sonarr Configuration</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Host
                </label>
                <input
                  type="text"
                  value={tempConfig.sonarr.host}
                  onChange={(e) => updateTempConfig('sonarr', 'host', e.target.value)}
                  className="input-field w-full"
                  placeholder="localhost"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Port
                </label>
                <input
                  type="number"
                  value={tempConfig.sonarr.port}
                  onChange={(e) => updateTempConfig('sonarr', 'port', parseInt(e.target.value))}
                  className="input-field w-full"
                  placeholder="8989"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  API Key
                </label>
                <input
                  type="password"
                  value={tempConfig.sonarr.apiKey}
                  onChange={(e) => updateTempConfig('sonarr', 'apiKey', e.target.value)}
                  className="input-field w-full"
                  placeholder="Your Sonarr API key"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Find your API key in Sonarr → Settings → General
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Protocol
                </label>
                <select
                  value={tempConfig.sonarr.scheme}
                  onChange={(e) => updateTempConfig('sonarr', 'scheme', e.target.value)}
                  className="input-field w-full"
                >
                  <option value="http">HTTP</option>
                  <option value="https">HTTPS</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Radarr Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card p-6"
          >
            <h2 className="text-xl font-semibold text-white mb-6">Radarr Configuration</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Host
                </label>
                <input
                  type="text"
                  value={tempConfig.radarr.host}
                  onChange={(e) => updateTempConfig('radarr', 'host', e.target.value)}
                  className="input-field w-full"
                  placeholder="localhost"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Port
                </label>
                <input
                  type="number"
                  value={tempConfig.radarr.port}
                  onChange={(e) => updateTempConfig('radarr', 'port', parseInt(e.target.value))}
                  className="input-field w-full"
                  placeholder="7878"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  API Key
                </label>
                <input
                  type="password"
                  value={tempConfig.radarr.apiKey}
                  onChange={(e) => updateTempConfig('radarr', 'apiKey', e.target.value)}
                  className="input-field w-full"
                  placeholder="Your Radarr API key"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Find your API key in Radarr → Settings → General
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Protocol
                </label>
                <select
                  value={tempConfig.radarr.scheme}
                  onChange={(e) => updateTempConfig('radarr', 'scheme', e.target.value)}
                  className="input-field w-full"
                >
                  <option value="http">HTTP</option>
                  <option value="https">HTTPS</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary flex items-center justify-center space-x-2"
            >
              <Save className="w-5 h-5" />
              <span>{saving ? 'Saving...' : 'Save Settings'}</span>
            </button>
            
            <button
              onClick={resetToDefaults}
              className="btn-secondary flex items-center justify-center space-x-2"
            >
              <Trash2 className="w-5 h-5" />
              <span>Reset to Defaults</span>
            </button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Settings;
