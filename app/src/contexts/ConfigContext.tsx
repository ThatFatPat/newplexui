import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { AppConfig } from '../types';

interface ConfigContextType {
  config: AppConfig;
  updateConfig: (config: AppConfig) => void;
  isConfigured: boolean;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
};

interface ConfigProviderProps {
  children: ReactNode;
  value: ConfigContextType;
}

export const ConfigProvider = ({ children, value }: ConfigProviderProps) => {
  return (
    <ConfigContext.Provider value={value}>
      {children}
    </ConfigContext.Provider>
  );
};
