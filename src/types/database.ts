export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Simplified types - we'll use explicit types in our code instead of relying on generated types
export interface Database {
  public: {
    Tables: {
      notes: {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
      }
      user_settings: {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
      }
    }
  }
}

// Explicit types for our app
export interface DbNote {
  id: string;
  content: string;
  category: string;
  images: string[] | null;
  completed: boolean;
  user_id: string;
  created_at: string;
}

export interface DbUserSettings {
  id: string;
  user_id: string;
  hotkey: string | null;
  mouse_follower_enabled: boolean;
  annoying_settings: Json | null;
  updated_at: string;
}
