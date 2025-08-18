import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Brawler, getBrawlerDisplayName, getBrawlerByDisplayName, filterBrawlersByName } from '@/data/brawlers';
import { getPin, DEFAULT_PIN } from '@/lib/image-helpers';
import Image from '@/components/ui/image';
import { cn } from '@/lib/utils';
import { Search, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { t, getLanguage } from '@/lib/i18n';

interface BrawlerAutocompleteProps {
  brawlers: Brawler[];
  value: string;
  onChange: (value: string) => void;
  onSelect: (brawler: Brawler) => void;
  onSubmit?: () => void;
  disabled?: boolean;
  disabledBrawlers?: string[];
}

const BrawlerAutocomplete: React.FC<BrawlerAutocompleteProps> = ({
  brawlers,
  value,
  onChange,
  onSelect,
  onSubmit,
  disabled = false,
  disabledBrawlers = []
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [filteredBrawlers, setFilteredBrawlers] = useState<Brawler[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const submitTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const currentLanguage = getLanguage();
  const { toast } = useToast();

  // Centralized submission handler - prevents all duplicate submissions
  const handleSubmission = useCallback((brawler: Brawler, source: string) => {
    if (disabledBrawlers.includes(brawler.name) || isSubmitting || !onSubmit) return;
    
    // Clear any pending auto-submit
    if (submitTimeoutRef.current) {
      clearTimeout(submitTimeoutRef.current);
      submitTimeoutRef.current = null;
    }
    
    setIsSubmitting(true);
    const displayName = getBrawlerDisplayName(brawler, currentLanguage);
    onChange(displayName);
    onSelect(brawler);
    setIsOpen(false);
    
    // Submit after state updates
    setTimeout(() => {
      onSubmit();
      setIsSubmitting(false);
    }, 0);
  }, [disabledBrawlers, isSubmitting, onSubmit, currentLanguage, onChange, onSelect]);

  const handleSelectBrawler = useCallback((brawler: Brawler) => {
    if (disabledBrawlers.includes(brawler.name)) return;
    const displayName = getBrawlerDisplayName(brawler, currentLanguage);
    onChange(displayName);
    onSelect(brawler);
    setIsOpen(false);
  }, [disabledBrawlers, currentLanguage, onChange, onSelect]);
  
  useEffect(() => {
    if (value.trim() === '') {
      setFilteredBrawlers([]);
      return;
    }
    
    // Use the new filtering function that supports both languages
    const filtered = filterBrawlersByName(value, currentLanguage).filter(brawler => 
      !disabledBrawlers.includes(brawler.name)
    );
    setFilteredBrawlers(filtered);
    setHighlightedIndex(-1);

    // Auto-submit on exact match with proper debouncing
    if (onSubmit && value.trim() && !isSubmitting) {
      const exactMatchBrawler = filtered.find(
        b => {
          const displayName = getBrawlerDisplayName(b, currentLanguage);
          return displayName.toLowerCase() === value.toLowerCase();
        }
      );
      
      if (exactMatchBrawler && !disabledBrawlers.includes(exactMatchBrawler.name)) {
        // Clear any existing timeout
        if (submitTimeoutRef.current) {
          clearTimeout(submitTimeoutRef.current);
        }
        
        // Debounced auto-submit to prevent rapid firing
        submitTimeoutRef.current = setTimeout(() => {
          handleSubmission(exactMatchBrawler, 'auto-submit');
        }, 100);
      }
    }
  }, [value, brawlers, disabledBrawlers, currentLanguage, onSubmit, handleSubmission, isSubmitting]);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [wrapperRef]);

  useEffect(() => {
    if (value === '' && inputRef.current && !disabled) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 10);
    }
  }, [value, disabled]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setIsOpen(true);
  };

  const handleClearInput = () => {
    onChange('');
    setIsOpen(false);
    inputRef.current?.focus();
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      const currentInputText = value.trim();
      if (!currentInputText) { 
        // If input is empty and Enter is pressed
        return;
      }

      // Check if already guessed by looking at both English and Hebrew names
      const matchedBrawler = getBrawlerByDisplayName(currentInputText);
      if (matchedBrawler && disabledBrawlers.includes(matchedBrawler.name)) {
        toast({
          id: String(Date.now()),
          title: "Already Guessed",
          description: `You've already guessed this brawler!`,
          variant: "destructive"
        });
        onChange('');
        setIsOpen(false);
        return;
      }

      // If there's highlighted item, use that and submit immediately
      if (highlightedIndex >= 0 && highlightedIndex < filteredBrawlers.length) {
        const selected = filteredBrawlers[highlightedIndex];
        if (!disabledBrawlers.includes(selected.name)) {
          handleSubmission(selected, 'enter-highlighted');
          return;
        }
      }

      // If current input matches a brawler exactly, use that and submit immediately
      const exactMatchBrawler = filteredBrawlers.find(
        b => {
          const displayName = getBrawlerDisplayName(b, currentLanguage);
          return displayName.toLowerCase() === value.toLowerCase() && !disabledBrawlers.includes(b.name);
        }
      );
      if (exactMatchBrawler) {
        handleSubmission(exactMatchBrawler, 'enter-exact');
        return;
      }
      
      // If there are filtered suggestions but no exact match, use first available and submit immediately
      if (filteredBrawlers.length > 0 && currentInputText) {
        const firstAvailableBrawler = filteredBrawlers.find(b => !disabledBrawlers.includes(b.name));
        if (firstAvailableBrawler) {
          handleSubmission(firstAvailableBrawler, 'enter-first');
          return;
        }
      }
      
      // If we have a submission handler and valid text but no matches, clear input
      if (onSubmit && currentInputText) {
        onChange('');
        setIsOpen(false);
      }
      return;
    }
    
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredBrawlers.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const highlightedElement = listRef.current.children[highlightedIndex] as HTMLElement;
      if (highlightedElement) {
        highlightedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex]);

  return (
    <div ref={wrapperRef} className="relative group w-full max-w-[320px] mx-auto sm:max-w-full">
      <div className="relative w-full">
        <div 
          className="absolute left-0 top-0 bottom-0 flex items-center justify-center w-12 bg-[#FFC107] rounded-l-2xl z-10 cursor-pointer hover:bg-[#FFD700] transition-colors duration-200"
          onClick={() => {
            if (value && onSubmit) {
              const exactMatchBrawler = filteredBrawlers.find(
                b => {
                  const displayName = getBrawlerDisplayName(b, currentLanguage);
                  return displayName.toLowerCase() === value.toLowerCase() && !disabledBrawlers?.includes(b.name);
                }
              );
              if (exactMatchBrawler) {
                handleSubmission(exactMatchBrawler, 'search-button-exact');
              } else if (filteredBrawlers.length > 0) {
                const firstAvailableBrawler = filteredBrawlers.find(b => !disabledBrawlers?.includes(b.name));
                if (firstAvailableBrawler) {
                  handleSubmission(firstAvailableBrawler, 'search-button-first');
                }
              }
            }
          }}
        >
          <Search className="h-5 w-5 text-black" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={value}
          placeholder={t('search.brawlers')}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          className={cn(
            "w-full pl-14 pr-12 py-4 h-12 text-base sm:text-lg font-medium",
            "bg-[#1A1A1A] text-white",
            "border-[#FFC107] border-2 rounded-2xl",
            "placeholder:text-gray-400",
            "transition-all duration-300 ease-in-out",
            "focus:ring-2 focus:ring-[#FFC107]/50 focus:border-[#FFC107] focus:outline-none",
            "hover:bg-[#242424]",
            "group-hover:shadow-lg group-hover:shadow-[#FFC107]/10",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          disabled={disabled}
          aria-expanded={isOpen}
          aria-controls="brawler-list"
          aria-activedescendant={highlightedIndex >= 0 && filteredBrawlers[highlightedIndex] ? `brawler-${filteredBrawlers[highlightedIndex].name}` : undefined}
        />

        {value && (
          <button
            onClick={handleClearInput}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
      
      {isOpen && filteredBrawlers.length > 0 && (
        <div
          ref={listRef}
          id="brawler-list"
          role="listbox"
          className={cn(
            "absolute z-[9999] w-full mt-2",
            "bg-[#1A1A1A] backdrop-blur-sm",
            "border-2 border-[#FFC107] rounded-2xl shadow-2xl",
            "max-h-[300px] overflow-y-auto",
            "scrollbar-thin scrollbar-thumb-[#FFC107]/30 scrollbar-track-transparent"
          )}
          style={{ zIndex: 9999 }}
        >
          {filteredBrawlers.map((brawler, index) => {
            const pinPath = getPin(brawler.name);
            const isDisabled = disabledBrawlers.includes(brawler.name);
            const isHighlighted = index === highlightedIndex;
            const displayName = getBrawlerDisplayName(brawler, currentLanguage);
            
            return (
              <div
                key={brawler.name}
                id={`brawler-${brawler.name}`}
                role="option"
                aria-selected={isHighlighted}
                className={cn(
                  "px-4 py-3 text-base flex items-center gap-3",
                  "transition-all duration-200",
                  isDisabled ? [
                    "cursor-not-allowed opacity-50",
                    "bg-gray-800/30"
                  ] : [
                    "cursor-pointer text-white",
                    "hover:bg-[#FFC107]/10",
                    isHighlighted && "bg-[#FFC107]/10"
                  ]
                )}
                onClick={() => !isDisabled && handleSubmission(brawler, 'dropdown-click')}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-[#FFC107]/50 bg-black">
                  <Image 
                    src={pinPath} 
                    alt={displayName}
                    fallbackSrc={DEFAULT_PIN}
                    imageType="pin"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="font-medium">{displayName}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BrawlerAutocomplete;
