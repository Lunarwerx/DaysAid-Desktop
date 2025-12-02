import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { NotesProvider } from '@/context/NotesContext';
import { SettingsProvider } from '@/context/SettingsContext';
import { ThemeProvider } from '@/context/ThemeContext';
import TitleBar from '@/components/TitleBar';
import InputView from '@/components/InputView';
import ListView from '@/components/ListView';
import SettingsView from '@/components/SettingsView';
import { platform } from '@/lib/platform';
import type { View } from '@/types';

function AppContent() {
  const { loading } = useAuth();
  const [currentView, setCurrentView] = useState<View>('input');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Listen for reset-view from Electron
  useEffect(() => {
    if (platform.isElectron && window.electron) {
      // @ts-ignore - electron API
      window.electron.onResetView?.(() => {
        setCurrentView('input');
        setSelectedCategory(null);
      });
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-secondary)]">
        <div className="text-[var(--text-muted)]">Loading...</div>
      </div>
    );
  }

  return (
    <NotesProvider>
      <SettingsProvider>
        <div className="min-h-screen flex flex-col bg-[var(--bg-secondary)] backdrop-blur-xl safe-area-top safe-area-bottom transition-colors duration-300">
          <TitleBar 
            currentView={currentView}
            setCurrentView={setCurrentView}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />
          
          <main className="flex-1 flex flex-col overflow-hidden">
            {currentView === 'input' && (
              <InputView />
            )}
            
            {currentView === 'list' && (
              <ListView 
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                setCurrentView={setCurrentView}
              />
            )}
            
            {currentView === 'settings' && (
              <SettingsView />
            )}
          </main>
        </div>
      </SettingsProvider>
    </NotesProvider>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
