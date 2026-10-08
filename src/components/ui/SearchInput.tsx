import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  X, 
  SlidersHorizontal, 
  ArrowRight, 
  Sparkles, 
  Building2, 
  FolderOpen, 
  Tag, 
  FileText,
  Loader2 
} from 'lucide-react';
import { SearchSuggestionItem } from '../../utils/searchEngine';

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: (value: string) => void;
  onSelectSuggestion?: (suggestion: SearchSuggestionItem) => void;
  suggestions?: SearchSuggestionItem[];
  placeholder?: string;
  size?: 'md' | 'lg';
  showSubmitButton?: boolean;
  submitButtonText?: string;
  showFiltersButton?: boolean;
  onOpenFilters?: () => void;
  hasActiveFilters?: boolean;
  isLoading?: boolean;
  className?: string;
  id?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  onSubmit,
  onSelectSuggestion,
  suggestions = [],
  placeholder = 'Search grants, fellowships, scholarships, keywords...',
  size = 'md',
  showSubmitButton = false,
  submitButtonText = 'Search',
  showFiltersButton = false,
  onOpenFilters,
  hasActiveFilters = false,
  isLoading = false,
  className = '',
  id = 'fundecho-main-search',
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowDropdown(false);
    if (onSubmit) {
      onSubmit(value);
    }
  };

  const handleClear = () => {
    onChange('');
    setHighlightedIndex(-1);
    inputRef.current?.focus();
    if (onSubmit) {
      onSubmit('');
    }
  };

  const handleSelectSuggestion = (item: SearchSuggestionItem) => {
    setShowDropdown(false);
    if (onSelectSuggestion) {
      onSelectSuggestion(item);
    } else {
      onChange(item.queryToApply);
      if (onSubmit) onSubmit(item.queryToApply);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
        e.preventDefault();
        handleSelectSuggestion(suggestions[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
      setHighlightedIndex(-1);
    }
  };

  const isLarge = size === 'lg';

  const getSuggestionIcon = (type: SearchSuggestionItem['type']) => {
    switch (type) {
      case 'category':
        return <FolderOpen className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />;
      case 'provider':
        return <Building2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />;
      case 'opportunity':
        return <FileText className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />;
      case 'location':
        return <Tag className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />;
      case 'popular':
      default:
        return <Sparkles className="w-3.5 h-3.5 text-amber-500" />;
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-full min-w-0">
      <form
        id={id}
        onSubmit={handleSubmit}
        className={`relative flex items-center w-full max-w-full min-w-0 transition-all duration-200 bg-white dark:bg-slate-900 rounded-2xl border ${
          isFocused
            ? 'border-indigo-600 dark:border-indigo-500 ring-4 ring-indigo-500/10 dark:ring-indigo-500/20 shadow-lg shadow-indigo-500/10'
            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-md shadow-slate-200/50 dark:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3)]'
        } ${className}`}
      >
        <div className={`flex items-center justify-center shrink-0 text-slate-400 dark:text-slate-500 pl-3.5 sm:pl-4 ${isLarge ? 'sm:pl-5' : ''}`}>
          {isLoading ? (
            <Loader2 className={`animate-spin text-indigo-600 dark:text-indigo-400 ${isLarge ? 'w-5 h-5' : 'w-4 h-4'}`} />
          ) : (
            <Search className={isLarge ? 'w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 dark:text-indigo-400' : 'w-4 h-4 text-slate-400 dark:text-slate-500'} />
          )}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setShowDropdown(true);
            setHighlightedIndex(-1);
          }}
          onFocus={() => {
            setIsFocused(true);
            setShowDropdown(true);
          }}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-expanded={showDropdown && suggestions.length > 0}
          aria-autocomplete="list"
          className={`w-full min-w-0 flex-1 bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 font-normal focus:outline-none ${
            isLarge ? 'py-3 sm:py-4 px-2.5 sm:px-3 text-sm sm:text-base lg:text-lg' : 'py-2.5 px-2.5 sm:px-3 text-sm'
          }`}
        />

        {value && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear search input"
            className="p-1.5 mr-1 shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {showFiltersButton && (
          <button
            type="button"
            onClick={onOpenFilters}
            className={`shrink-0 flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 mr-1.5 sm:mr-2 text-xs font-medium rounded-xl transition-colors border ${
              hasActiveFilters
                ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Filters</span>
            {hasActiveFilters && <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400"></span>}
          </button>
        )}

        {showSubmitButton && (
          <button
            type="submit"
            className={`shrink-0 flex items-center justify-center gap-1.5 font-semibold text-white bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 active:bg-indigo-800 transition-colors rounded-xl shadow-md shadow-indigo-600/20 ${
              isLarge
                ? 'px-3.5 sm:px-6 py-2.5 sm:py-3 mr-1.5 sm:mr-2 text-xs sm:text-sm md:text-base font-semibold'
                : 'px-3 sm:px-3.5 py-1.5 mr-1 sm:mr-1.5 text-xs font-medium'
            }`}
          >
            <span className="hidden xs:inline sm:inline">{submitButtonText}</span>
            <span className="xs:hidden sm:hidden">Search</span>
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        )}
      </form>

      {/* Live Suggestions Dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl dark:shadow-[0_20px_35px_-5px_rgba(0,0,0,0.5)] z-40 overflow-hidden py-2 animate-in fade-in-50 duration-150">
          <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 mb-1">
            <span>{value.trim() ? 'Matching Suggestions' : 'Suggested Searches & Natural Prompts'}</span>
            <span className="text-[10px] lowercase text-slate-400 font-normal">use ↑↓ and enter</span>
          </div>

          <div className="max-h-72 overflow-y-auto">
            {suggestions.map((item, idx) => {
              const isHighlighted = highlightedIndex === idx;
              return (
                <button
                  key={item.id}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault(); // prevent blur
                    handleSelectSuggestion(item);
                  }}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between gap-3 transition-colors ${
                    isHighlighted
                      ? 'bg-indigo-50/80 dark:bg-indigo-950/60 text-indigo-900 dark:text-white'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-1 rounded-md bg-slate-100 dark:bg-slate-800 shrink-0">
                      {getSuggestionIcon(item.type)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-semibold truncate text-slate-900 dark:text-white">
                        {item.title}
                      </p>
                      {item.subtitle && (
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                          {item.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  <ArrowRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 shrink-0" />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
