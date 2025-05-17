import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Brawler } from '@/data/brawlers';
import { getPin, DEFAULT_PIN } from '@/lib/image-helpers';
import Image from '@/components/ui/image';
import { cn } from '@/lib/utils';
import { Search, X } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

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
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (value.trim() === '') {
      setFilteredBrawlers([]);
      return;
    }
    
    const filtered = brawlers.filter(brawler => 
      brawler.name.toLowerCase().includes(value.toLowerCase()) && 
      !disabledBrawlers.includes(brawler.name)
    );
    setFilteredBrawlers(filtered);
    setHighlightedIndex(-1);

    if (onSubmit) {
      const exactMatch = filtered.find(brawler => 
        brawler.name.toLowerCase() === value.toLowerCase()
      );
      
      if (exactMatch && value.toLowerCase() === exactMatch.name.toLowerCase()) {
        onSelect(exactMatch);
      }
    }
  }, [value, brawlers, disabledBrawlers, onSelect, onSubmit]);
  
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
  
  const handleSelectBrawler = (brawler: Brawler) => {
    if (disabledBrawlers.includes(brawler.name)) return;
    onChange(brawler.name);
    onSelect(brawler);
    setIsOpen(false);
  };
  
  const handleSelectBrawlerWithSubmit = (brawler: Brawler) => {
    if (disabledBrawlers.includes(brawler.name)) return;
    handleSelectBrawler(brawler);
    if (onSubmit) {
      setTimeout(() => {
        onSubmit();
      }, 10);
    }
  };

  const handleClearInput = () => {
    onChange('');
    setIsOpen(false);
    inputRef.current?.focus();
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      const exactMatchName = value.toLowerCase();
      const isAlreadyGuessed = disabledBrawlers.some(name => name.toLowerCase() === exactMatchName);
      
      if (isAlreadyGuessed && filteredBrawlers.some(b => b.name.toLowerCase() === exactMatchName)) {
        toast({
          title: "Already Guessed",
          description: `You've already guessed this brawler!`,
          variant: "destructive"
        });
        onChange('');
        setIsOpen(false);
        return;
      }

      if (highlightedIndex >= 0 && highlightedIndex < filteredBrawlers.length) {
        const selected = filteredBrawlers[highlightedIndex];
        if (!disabledBrawlers.includes(selected.name)) {
          handleSelectBrawlerWithSubmit(selected);
          return;
        }
      }

      const exactMatchBrawler = filteredBrawlers.find(
        b => b.name.toLowerCase() === value.toLowerCase() && !disabledBrawlers.includes(b.name)
      );
      if (exactMatchBrawler) {
        handleSelectBrawlerWithSubmit(exactMatchBrawler);
        return;
      }
      
      if (filteredBrawlers.length > 0) {
        const firstAvailableBrawler = filteredBrawlers.find(b => !disabledBrawlers.includes(b.name));
        if (firstAvailableBrawler) {
          handleSelectBrawlerWithSubmit(firstAvailableBrawler);
          return;
        }
      }
      
      onChange('');
      setIsOpen(false);
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
    <div className="relative w-full" ref={wrapperRef}>
      <div className="relative group">
        <motion.div 
          className="absolute left-0 top-0 bottom-0 flex items-center justify-center w-12 bg-[#FFC107] rounded-l-2xl z-10 cursor-pointer hover:bg-[#FFD700]"
          initial={{ opacity: 0.8 }}
          animate={{ opacity: 1 }}
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.2 }}
          onClick={() => {
            if (value && onSubmit) {
              const exactMatchBrawler = brawlers.find(
                b => b.name.toLowerCase() === value.toLowerCase() && !disabledBrawlers?.includes(b.name)
              );
              if (exactMatchBrawler) {
                handleSelectBrawlerWithSubmit(exactMatchBrawler);
              } else if (filteredBrawlers.length > 0) {
                const firstAvailableBrawler = filteredBrawlers.find(b => !disabledBrawlers?.includes(b.name));
                if (firstAvailableBrawler) {
                  handleSelectBrawlerWithSubmit(firstAvailableBrawler);
                }
              }
            }
          }}
        >
          <Search className="h-5 w-5 text-black" />
        </motion.div>
        
        <Input
          ref={inputRef}
          type="text"
          placeholder="Type brawler name..."
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          className={cn(
            "pl-14 pr-12 py-4 h-12 text-lg font-medium",
            "bg-[#1A1A1A] text-white",
            "border-[#FFC107] border-2 rounded-2xl",
            "placeholder:text-gray-400",
            "transition-all duration-300 ease-in-out",
            "focus:ring-2 focus:ring-[#FFC107]/50 focus:border-[#FFC107]",
            "hover:bg-[#242424]",
            "group-hover:shadow-lg group-hover:shadow-[#FFC107]/10",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          disabled={disabled}
          aria-expanded={isOpen}
          aria-controls="brawler-list"
          aria-activedescendant={highlightedIndex >= 0 ? `brawler-${filteredBrawlers[highlightedIndex].name}` : undefined}
        />

        {value && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.1 }}
            onClick={handleClearInput}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
          >
            <X className="h-5 w-5" />
          </motion.button>
        )}
      </div>
      
      <AnimatePresence>
      {isOpen && filteredBrawlers.length > 0 && (
          <motion.div
          ref={listRef}
          id="brawler-list"
          role="listbox"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          className={cn(
              "absolute z-20 w-full mt-2",
              "bg-[#1A1A1A] backdrop-blur-sm",
              "border-2 border-[#FFC107] rounded-2xl shadow-2xl",
              "max-h-[300px] overflow-y-auto",
              "scrollbar-thin scrollbar-thumb-[#FFC107]/30 scrollbar-track-transparent"
          )}
        >
          {filteredBrawlers.map((brawler, index) => {
            const pinPath = getPin(brawler.name);
            const isDisabled = disabledBrawlers.includes(brawler.name);
            const isHighlighted = index === highlightedIndex;
            
            return (
                <motion.div
                key={brawler.name}
                id={`brawler-${brawler.name}`}
                role="option"
                aria-selected={isHighlighted}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.03 }}
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
                onClick={() => !isDisabled && handleSelectBrawlerWithSubmit(brawler)}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                  <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-[#FFC107]/50 bg-black">
                  <Image 
                    src={pinPath} 
                      alt={brawler.name}
                    fallbackSrc={DEFAULT_PIN}
                    imageType="pin"
                      className="w-full h-full object-cover"
                  />
                </div>
                  <span className="font-medium">{brawler.name}</span>
                </motion.div>
            );
          })}
          </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
};

export default BrawlerAutocomplete;
