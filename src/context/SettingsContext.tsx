import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import { platform } from '@/lib/platform';
import type { AnnoyingSettings, UserSettings } from '@/types';
import type { DbUserSettings } from '@/types/database';

interface SettingsContextType {
  settings: UserSettings;
  updateSettings: (updates: Partial<UserSettings>) => Promise<void>;
  subscribedCategories: Set<string>;
  toggleCategorySubscription: (category: string) => void;
}

const defaultSettings: UserSettings = {
  hotkey: 'F20',
  mouseFollowerEnabled: false,
  annoyingSettings: {
    orbit: false,
    pulse: false,
    shake: false,
    rainbow: false
  }
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [subscribedCategories, setSubscribedCategories] = useState<Set<string>>(new Set());

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSubs = localStorage.getItem('subscribedCategories');
    if (savedSubs) {
      setSubscribedCategories(new Set(JSON.parse(savedSubs)));
    }

    const savedFollower = localStorage.getItem('mouseFollowerEnabled');
    if (savedFollower) {
      setSettings(prev => ({ ...prev, mouseFollowerEnabled: JSON.parse(savedFollower) }));
    }

    const savedAnnoying = localStorage.getItem('annoyingSettings');
    if (savedAnnoying) {
      setSettings(prev => ({ ...prev, annoyingSettings: JSON.parse(savedAnnoying) }));
    }
  }, []);

  // Load settings from Supabase when user changes
  useEffect(() => {
    if (!user) return;

    const loadFromSupabase = async () => {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Failed to load settings:', error);
        return;
      }

      if (data) {
        const settings = data as unknown as DbUserSettings;
        setSettings({
          hotkey: settings.hotkey || 'F20',
          mouseFollowerEnabled: settings.mouse_follower_enabled || false,
          annoyingSettings: (settings.annoying_settings as unknown as AnnoyingSettings) || defaultSettings.annoyingSettings
        });
      }
    };

    loadFromSupabase();
  }, [user]);

  const updateSettings = async (updates: Partial<UserSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);

    // Save to localStorage
    if (updates.mouseFollowerEnabled !== undefined) {
      localStorage.setItem('mouseFollowerEnabled', JSON.stringify(updates.mouseFollowerEnabled));
    }
    if (updates.annoyingSettings) {
      localStorage.setItem('annoyingSettings', JSON.stringify(updates.annoyingSettings));
    }

    // Save to Supabase
    if (user) {
      await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          hotkey: newSettings.hotkey,
          mouse_follower_enabled: newSettings.mouseFollowerEnabled,
          annoying_settings: newSettings.annoyingSettings,
          updated_at: new Date().toISOString()
        } as never);
    }

    // Update Electron follower if on desktop
    if (platform.isElectron && window.electron) {
      // @ts-ignore - electron API
      window.electron.updateFollowerState?.(
        newSettings.mouseFollowerEnabled,
        0, // count will be updated separately
        newSettings.annoyingSettings
      );
    }
  };

  const toggleCategorySubscription = (category: string) => {
    setSubscribedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      localStorage.setItem('subscribedCategories', JSON.stringify([...newSet]));
      return newSet;
    });
  };

  return (
    <SettingsContext.Provider value={{
      settings,
      updateSettings,
      subscribedCategories,
      toggleCategorySubscription
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
