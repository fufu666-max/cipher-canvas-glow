import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

interface DiaryState {
  userPreferences: {
    theme: 'light' | 'dark';
    language: string;
    notifications: boolean;
  };
  cachedEntries: {
    [entryId: string]: {
      content?: string;
      metadata: any;
      lastViewed: number;
    };
  };
  draftContent: string;
  searchHistory: string[];
  favoriteEntries: string[];
}

interface DiaryStateContextType {
  state: DiaryState;
  updatePreferences: (preferences: Partial<DiaryState['userPreferences']>) => void;
  cacheEntry: (entryId: string, data: any) => void;
  saveDraft: (content: string) => void;
  addToSearchHistory: (query: string) => void;
  toggleFavorite: (entryId: string) => void;
  clearCache: () => void;
  resetState: () => void; // This will be the buggy function
}

const DiaryStateContext = createContext<DiaryStateContextType | undefined>(undefined);

const initialState: DiaryState = {
  userPreferences: {
    theme: 'light',
    language: 'en',
    notifications: true,
  },
  cachedEntries: {},
  draftContent: '',
  searchHistory: [],
  favoriteEntries: [],
};

export const DiaryStateProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<DiaryState>(initialState);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('diaryState');
    if (saved) {
      try {
        setState(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load diary state:', error);
      }
    }
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('diaryState', JSON.stringify(state));
  }, [state]);

  const updatePreferences = (preferences: Partial<DiaryState['userPreferences']>) => {
    setState(prev => ({
      ...prev,
      userPreferences: { ...prev.userPreferences, ...preferences }
    }));
  };

  const cacheEntry = (entryId: string, data: any) => {
    setState(prev => ({
      ...prev,
      cachedEntries: {
        ...prev.cachedEntries,
        [entryId]: {
          ...data,
          lastViewed: Date.now(),
        }
      }
    }));
  };

  const saveDraft = (content: string) => {
    setState(prev => ({
      ...prev,
      draftContent: content
    }));
  };

  const addToSearchHistory = (query: string) => {
    setState(prev => ({
      ...prev,
      searchHistory: [...new Set([query, ...prev.searchHistory.slice(0, 9)])]
    }));
  };

  const toggleFavorite = (entryId: string) => {
    setState(prev => ({
      ...prev,
      favoriteEntries: prev.favoriteEntries.includes(entryId)
        ? prev.favoriteEntries.filter(id => id !== entryId)
        : [...prev.favoriteEntries, entryId]
    }));
  };

  const clearCache = () => {
    setState(prev => ({
      ...prev,
      cachedEntries: {}
    }));
  };

  const resetState = () => {
    // FIXED: Proper state reset that preserves user preferences but clears temporary data
    // This safely resets the application state without losing user settings
    const resetState: DiaryState = {
      ...initialState,
      userPreferences: state.userPreferences, // Preserve user preferences
    };

    // FIXED: Only remove diary-specific localStorage, preserve other app data
    localStorage.removeItem('diaryState');

    setState(resetState);
  };

  const value: DiaryStateContextType = {
    state,
    updatePreferences,
    cacheEntry,
    saveDraft,
    addToSearchHistory,
    toggleFavorite,
    clearCache,
    resetState,
  };

  return (
    <DiaryStateContext.Provider value={value}>
      {children}
    </DiaryStateContext.Provider>
  );
};

export const useDiaryState = () => {
  const context = useContext(DiaryStateContext);
  if (context === undefined) {
    throw new Error('useDiaryState must be used within a DiaryStateProvider');
  }
  return context;
};
