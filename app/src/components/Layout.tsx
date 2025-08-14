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
  WifiOff,
  X
} from 'lucide-react';
import { useConfig } from '../contexts/ConfigContext';
import './Layout.css';

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
    <div className="layout">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="mobile-overlay">
          <div className="mobile-sidebar">
            <div className="sidebar-content">
              {/* Mobile Sidebar Header */}
              <div className="sidebar-header">
                <div className="header-content">
                  <div className="logo">
                    <Play size={20} color="white" />
                  </div>
                  <div>
                    <h1 className="app-title">NewPlexUI</h1>
                    <div className="connection-status">
                      {connectionStatus.connected ? (
                        <>
                          <Wifi size={12} color="#10b981" />
                          <span className="status-text connected">{connectionStatus.count} service(s) connected</span>
                        </>
                      ) : (
                        <>
                          <WifiOff size={12} color="#ef4444" />
                          <span className="status-text disconnected">No services connected</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="close-button"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Mobile Navigation */}
              <nav className="sidebar-nav">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);

                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsSidebarOpen(false)}
                      className={`nav-item ${active ? 'active' : ''}`}
                    >
                      <Icon size={20} color={active ? 'white' : '#9ca3af'} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Mobile Service Status */}
              <div className="service-status">
                <h3>Service Status</h3>
                <div className="status-items">
                  <div className="status-item">
                    <div className="status-info">
                      <Play size={16} color="#3b82f6" />
                      <span>Plex</span>
                    </div>
                    <div className={`status-dot ${config.plex.token ? 'connected' : 'disconnected'}`} />
                  </div>
                  <div className="status-item">
                    <div className="status-info">
                      <Tv size={16} color="#10b981" />
                      <span>Sonarr</span>
                    </div>
                    <div className={`status-dot ${config.sonarr.apiKey ? 'connected' : 'disconnected'}`} />
                  </div>
                  <div className="status-item">
                    <div className="status-info">
                      <Film size={16} color="#8b5cf6" />
                      <span>Radarr</span>
                    </div>
                    <div className={`status-dot ${config.radarr.apiKey ? 'connected' : 'disconnected'}`} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar - Fixed */}
      <aside className="desktop-sidebar">
        <div className="sidebar-content">
          {/* Desktop Sidebar Header */}
          <div className="sidebar-header">
            <div className="header-content">
              <div className="logo">
                <Play size={20} color="white" />
              </div>
              <div>
                <h1 className="app-title">NewPlexUI</h1>
                <div className="connection-status">
                  {connectionStatus.connected ? (
                    <>
                      <Wifi size={12} color="#10b981" />
                      <span className="status-text connected">{connectionStatus.count} service(s) connected</span>
                    </>
                  ) : (
                    <>
                      <WifiOff size={12} color="#ef4444" />
                      <span className="status-text disconnected">No services connected</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="sidebar-nav">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`nav-item ${active ? 'active' : ''}`}
                >
                  <Icon size={20} color={active ? 'white' : '#9ca3af'} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Desktop Service Status */}
          <div className="service-status">
            <h3>Service Status</h3>
            <div className="status-items">
              <div className="status-item">
                <div className="status-info">
                  <Play size={16} color="#3b82f6" />
                  <span>Plex</span>
                </div>
                <div className={`status-dot ${config.plex.token ? 'connected' : 'disconnected'}`} />
              </div>
              <div className="status-item">
                <div className="status-info">
                  <Tv size={16} color="#10b981" />
                  <span>Sonarr</span>
                </div>
                <div className={`status-dot ${config.sonarr.apiKey ? 'connected' : 'disconnected'}`} />
              </div>
              <div className="status-item">
                <div className="status-info">
                  <Film size={16} color="#8b5cf6" />
                  <span>Radarr</span>
                </div>
                <div className={`status-dot ${config.radarr.apiKey ? 'connected' : 'disconnected'}`} />
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area - Properly offset with padding */}
      <div className="main-content">
        {/* Top Bar */}
        <header className="top-bar">
          <div className="top-bar-content">
            <div className="top-bar-left">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="menu-button"
              >
                <Menu size={20} />
              </button>

              <div className="welcome-text">
                <span>Welcome to NewPlexUI</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="page-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
