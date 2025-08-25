import React, { useContext, useEffect, useState } from 'react';
import AdminDashboard from './components/AdminDashboard';
import PublicWebsite from './components/PublicWebsite';
import GlobalPlayer from './components/GlobalPlayer';
import { useMockDatabase, MockDatabase } from './hooks/useMockDatabase';
import { AudioPlayerProvider } from './contexts/AudioPlayerContext';

export const DatabaseContext = React.createContext<MockDatabase | null>(null);

const App: React.FC = () => {
  const db = useMockDatabase();
  const [route, setRoute] = useState(window.location.hash);
  const theme = db.themeConfig.get();

  useEffect(() => {
    const handleHashChange = () => setRoute(window.location.hash);
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);
  
  useEffect(() => {
    if (theme) {
        const root = document.documentElement;
        root.style.setProperty('--primary-color', theme.primaryColor);
        root.style.setProperty('--secondary-color', theme.secondaryColor);
        document.body.style.backgroundColor = theme.backgroundColor;
        document.body.style.color = theme.textColor;
        document.body.style.fontFamily = `'${theme.bodyFont}', sans-serif`;
        document.body.style.fontSize = `${theme.baseFontSize}px`;

        // Inject font styles for headlines
        const style = document.createElement('style');
        style.innerHTML = `.font-orbitron { font-family: '${theme.headlineFont}', sans-serif; }`;
        document.head.appendChild(style);
        return () => { document.head.removeChild(style); };
    }
  }, [theme]);

  return (
    <DatabaseContext.Provider value={db}>
      <AudioPlayerProvider>
        {/* Navigate to #admin to see the dashboard */}
        {route === '#admin' ? <AdminDashboard /> : <PublicWebsite />}
        <GlobalPlayer />
      </AudioPlayerProvider>
    </DatabaseContext.Provider>
  );
};

export default App;