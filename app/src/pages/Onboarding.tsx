import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Tv, Film, Settings, Check, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { useConfig } from '../contexts/ConfigContext';
import type { AppConfig } from '../types';

const Onboarding = () => {
  const { config, updateConfig } = useConfig();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<AppConfig>(config);
  const [testing, setTesting] = useState(false);
  const [testResults, setTestResults] = useState<{
    plex: boolean | null;
    sonarr: boolean | null;
    radarr: boolean | null;
  }>({ plex: null, sonarr: null, radarr: null });

  const steps = [
    { name: 'Welcome', icon: Settings },
    { name: 'Plex', icon: Play },
    { name: 'Sonarr', icon: Tv },
    { name: 'Radarr', icon: Film },
    { name: 'Complete', icon: Check },
  ];

  const updateFormData = (service: keyof AppConfig, field: string, value: string | number) => {
    setFormData(prev => ({
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
      if (service === 'plex') {
        const serviceConfig = formData.plex;
        const baseUrl = `${serviceConfig.scheme}://${serviceConfig.host}:${serviceConfig.port}`;
        // Test Plex connection
        const response = await fetch(`${baseUrl}/library/sections?X-Plex-Token=${serviceConfig.token}`);
        if (response.ok) {
          setTestResults(prev => ({ ...prev, plex: true }));
        } else {
          setTestResults(prev => ({ ...prev, plex: false }));
        }
      } else if (service === 'sonarr') {
        const serviceConfig = formData.sonarr;
        const baseUrl = `${serviceConfig.scheme}://${serviceConfig.host}:${serviceConfig.port}`;
        // Test Sonarr connection
        const response = await fetch(`${baseUrl}/api/v3/system/status?apikey=${serviceConfig.apiKey}`);
        if (response.ok) {
          setTestResults(prev => ({ ...prev, sonarr: true }));
        } else {
          setTestResults(prev => ({ ...prev, sonarr: false }));
        }
      } else if (service === 'radarr') {
        const serviceConfig = formData.radarr;
        const baseUrl = `${serviceConfig.scheme}://${serviceConfig.host}:${serviceConfig.port}`;
        // Test Radarr connection
        const response = await fetch(`${baseUrl}/api/v3/system/status?apikey=${serviceConfig.apiKey}`);
        if (response.ok) {
          setTestResults(prev => ({ ...prev, radarr: true }));
        } else {
          setTestResults(prev => ({ ...prev, radarr: false }));
        }
      }
    } catch (error) {
      console.error(`Error testing ${service}:`, error);
      setTestResults(prev => ({ ...prev, [service]: false }));
    } finally {
      setTesting(false);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      updateConfig(formData);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl font-bold text-white mb-4">Welcome to NewPlexUI</h1>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Let's configure your media services to get started. You can configure Plex, Sonarr, and Radarr to manage your media library.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-800 p-6 rounded-lg">
                <Play className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Plex</h3>
                <p className="text-gray-400 text-sm">Your media server and library</p>
              </div>
              <div className="bg-gray-800 p-6 rounded-lg">
                <Tv className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Sonarr</h3>
                <p className="text-gray-400 text-sm">TV show management</p>
              </div>
              <div className="bg-gray-800 p-6 rounded-lg">
                <Film className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Radarr</h3>
                <p className="text-gray-400 text-sm">Movie management</p>
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
            <div className="text-center mb-8">
              <Play className="w-16 h-16 text-blue-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Configure Plex</h2>
              <p className="text-gray-400">Connect to your Plex Media Server</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Host</label>
                <input
                  type="text"
                  value={formData.plex.host}
                  onChange={(e) => updateFormData('plex', 'host', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="localhost"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Port</label>
                <input
                  type="number"
                  value={formData.plex.port}
                  onChange={(e) => updateFormData('plex', 'port', parseInt(e.target.value))}
                  className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="32400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Scheme</label>
                <select
                  value={formData.plex.scheme}
                  onChange={(e) => updateFormData('plex', 'scheme', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="http">HTTP</option>
                  <option value="https">HTTPS</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Token</label>
                <input
                  type="password"
                  value={formData.plex.token}
                  onChange={(e) => updateFormData('plex', 'token', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Your Plex token"
                />
              </div>
              <button
                onClick={() => testConnection('plex')}
                disabled={testing}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50"
              >
                {testing ? 'Testing...' : 'Test Connection'}
              </button>
              {testResults.plex !== null && (
                <div className={`flex items-center space-x-2 p-3 rounded-lg ${testResults.plex ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                  {testResults.plex ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                  <span>{testResults.plex ? 'Connection successful!' : 'Connection failed. Please check your settings.'}</span>
                </div>
              )}
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
            <div className="text-center mb-8">
              <Tv className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Configure Sonarr</h2>
              <p className="text-gray-400">Connect to your Sonarr instance</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Host</label>
                <input
                  type="text"
                  value={formData.sonarr.host}
                  onChange={(e) => updateFormData('sonarr', 'host', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="localhost"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Port</label>
                <input
                  type="number"
                  value={formData.sonarr.port}
                  onChange={(e) => updateFormData('sonarr', 'port', parseInt(e.target.value))}
                  className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="8989"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Scheme</label>
                <select
                  value={formData.sonarr.scheme}
                  onChange={(e) => updateFormData('sonarr', 'scheme', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="http">HTTP</option>
                  <option value="https">HTTPS</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">API Key</label>
                <input
                  type="password"
                  value={formData.sonarr.apiKey}
                  onChange={(e) => updateFormData('sonarr', 'apiKey', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Your Sonarr API key"
                />
              </div>
              <button
                onClick={() => testConnection('sonarr')}
                disabled={testing}
                className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50"
              >
                {testing ? 'Testing...' : 'Test Connection'}
              </button>
              {testResults.sonarr !== null && (
                <div className={`flex items-center space-x-2 p-3 rounded-lg ${testResults.sonarr ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                  {testResults.sonarr ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                  <span>{testResults.sonarr ? 'Connection successful!' : 'Connection failed. Please check your settings.'}</span>
                </div>
              )}
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
            <div className="text-center mb-8">
              <Film className="w-16 h-16 text-purple-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Configure Radarr</h2>
              <p className="text-gray-400">Connect to your Radarr instance</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Host</label>
                <input
                  type="text"
                  value={formData.radarr.host}
                  onChange={(e) => updateFormData('radarr', 'host', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="localhost"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Port</label>
                <input
                  type="number"
                  value={formData.radarr.port}
                  onChange={(e) => updateFormData('radarr', 'port', parseInt(e.target.value))}
                  className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="7878"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Scheme</label>
                <select
                  value={formData.radarr.scheme}
                  onChange={(e) => updateFormData('radarr', 'scheme', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="http">HTTP</option>
                  <option value="https">HTTPS</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">API Key</label>
                <input
                  type="password"
                  value={formData.radarr.apiKey}
                  onChange={(e) => updateFormData('radarr', 'apiKey', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Your Radarr API key"
                />
              </div>
              <button
                onClick={() => testConnection('radarr')}
                disabled={testing}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50"
              >
                {testing ? 'Testing...' : 'Test Connection'}
              </button>
              {testResults.radarr !== null && (
                <div className={`flex items-center space-x-2 p-3 rounded-lg ${testResults.radarr ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                  {testResults.radarr ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                  <span>{testResults.radarr ? 'Connection successful!' : 'Connection failed. Please check your settings.'}</span>
                </div>
              )}
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <Check className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">Setup Complete!</h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Your media services have been configured. You can now browse your library, search for content, and manage your media collection.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className={`p-4 rounded-lg ${testResults.plex ? 'bg-green-900' : 'bg-gray-800'}`}>
                <Play className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                <p className="text-sm">Plex {testResults.plex ? '✓' : '✗'}</p>
              </div>
              <div className={`p-4 rounded-lg ${testResults.sonarr ? 'bg-green-900' : 'bg-gray-800'}`}>
                <Tv className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <p className="text-sm">Sonarr {testResults.sonarr ? '✓' : '✗'}</p>
              </div>
              <div className={`p-4 rounded-lg ${testResults.radarr ? 'bg-green-900' : 'bg-gray-800'}`}>
                <Film className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                <p className="text-sm">Radarr {testResults.radarr ? '✓' : '✗'}</p>
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="flex items-center justify-center mb-8">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${index <= currentStep
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-400'
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
                  className={`w-16 h-1 mx-2 ${index < currentStep ? 'bg-blue-600' : 'bg-gray-700'
                    }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="bg-gray-800 rounded-lg p-8">
          {renderStep()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <button
            onClick={handleNext}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
          >
            <span>{currentStep === steps.length - 1 ? 'Get Started' : 'Next'}</span>
            {currentStep < steps.length - 1 && <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
