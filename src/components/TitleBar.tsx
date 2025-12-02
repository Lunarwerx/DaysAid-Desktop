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

const DownloadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const ComputerIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
  </svg>
);

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// Download Modal Component
function DownloadModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[10000] flex justify-center items-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-[var(--bg-card)] p-8 rounded-2xl shadow-2xl max-w-sm w-full relative animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <CloseIcon />
        </button>
        
        <div className="text-center">
          <div className="text-accent mb-4 flex justify-center">
            <ComputerIcon />
          </div>
          
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
            Get DaysAid for Desktop
          </h2>
          
          <p className="text-[var(--text-secondary)] text-sm mb-4">
            Always available with a keystroke. Features include:
          </p>
          
          <ul className="text-left text-[var(--text-secondary)] text-sm mb-6 space-y-2">
            <li className="flex items-center gap-2">
              <span className="text-accent">✓</span> Quick access with F20 hotkey
            </li>
            <li className="flex items-center gap-2">
              <span className="text-accent">✓</span> Annoying mouse follower bell 🔔
            </li>
            <li className="flex items-center gap-2">
              <span className="text-accent">✓</span> System tray icon
            </li>
            <li className="flex items-center gap-2">
              <span className="text-accent">✓</span> Syncs with your web account
            </li>
          </ul>
          
          <a
            href="https://github.com/lunawerx/DaysAid/releases/latest/download/DaysAid.exe"
            download
            className="flex items-center justify-center gap-2 w-full py-3 bg-accent text-white font-semibold rounded-xl hover:bg-accent-hover transition-colors"
          >
            <DownloadIcon />
            Download for Windows
          </a>
          
          <p className="text-[var(--text-muted)] text-xs mt-4">
            Windows 10/11 • ~66MB • Portable (no install)
          </p>
        </div>
      </div>
    </div>
  );
}

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
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  
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
      {/* Left side - Settings/Notifications + Desktop Download */}
      <div className="flex items-center gap-1 z-10">
        <button
          onClick={handleSettingsClick}
          className="p-1 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--border-color)] hover:text-[var(--text-primary)] transition-colors relative"
        >
          <BellIcon />
        </button>
        
        {/* Desktop Download Button - Only on Web */}
        {!platform.isElectron && (
          <button
            onClick={() => setShowDownloadModal(true)}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--border-color)] hover:text-[var(--text-primary)] transition-colors text-xs font-medium"
            title="Download Desktop App"
          >
            <DownloadIcon />
            <span className="hidden sm:inline">Desktop</span>
          </button>
        )}
        
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
      
      {/* Download Modal */}
      <DownloadModal isOpen={showDownloadModal} onClose={() => setShowDownloadModal(false)} />
    </div>
  );
}
