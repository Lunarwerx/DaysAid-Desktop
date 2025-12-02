// Platform detection utility
// Detects which platform the app is running on

declare global {
  interface Window {
    Capacitor?: {
      getPlatform: () => string;
      isNativePlatform: () => boolean;
    };
    electron?: {
      ipcRenderer: unknown;
    };
  }
}

export const platform = {
  get isWeb(): boolean {
    return !this.isCapacitor && !this.isElectron;
  },
  
  get isCapacitor(): boolean {
    return typeof window !== 'undefined' && 'Capacitor' in window && !!window.Capacitor;
  },
  
  get isNative(): boolean {
    return this.isCapacitor && window.Capacitor?.isNativePlatform?.() === true;
  },
  
  get isIOS(): boolean {
    return this.isCapacitor && window.Capacitor?.getPlatform?.() === 'ios';
  },
  
  get isAndroid(): boolean {
    return this.isCapacitor && window.Capacitor?.getPlatform?.() === 'android';
  },
  
  get isElectron(): boolean {
    return typeof window !== 'undefined' && 'electron' in window;
  },
  
  get isMobile(): boolean {
    return this.isIOS || this.isAndroid;
  },
  
  get isDesktop(): boolean {
    return this.isElectron;
  },
  
  get current(): 'web' | 'ios' | 'android' | 'electron' {
    if (this.isElectron) return 'electron';
    if (this.isIOS) return 'ios';
    if (this.isAndroid) return 'android';
    return 'web';
  }
};
