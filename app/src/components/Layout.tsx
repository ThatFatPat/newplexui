import type { ReactNode } from 'react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Search,
  Library,
  Settings,
  Menu,
  Play,
  Tv,
  Film,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useConfig } from '../contexts/ConfigContext';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { config } = useConfig();
  const location = useLocation();

  const navigationItems = [
    {
      name: 'Home',
      href: '/',
      icon: Home,
    },
    {
      name: 'Search',
      href: '/search',
      icon: Search,
    },
    {
      name: 'Library',
      href: '/library',
      icon: Library,
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
    },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  const getConnectionStatus = () => {
    const hasPlex = config.plex.token.length > 0;
    const hasSonarr = config.sonarr.apiKey.length > 0;
    const hasRadarr = config.radarr.apiKey.length > 0;
    
    if (hasPlex || hasSonarr || hasRadarr) {
      return { connected: true, count: [hasPlex, hasSonarr, hasRadarr].filter(Boolean).length };
    }
    return { connected: false, count: 0 };
  };

  const connectionStatus = getConnectionStatus();

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed lg:relative lg:translate-x-0 lg:w-64 bg-gray-800 border-r border-gray-700 z-50 h-full overflow-y-auto transition-transform duration-300 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Play className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">NewPlexUI</h1>
                <div className="flex items-center space-x-1 mt-1">
                  {connectionStatus.connected ? (
                    <>
                      <Wifi className="w-3 h-3 text-green-500" />
                      <span className="text-xs text-green-400">{connectionStatus.count} service(s) connected</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-3 h-3 text-red-500" />
                      <span className="text-xs text-red-400">No services connected</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                    active
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <Icon className={`w-5 h-5 transition-colors ${
                    active ? 'text-white' : 'text-gray-400 group-hover:text-white'
                  }`} />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Service Status */}
          <div className="p-4 border-t border-gray-700">
            <h3 className="text-sm font-medium text-gray-400 mb-3">Service Status</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Play className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-gray-300">Plex</span>
                </div>
                <div className={`w-2 h-2 rounded-full ${config.plex.token ? 'bg-green-500' : 'bg-red-500'}`} />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Tv className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-gray-300">Sonarr</span>
                </div>
                <div className={`w-2 h-2 rounded-full ${config.sonarr.apiKey ? 'bg-green-500' : 'bg-red-500'}`} />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Film className="w-4 h-4 text-purple-500" />
                  <span className="text-sm text-gray-300">Radarr</span>
                </div>
                <div className={`w-2 h-2 rounded-full ${config.radarr.apiKey ? 'bg-green-500' : 'bg-red-500'}`} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="bg-gray-800 border-b border-gray-700 px-4 py-3 lg:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="flex-1 lg:hidden" />

              <div className="flex items-center space-x-4">
                <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-400">
                  <span>Welcome to NewPlexUI</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-gray-400">Online</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
