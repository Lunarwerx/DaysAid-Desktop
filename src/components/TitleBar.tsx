import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { platform } from '@/lib/platform';
import SignInModal from '@/components/SignInModal';
import type { View } from '@/types';

// Icons
const MenuIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

const BellIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const MinimizeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

interface TitleBarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
}

export default function TitleBar({ 
  currentView, 
  setCurrentView, 
  selectedCategory, 
  setSelectedCategory 
}: TitleBarProps) {
  const { user } = useAuth();
  const [showSignInModal, setShowSignInModal] = useState(false);
  
  const handleNavClick = () => {
    if (currentView === 'input') {
      setCurrentView('list');
      setSelectedCategory(null);
    } else if (currentView === 'list') {
      if (selectedCategory) {
        setSelectedCategory(null);
      } else {
        setCurrentView('input');
      }
    } else if (currentView === 'settings') {
      setCurrentView('input');
    }
  };

  const handleSettingsClick = () => {
    if (currentView === 'settings') {
      setCurrentView('input');
    } else {
      setCurrentView('settings');
    }
  };

  const handleMinimize = () => {
    if (platform.isElectron && window.electron) {
      // @ts-ignore - electron API
      window.electron.hideWindow?.();
    }
  };

  const handleTitleClick = () => {
    setCurrentView('input');
    setSelectedCategory(null);
  };

  const showBackArrow = currentView !== 'input';

  return (
    <div className="h-11 flex justify-between items-center px-4 bg-[var(--bg-card)]/30 border-b border-[var(--border-color)] transition-colors duration-300">
      {/* Left side - Settings/Notifications */}
      <div className="flex items-center gap-1 z-10">
        <button
          onClick={handleSettingsClick}
          className="p-1 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--border-color)] hover:text-[var(--text-primary)] transition-colors relative"
        >
          <BellIcon />
        </button>
        
        {platform.isElectron && (
          <button
            onClick={handleMinimize}
            className="p-1 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--border-color)] hover:text-[var(--text-primary)] transition-colors"
            title="Minimize to tray"
          >
            <MinimizeIcon />
          </button>
        )}
      </div>

      {/* Center - Title with Logo */}
      <div 
        className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5 font-bold text-base text-[var(--text-primary)] cursor-pointer hover:opacity-70 transition-opacity"
        onClick={handleTitleClick}
      >
        <img 
          src="https://res.cloudinary.com/dsbcjpghc/image/upload/v1764224594/favicons_pobcfv.png" 
          alt="DaysAid" 
          className="w-5 h-5 object-contain"
        />
        <span>DaysAid</span>
      </div>

      {/* Right side - Navigation + Sign In */}
      <div className="flex items-center gap-1 z-10">
        {!user && (
          <button
            onClick={() => setShowSignInModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-white text-xs font-semibold hover:bg-accent-hover transition-colors"
          >
            <UserIcon />
            <span>Sign In</span>
          </button>
        )}
        
        <button
          onClick={handleNavClick}
          className="p-1 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--border-color)] hover:text-[var(--text-primary)] transition-colors"
        >
          {showBackArrow ? <BackIcon /> : <MenuIcon />}
        </button>
      </div>

      {/* Sign In Modal */}
      <SignInModal isOpen={showSignInModal} onClose={() => setShowSignInModal(false)} />
    </div>
  );
}
