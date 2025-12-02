import { useState } from 'react';
import { useNotes } from '@/context/NotesContext';
import { useSettings } from '@/context/SettingsContext';
import type { View } from '@/types';
import type { Note } from '@/types';

// Icons
const BellIcon = ({ filled = false }: { filled?: boolean }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const ListIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);

const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

const TrashIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

// Helper function to get category color
function getCategoryColor(category: string): string {
  const colors = [
    '#007AFF', '#34C759', '#FF9500', '#FF3B30',
    '#AF52DE', '#5856D6', '#FF2D55', '#5AC8FA'
  ];
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = category.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

// Helper function to parse markdown
function parseMarkdown(text: string): string {
  if (!text) return '';
  
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  
  html = html.replace(/^### (.*$)/gim, '<h3 class="font-bold text-base mt-2 mb-1">$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2 class="font-bold text-lg mt-2 mb-1">$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1 class="font-bold text-xl mt-2 mb-1">$1</h1>');
  html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');
  html = html.replace(/`(.*?)`/gim, '<code class="bg-[var(--border-color)] px-1 rounded text-sm font-mono">$1</code>');
  html = html.replace(/^> (.*$)/gim, '<blockquote class="border-l-2 border-accent pl-3 text-[var(--text-secondary)]">$1</blockquote>');
  html = html.replace(/^[\*\-] (.*$)/gim, '• $1<br>');
  html = html.replace(/\n/g, '<br>');
  
  return html;
}

interface ListViewProps {
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
  setCurrentView: (view: View) => void;
}

export default function ListView({ 
  selectedCategory, 
  setSelectedCategory,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setCurrentView: _setCurrentView
}: ListViewProps) {
  const { getCategories, getNotesByCategory, deleteNote, toggleComplete } = useNotes();
  const { subscribedCategories, toggleCategorySubscription } = useSettings();
  const [searchTerm, setSearchTerm] = useState('');
  const [collapsedNotes, setCollapsedNotes] = useState<Set<string>>(new Set());

  const categories = getCategories();
  const notes = selectedCategory ? getNotesByCategory(selectedCategory) : [];
  
  // Filter based on search
  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredNotes = notes.filter(n => 
    n.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Split notes into active and completed
  const activeNotes = filteredNotes.filter(n => !n.completed);
  const completedNotes = filteredNotes.filter(n => n.completed);

  const handleDeleteNote = async (noteId: string) => {
    if (confirm('Delete this note?')) {
      await deleteNote(noteId);
    }
  };

  const toggleCollapse = (noteId: string) => {
    setCollapsedNotes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(noteId)) {
        newSet.delete(noteId);
      } else {
        newSet.add(noteId);
      }
      return newSet;
    });
  };

  // Render note item
  const NoteItem = ({ note, showCategory = false }: { note: Note; showCategory?: boolean }) => {
    const isCollapsed = collapsedNotes.has(note.id);
    const date = new Date(note.createdAt).toLocaleDateString(undefined, { 
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
    });

    return (
      <div 
        className={`bg-[var(--bg-card)] rounded-xl p-4 mb-3 shadow-sm border border-[var(--border-color)] hover:-translate-y-0.5 hover:shadow-md transition-all flex items-start group ${
          note.completed ? 'opacity-60' : ''
        }`}
      >
        {/* Checkbox */}
        <button
          onClick={() => toggleComplete(note.id)}
          className={`w-5 h-5 rounded-full border-2 mr-3 flex-shrink-0 flex items-center justify-center transition-all ${
            note.completed 
              ? 'bg-accent border-accent text-white' 
              : 'border-[var(--text-muted)] hover:border-accent'
          }`}
        >
          {note.completed && <span className="text-xs">✓</span>}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0 cursor-pointer" onDoubleClick={() => {/* TODO: Edit */}}>
          <div className="flex items-center gap-2 mb-2">
            {showCategory && (
              <span 
                className="text-xs font-bold uppercase tracking-wide px-2 py-1 rounded-full bg-[var(--border-color)]"
                style={{ color: getCategoryColor(note.category) }}
              >
                {note.category}
              </span>
            )}
            <span className="text-xs text-[var(--text-muted)]">{date}</span>
          </div>
          
          {!isCollapsed && (
            <div 
              className={`text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap ${
                note.completed ? 'line-through text-[var(--text-muted)]' : ''
              }`}
              dangerouslySetInnerHTML={{ __html: parseMarkdown(note.content) }}
            />
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 ml-2">
          <button
            onClick={() => handleDeleteNote(note.id)}
            className="p-1.5 rounded text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
          >
            <TrashIcon />
          </button>
          <button
            onClick={() => toggleCollapse(note.id)}
            className={`p-1.5 rounded text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--border-color)] transition-all ${
              isCollapsed ? '-rotate-90' : ''
            }`}
          >
            <ChevronDownIcon />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col p-5 overflow-hidden transition-colors duration-300">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        {selectedCategory && (
          <button
            onClick={() => setSelectedCategory(null)}
            className="p-1 rounded-full text-[var(--text-secondary)] hover:bg-[var(--border-color)] hover:text-[var(--text-primary)] transition-colors"
          >
            <BackIcon />
          </button>
        )}
        <h2 className="flex-1 text-2xl font-bold text-[var(--text-primary)]">
          {selectedCategory || 'Categories'}
        </h2>
        {!selectedCategory && (
          <button
            onClick={() => setSelectedCategory('All Notes')}
            className="p-1 rounded-full text-[var(--text-secondary)] hover:bg-[var(--border-color)] hover:text-[var(--text-primary)] transition-colors"
            title="View All Notes"
          >
            <ListIcon />
          </button>
        )}
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="h-9 bg-[var(--bg-card)] rounded-xl shadow-sm border border-[var(--border-color)] flex items-center px-3">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search..."
            className="flex-1 h-full bg-transparent border-none px-2 text-sm outline-none text-[var(--text-primary)] placeholder-[var(--text-muted)]"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pr-1">
        {!selectedCategory ? (
          /* Categories Grid */
          <div className="grid grid-cols-2 gap-3">
            {filteredCategories.length === 0 ? (
              <div className="col-span-2 text-center text-[var(--text-muted)] mt-10">
                <p>No notes yet.</p>
              </div>
            ) : (
              filteredCategories.map(({ name, count }) => (
                <div
                  key={name}
                  onClick={() => setSelectedCategory(name)}
                  className="bg-[var(--bg-card)] rounded-xl p-4 shadow-sm border border-[var(--border-color)] cursor-pointer hover:-translate-y-0.5 hover:shadow-md hover:border-accent transition-all h-24 flex flex-col justify-between relative group"
                >
                  <div 
                    className="font-semibold text-base truncate"
                    style={{ color: getCategoryColor(name) }}
                  >
                    {name}
                  </div>
                  <div className="text-xs text-[var(--text-secondary)]">
                    {count} note{count !== 1 ? 's' : ''}
                  </div>
                  
                  {/* Bell subscription toggle */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCategorySubscription(name);
                    }}
                    className={`absolute bottom-2 right-2 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                      subscribedCategories.has(name) 
                        ? 'text-accent' 
                        : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                    }`}
                  >
                    <BellIcon filled={subscribedCategories.has(name)} />
                  </button>
                </div>
              ))
            )}
          </div>
        ) : (
          /* Notes List */
          <div>
            {activeNotes.map(note => (
              <NoteItem key={note.id} note={note} showCategory={selectedCategory === 'All Notes'} />
            ))}
            
            {completedNotes.length > 0 && (
              <>
                <div className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border-color)] pb-1 mb-3 mt-5">
                  Completed
                </div>
                {completedNotes.map(note => (
                  <NoteItem key={note.id} note={note} showCategory={selectedCategory === 'All Notes'} />
                ))}
              </>
            )}

            {filteredNotes.length === 0 && (
              <p className="text-center text-[var(--text-muted)] mt-10">No notes found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
