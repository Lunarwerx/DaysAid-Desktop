export interface Note {
  id: string;
  content: string;
  category: string;
  images: string[];
  completed: boolean;
  createdAt: string;
}

export interface AnnoyingSettings {
  orbit: boolean;
  pulse: boolean;
  shake: boolean;
  rainbow: boolean;
}

export interface UserSettings {
  hotkey: string;
  mouseFollowerEnabled: boolean;
  annoyingSettings: AnnoyingSettings;
}

export type View = 'input' | 'list' | 'settings';
