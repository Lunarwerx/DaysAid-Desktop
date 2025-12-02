import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import type { Note } from '@/types';
import type { DbNote } from '@/types/database';

interface NotesContextType {
  notes: Note[];
  loading: boolean;
  addNote: (content: string, category: string, images?: string[]) => Promise<boolean>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<boolean>;
  deleteNote: (id: string) => Promise<boolean>;
  deleteCategory: (category: string) => Promise<boolean>;
  toggleComplete: (id: string) => Promise<boolean>;
  getCategories: () => { name: string; count: number }[];
  getNotesByCategory: (category: string) => Note[];
  refreshNotes: () => Promise<void>;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

// Local storage key for guest notes
const LOCAL_NOTES_KEY = 'daysaid_local_notes';

function loadLocalNotes(): Note[] {
  try {
    const stored = localStorage.getItem(LOCAL_NOTES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveLocalNotes(notes: Note[]) {
  localStorage.setItem(LOCAL_NOTES_KEY, JSON.stringify(notes));
}

export function NotesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotes = useCallback(async () => {
    setLoading(true);
    
    // If signed in, load from Supabase
    if (user) {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading notes:', error);
        setLoading(false);
        return;
      }

      const dbNotes = data as unknown as DbNote[];
      setNotes(dbNotes?.map(n => ({
        id: n.id,
        content: n.content,
        category: n.category,
        images: n.images || [],
        completed: n.completed || false,
        createdAt: n.created_at
      })) || []);
    } else {
      // Guest mode - load from localStorage
      setNotes(loadLocalNotes());
    }
    
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  // Save to localStorage when notes change (for guests)
  useEffect(() => {
    if (!user && !loading) {
      saveLocalNotes(notes);
    }
  }, [notes, user, loading]);

  const addNote = async (content: string, category: string, images: string[] = []): Promise<boolean> => {
    // Guest mode - save locally
    if (!user) {
      const newNote: Note = {
        id: crypto.randomUUID(),
        content,
        category,
        images,
        completed: false,
        createdAt: new Date().toISOString()
      };
      setNotes(prev => [newNote, ...prev]);
      return true;
    }

    // Signed in - save to Supabase
    const { data, error } = await supabase
      .from('notes')
      .insert({
        content,
        category,
        images,
        completed: false,
        user_id: user.id
      } as never)
      .select()
      .single();

    if (error) {
      console.error('Error saving note:', error);
      return false;
    }

    const dbNote = data as unknown as DbNote;
    setNotes(prev => [{
      id: dbNote.id,
      content: dbNote.content,
      category: dbNote.category,
      images: dbNote.images || [],
      completed: dbNote.completed || false,
      createdAt: dbNote.created_at
    }, ...prev]);

    return true;
  };

  const updateNote = async (id: string, updates: Partial<Note>): Promise<boolean> => {
    // Guest mode - update locally
    if (!user) {
      setNotes(prev => prev.map(n => n.id === id ? { ...n, ...updates } : n));
      return true;
    }

    // Signed in - update in Supabase
    const dbUpdates: Record<string, unknown> = {};
    if (updates.content !== undefined) dbUpdates.content = updates.content;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.images !== undefined) dbUpdates.images = updates.images;
    if (updates.completed !== undefined) dbUpdates.completed = updates.completed;

    const { error } = await supabase
      .from('notes')
      .update(dbUpdates as never)
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating note:', error);
      return false;
    }

    setNotes(prev => prev.map(n => n.id === id ? { ...n, ...updates } : n));
    return true;
  };

  const deleteNote = async (id: string): Promise<boolean> => {
    // Guest mode - delete locally
    if (!user) {
      setNotes(prev => prev.filter(n => n.id !== id));
      return true;
    }

    // Signed in - delete from Supabase
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting note:', error);
      return false;
    }

    setNotes(prev => prev.filter(n => n.id !== id));
    return true;
  };

  const deleteCategory = async (category: string): Promise<boolean> => {
    // Guest mode - delete locally
    if (!user) {
      setNotes(prev => prev.filter(n => n.category !== category));
      return true;
    }

    // Signed in - delete from Supabase
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('category', category)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting category:', error);
      return false;
    }

    setNotes(prev => prev.filter(n => n.category !== category));
    return true;
  };

  const toggleComplete = async (id: string): Promise<boolean> => {
    const note = notes.find(n => n.id === id);
    if (!note) return false;
    return updateNote(id, { completed: !note.completed });
  };

  const getCategories = (): { name: string; count: number }[] => {
    const categoryMap = new Map<string, number>();
    notes.forEach(note => {
      if (!note.completed) {
        categoryMap.set(note.category, (categoryMap.get(note.category) || 0) + 1);
      } else if (!categoryMap.has(note.category)) {
        categoryMap.set(note.category, 0);
      }
    });
    return Array.from(categoryMap.entries()).map(([name, count]) => ({ name, count }));
  };

  const getNotesByCategory = (category: string): Note[] => {
    if (category === 'All Notes') return notes;
    return notes.filter(n => n.category === category);
  };

  const refreshNotes = async () => {
    await loadNotes();
  };

  return (
    <NotesContext.Provider value={{
      notes,
      loading,
      addNote,
      updateNote,
      deleteNote,
      deleteCategory,
      toggleComplete,
      getCategories,
      getNotesByCategory,
      refreshNotes
    }}>
      {children}
    </NotesContext.Provider>
  );
}

export function useNotes() {
  const context = useContext(NotesContext);
  if (context === undefined) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
}
