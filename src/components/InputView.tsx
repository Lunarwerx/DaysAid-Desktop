import { useState, useRef, useEffect } from 'react';
import { useNotes } from '@/context/NotesContext';
import { platform } from '@/lib/platform';

export default function InputView() {
  const { notes, addNote, updateNote } = useNotes();
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [categoryError, setCategoryError] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const categoryInputRef = useRef<HTMLInputElement>(null);

  // Focus textarea on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Get unique categories for suggestions
  const categories = [...new Set(notes.map(n => n.category))];
  const filteredCategories = categories.filter(c => 
    c.toLowerCase().includes(category.toLowerCase())
  );

  const handleSubmit = async () => {
    if (!content.trim()) {
      textareaRef.current?.focus();
      return;
    }

    if (!category.trim()) {
      setCategoryError(true);
      categoryInputRef.current?.focus();
      return;
    }

    let success: boolean;
    
    if (editingNoteId) {
      success = await updateNote(editingNoteId, {
        content: content.trim(),
        category: category.trim()
      });
    } else {
      success = await addNote(content.trim(), category.trim());
    }

    if (success) {
      setContent('');
      setCategory('');
      setEditingNoteId(null);
      
      // Hide window on desktop after creating note
      if (!editingNoteId && platform.isElectron && window.electron) {
        // @ts-ignore - electron API
        window.electron.hideWindow?.();
      }
    }
  };

  const handleCancel = () => {
    setContent('');
    setCategory('');
    setEditingNoteId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleSubmit();
    }
    if (e.key === 'Escape') {
      if (editingNoteId) {
        handleCancel();
      } else if (platform.isElectron && window.electron) {
        // @ts-ignore - electron API
        window.electron.hideWindow?.();
      }
    }
  };

  const selectCategory = (cat: string) => {
    setCategory(cat);
    setShowSuggestions(false);
    setCategoryError(false);
  };

  return (
    <div className="flex-1 flex flex-col p-5 transition-colors duration-300" onKeyDown={handleKeyDown}>
      {/* Text Input Area */}
      <div className="flex-1 bg-[var(--bg-card)]/60 rounded-xl p-4 shadow-inner border border-[var(--border-color)] mb-5 flex flex-col transition-colors duration-300">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          className="flex-1 bg-transparent border-none resize-none text-lg leading-relaxed text-[var(--text-primary)] placeholder-[var(--text-muted)] min-h-[100px] outline-none"
        />
      </div>

      {/* Action Bar */}
      <div className="flex gap-3 h-11">
        {/* Category Input */}
        <div className="flex-1 relative">
          <div className={`h-full bg-[var(--bg-card)] rounded-xl shadow-sm border transition-all ${
            categoryError ? 'border-red-400 ring-2 ring-red-200 dark:ring-red-900 animate-shake' : 'border-[var(--border-color)]'
          }`}>
            <input
              ref={categoryInputRef}
              type="text"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setCategoryError(false);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="Category"
              className="w-full h-full bg-transparent border-none px-4 text-sm text-[var(--text-primary)] font-medium outline-none placeholder-[var(--text-muted)]"
            />
          </div>

          {/* Suggestions Dropdown */}
          {showSuggestions && filteredCategories.length > 0 && (
            <div className="absolute bottom-full left-0 w-full bg-[var(--bg-card)] rounded-xl shadow-lg border border-[var(--border-color)] max-h-[150px] overflow-y-auto mb-2 z-10">
              {filteredCategories.map(cat => (
                <div
                  key={cat}
                  onClick={() => selectCategory(cat)}
                  className="px-4 py-2.5 cursor-pointer text-sm text-[var(--text-primary)] hover:bg-[var(--border-color)] transition-colors"
                >
                  {cat}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cancel Button (only when editing) */}
        {editingNoteId && (
          <button
            onClick={handleCancel}
            className="px-5 bg-transparent text-[var(--text-secondary)] border border-[var(--border-color)] rounded-xl text-sm font-semibold hover:bg-[var(--border-color)] hover:text-[var(--text-primary)] transition-all"
          >
            Cancel
          </button>
        )}

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          className="px-6 bg-accent text-white rounded-xl text-sm font-semibold shadow-sm hover:bg-accent-hover hover:-translate-y-0.5 hover:shadow-md hover:shadow-accent/30 active:translate-y-0 transition-all"
        >
          {editingNoteId ? 'Save' : 'Create'}
        </button>
      </div>
    </div>
  );
}
