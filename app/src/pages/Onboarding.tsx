import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Tv, Film, Settings, Check, AlertCircle } from 'lucide-react';
import { useConfig } from '../contexts/ConfigContext';
import { AppConfig } from '../types';

const Onboarding = () => {
  const { config, updateConfig } = useConfig();
  const [currentStep, setCurrentStep] = useState(0);
  const [tempConfig, setTempConfig] = useState<AppConfig>(config);
  const [testing, setTesting] = useState(false);
  const [testResults, setTestResults] = useState<{
    plex: boolean | null;
    sonarr: boolean | null;
    radarr: boolean | null;
  }>({ plex: null, sonarr: null, radarr: null });

  const steps = [
    {
      title: 'Welcome to NewPlexUI',
      description: 'Configure your media services to get started',
      icon: Play,
    },
    {
      title: 'Plex Configuration',
      description: 'Connect to your Plex Media Server',
      icon: Tv,
    },
    {
      title: 'Sonarr Configuration',
      description: 'Connect to Sonarr for TV show management',
      icon: Tv,
    },
    {
      title: 'Radarr Configuration',
      description: 'Connect to Radarr for movie management',
      icon: Film,
    },
    {
      title: 'Finish Setup',
      description: 'Test your connections and complete setup',
      icon: Check,
    },
  ];

  const updateTempConfig = (service: keyof AppConfig, field: string, value: any) => {
    setTempConfig(prev => ({
      ...prev,
      [service]: {
        ...prev[service],
        [field]: value,
      },
    }));
  };

  const testConnection = async (service: 'plex' | 'sonarr' | 'radarr') => {
    setTesting(true);
    setTestResults(prev => ({ ...prev, [service]: null }));

    try {
      // Simple connection test - in a real app, you'd test actual API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTestResults(prev => ({ ...prev, [service]: true }));
    } catch (error) {
      setTestResults(prev => ({ ...prev, [service]: false }));
    } finally {
      setTesting(false);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Save configuration
      updateConfig(tempConfig);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-24 h-24 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Play className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Welcome to NewPlexUI</h2>
            <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
              A modern, mobile-friendly interface for your Plex Media Server with Sonarr and Radarr integration.
              Search, discover, and manage your media collection with ease.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="card p-6 text-center">
                <Tv className="w-12 h-12 text-primary-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Plex Integration</h3>
                <p className="text-gray-400">Browse and play your media collection</p>
              </div>
              <div className="card p-6 text-center">
                <Film className="w-12 h-12 text-primary-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Sonarr & Radarr</h3>
                <p className="text-gray-400">Manage TV shows and movies</p>
              </div>
              <div className="card p-6 text-center">
                <Settings className="w-12 h-12 text-primary-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Modern UI</h3>
                <p className="text-gray-400">Beautiful, responsive design</p>
              </div>
            </div>
          </motion.div>
        );

      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto"
          >
            <h3 className="text-xl font-semibold text-white mb-6">Plex Configuration</h3>
            <div className="space-y-4">
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
              <div>
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
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto"
          >
            <h3 className="text-xl font-semibold text-white mb-6">Sonarr Configuration</h3>
            <div className="space-y-4">
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
              <div>
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
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto"
          >
            <h3 className="text-xl font-semibold text-white mb-6">Radarr Configuration</h3>
            <div className="space-y-4">
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
              <div>
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
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto"
          >
            <h3 className="text-xl font-semibold text-white mb-6">Test Connections</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 card">
                <div className="flex items-center space-x-3">
                  <Tv className="w-5 h-5 text-primary-500" />
                  <span className="text-white">Plex</span>
                </div>
                <div className="flex items-center space-x-2">
                  {testResults.plex === null && (
                    <button
                      onClick={() => testConnection('plex')}
                      disabled={testing}
                      className="btn-primary text-sm"
                    >
                      Test
                    </button>
                  )}
                  {testResults.plex === true && (
                    <Check className="w-5 h-5 text-green-500" />
                  )}
                  {testResults.plex === false && (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 card">
                <div className="flex items-center space-x-3">
                  <Tv className="w-5 h-5 text-primary-500" />
                  <span className="text-white">Sonarr</span>
                </div>
                <div className="flex items-center space-x-2">
                  {testResults.sonarr === null && (
                    <button
                      onClick={() => testConnection('sonarr')}
                      disabled={testing}
                      className="btn-primary text-sm"
                    >
                      Test
                    </button>
                  )}
                  {testResults.sonarr === true && (
                    <Check className="w-5 h-5 text-green-500" />
                  )}
                  {testResults.sonarr === false && (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 card">
                <div className="flex items-center space-x-3">
                  <Film className="w-5 h-5 text-primary-500" />
                  <span className="text-white">Radarr</span>
                </div>
                <div className="flex items-center space-x-2">
                  {testResults.radarr === null && (
                    <button
                      onClick={() => testConnection('radarr')}
                      disabled={testing}
                      className="btn-primary text-sm"
                    >
                      Test
                    </button>
                  )}
                  {testResults.radarr === true && (
                    <Check className="w-5 h-5 text-green-500" />
                  )}
                  {testResults.radarr === false && (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
              </div>

              <p className="text-sm text-gray-400 text-center mt-6">
                You can always update these settings later in the Settings page.
              </p>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    index <= currentStep
                      ? 'bg-primary-600 text-white'
                      : 'bg-dark-700 text-gray-400'
                  }`}
                >
                  {index < currentStep ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-16 h-1 mx-2 ${
                      index < currentStep ? 'bg-primary-600' : 'bg-dark-700'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-2">
              {steps[currentStep].title}
            </h1>
            <p className="text-gray-400">{steps[currentStep].description}</p>
          </div>
        </div>

        {/* Step Content */}
        <div className="card p-8 mb-8">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Back
          </button>
          
          <button
            onClick={handleNext}
            className="btn-primary"
          >
            {currentStep === steps.length - 1 ? 'Finish Setup' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
