import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import { useTheme } from '@/context/ThemeContext';
import { platform } from '@/lib/platform';

// Theme icons
const SunIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

const MoonIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const MonitorIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
  </svg>
);

export default function SettingsView() {
  const { user, signOut, signInWithOtp, verifyOtp } = useAuth();
  const { settings, updateSettings } = useSettings();
  const { theme, setTheme, resolvedTheme } = useTheme();
  
  // Sign-in form state
  const [showSignIn, setShowSignIn] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [signInStep, setSignInStep] = useState<'email' | 'otp'>('email');
  const [signInLoading, setSignInLoading] = useState(false);
  const [signInError, setSignInError] = useState('');

  const handleSendOtp = async () => {
    if (!email) return;
    setSignInLoading(true);
    setSignInError('');
    const { error } = await signInWithOtp(email);
    setSignInLoading(false);
    if (error) {
      setSignInError(error.message);
    } else {
      setSignInStep('otp');
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 6) return;
    setSignInLoading(true);
    setSignInError('');
    const { error } = await verifyOtp(email, otp.trim());
    setSignInLoading(false);
    if (error) {
      setSignInError(error.message);
    } else {
      setShowSignIn(false);
      setEmail('');
      setOtp('');
      setSignInStep('email');
    }
  };

  const handleMouseFollowerToggle = (enabled: boolean) => {
    updateSettings({ mouseFollowerEnabled: enabled });
  };

  const handleAnnoyingSettingToggle = (key: keyof typeof settings.annoyingSettings, enabled: boolean) => {
    updateSettings({
      annoyingSettings: {
        ...settings.annoyingSettings,
        [key]: enabled
      }
    });
  };

  // Toggle Switch component
  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) => (
    <label className="relative inline-block w-12 h-7 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      <span className={`absolute inset-0 rounded-full transition-colors ${checked ? 'bg-accent' : 'bg-[var(--text-muted)]'}`} />
      <span className={`absolute left-1 top-1 w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${checked ? 'translate-x-5' : ''}`} />
    </label>
  );

  // Setting Item component
  const SettingItem = ({ 
    title, 
    description, 
    children,
    nested = false 
  }: { 
    title: string; 
    description: string; 
    children: React.ReactNode;
    nested?: boolean;
  }) => (
    <div className={`flex justify-between items-center p-4 transition-colors duration-300 ${nested ? 'bg-transparent shadow-none border-none py-3' : 'bg-[var(--bg-card)] rounded-xl shadow-sm border border-[var(--border-color)]'}`}>
      <div className="flex-1 mr-4">
        <div className="font-semibold text-[var(--text-primary)]">{title}</div>
        <div className="text-xs text-[var(--text-secondary)] max-w-[250px]">{description}</div>
      </div>
      {children}
    </div>
  );

  // Theme Picker component
  const ThemePicker = () => (
    <div className="flex gap-1 bg-[var(--border-color)] rounded-lg p-1">
      <button
        onClick={() => setTheme('light')}
        className={`p-2 rounded-md transition-all ${
          theme === 'light' 
            ? 'bg-[var(--bg-card)] text-accent shadow-sm' 
            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
        }`}
        title="Light mode"
      >
        <SunIcon />
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={`p-2 rounded-md transition-all ${
          theme === 'dark' 
            ? 'bg-[var(--bg-card)] text-accent shadow-sm' 
            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
        }`}
        title="Dark mode"
      >
        <MoonIcon />
      </button>
      <button
        onClick={() => setTheme('system')}
        className={`p-2 rounded-md transition-all ${
          theme === 'system' 
            ? 'bg-[var(--bg-card)] text-accent shadow-sm' 
            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
        }`}
        title="System preference"
      >
        <MonitorIcon />
      </button>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col p-5 overflow-hidden transition-colors duration-300">
      <div className="flex items-center mb-4">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Settings</h2>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 space-y-3">
        {/* Theme Setting */}
        <SettingItem
          title="Appearance"
          description={`Currently using ${resolvedTheme} mode${theme === 'system' ? ' (auto)' : ''}`}
        >
          <ThemePicker />
        </SettingItem>

        {/* Mouse Follower - Desktop Only */}
        {platform.isElectron && (
          <>
            <SettingItem
              title="Annoying Mouse Follower"
              description="Shows a notification bell that follows your cursor when you have tasks to do."
            >
              <Toggle
                checked={settings.mouseFollowerEnabled}
                onChange={handleMouseFollowerToggle}
              />
            </SettingItem>

            {settings.mouseFollowerEnabled && (
              <div className="ml-5 border-l-2 border-[var(--border-color)] pl-3 space-y-1">
                <SettingItem nested title="Orbit Mode" description="Makes the bell rotate around your cursor.">
                  <Toggle
                    checked={settings.annoyingSettings.orbit}
                    onChange={(checked) => handleAnnoyingSettingToggle('orbit', checked)}
                  />
                </SettingItem>
                <SettingItem nested title="Pulse Mode" description="The bell grows and shrinks rapidly.">
                  <Toggle
                    checked={settings.annoyingSettings.pulse}
                    onChange={(checked) => handleAnnoyingSettingToggle('pulse', checked)}
                  />
                </SettingItem>
                <SettingItem nested title="Shake Mode" description="The bell jitters nervously.">
                  <Toggle
                    checked={settings.annoyingSettings.shake}
                    onChange={(checked) => handleAnnoyingSettingToggle('shake', checked)}
                  />
                </SettingItem>
                <SettingItem nested title="Rainbow Mode" description="Rapidly changing colors for maximum distraction.">
                  <Toggle
                    checked={settings.annoyingSettings.rainbow}
                    onChange={(checked) => handleAnnoyingSettingToggle('rainbow', checked)}
                  />
                </SettingItem>
              </div>
            )}

            {/* Hotkey Setting - Desktop Only */}
            <SettingItem
              title="Quick Open Hotkey"
              description="Press to set your preferred hotkey to open/close DaysAid."
            >
              <button className="px-4 py-2 bg-accent text-white font-mono text-sm font-semibold rounded-lg hover:bg-accent-hover transition-colors">
                {settings.hotkey}
              </button>
            </SettingItem>
          </>
        )}

        {/* Account */}
        {user ? (
          <SettingItem
            title="Account"
            description={user.email || 'Signed in'}
          >
            <button
              onClick={signOut}
              className="px-4 py-2 bg-red-500 text-white text-sm font-semibold rounded-lg hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </SettingItem>
        ) : (
          <div className="bg-[var(--bg-card)] rounded-xl shadow-sm border border-[var(--border-color)] p-4 transition-colors duration-300">
            <div className="font-semibold text-[var(--text-primary)] mb-1">Sync Your Notes</div>
            <div className="text-xs text-[var(--text-secondary)] mb-3">
              Sign in to sync notes across all your devices
            </div>
            
            {!showSignIn ? (
              <button
                onClick={() => setShowSignIn(true)}
                className="w-full py-2.5 bg-accent text-white text-sm font-semibold rounded-lg hover:bg-accent-hover transition-colors"
              >
                Sign In with Email
              </button>
            ) : signInStep === 'email' ? (
              <div className="space-y-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-3 py-2 border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] rounded-lg text-sm focus:border-accent focus:ring-1 focus:ring-accent/20 transition-colors outline-none"
                  onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => { setShowSignIn(false); setEmail(''); setSignInError(''); }}
                    className="flex-1 py-2 bg-[var(--border-color)] text-[var(--text-primary)] text-sm font-medium rounded-lg hover:opacity-80 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendOtp}
                    disabled={signInLoading || !email}
                    className="flex-1 py-2 bg-accent text-white text-sm font-semibold rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50"
                  >
                    {signInLoading ? 'Sending...' : 'Send Code'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-[var(--text-secondary)]">Enter the code sent to {email}</p>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="000000"
                  maxLength={8}
                  className="w-full px-3 py-2 border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] rounded-lg text-lg text-center font-mono font-bold tracking-widest focus:border-accent focus:ring-1 focus:ring-accent/20 transition-colors outline-none"
                  onKeyDown={(e) => e.key === 'Enter' && handleVerifyOtp()}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => { setSignInStep('email'); setOtp(''); setSignInError(''); }}
                    className="flex-1 py-2 bg-[var(--border-color)] text-[var(--text-primary)] text-sm font-medium rounded-lg hover:opacity-80 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleVerifyOtp}
                    disabled={signInLoading || otp.length < 6}
                    className="flex-1 py-2 bg-accent text-white text-sm font-semibold rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50"
                  >
                    {signInLoading ? 'Verifying...' : 'Verify'}
                  </button>
                </div>
              </div>
            )}
            
            {signInError && (
              <p className="text-red-500 text-xs mt-2">{signInError}</p>
            )}
          </div>
        )}

        {/* Platform Info */}
        <div className="text-center text-xs text-[var(--text-muted)] mt-6">
          Platform: {platform.current} • Version 2.0.0
        </div>
      </div>
    </div>
  );
}
