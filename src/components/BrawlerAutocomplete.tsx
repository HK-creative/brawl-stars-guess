
import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Brawler } from '@/data/brawlers';
import { getPin, DEFAULT_PIN } from '@/lib/image-helpers';
import Image from '@/components/ui/image';

interface BrawlerAutocompleteProps {
  brawlers: Brawler[];
  value: string;
  onChange: (value: string) => void;
  onSelect: (brawler: Brawler) => void;
  onSubmit?: () => void;
  disabled?: boolean;
  disabledBrawlers?: string[]; // Add this to track already guessed brawlers
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
  const [filteredBrawlers, setFilteredBrawlers] = useState<Brawler[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Filter brawlers based on input and exclude already guessed brawlers
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
  }, [value, brawlers, disabledBrawlers]);
  
  // Close dropdown when clicking outside
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
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setIsOpen(true);
  };
  
  const handleSelectBrawler = (brawler: Brawler) => {
    // Don't select already guessed brawlers
    if (disabledBrawlers.includes(brawler.name)) {
      return;
    }
    
    onChange(brawler.name);
    onSelect(brawler);
    setIsOpen(false);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Submit on Enter key if we have a valid selection in the dropdown or exact match
    if (e.key === 'Enter' && onSubmit && value.trim() !== '') {
      e.preventDefault();
      
      // Check if there's an exact match in filtered brawlers
      const exactMatch = filteredBrawlers.find(brawler => 
        brawler.name.toLowerCase() === value.toLowerCase()
      );
      
      // If there's an exact match, select it first and submit immediately
      if (exactMatch) {
        handleSelectBrawler(exactMatch);
        onSubmit();
        return;
      }
      
      // If we have any match at all, select the first one and submit
      else if (filteredBrawlers.length > 0) {
        handleSelectBrawler(filteredBrawlers[0]);
        onSubmit();
        return;
      }
    }
  };
  
  return (
    <div className="relative w-full" ref={wrapperRef}>
      <Input
        ref={inputRef}
        type="text"
        placeholder="Type brawler name..."
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsOpen(true)}
        className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
        disabled={disabled}
      />
      
      {isOpen && filteredBrawlers.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-white/20 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {filteredBrawlers.map((brawler) => {
            const pinPath = getPin(brawler.name);
            const isDisabled = disabledBrawlers.includes(brawler.name);
            
            return (
              <div
                key={brawler.name}
                className={`px-4 py-2 text-sm hover:bg-gray-700 flex items-center ${
                  isDisabled 
                    ? 'cursor-not-allowed opacity-50' 
                    : 'cursor-pointer text-white'
                }`}
                onClick={() => !isDisabled && handleSelectBrawler(brawler)}
              >
                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-gray-700 mr-2">
                  <Image 
                    src={pinPath} 
                    alt={`${brawler.name} pin`}
                    fallbackSrc={DEFAULT_PIN}
                    imageType="pin"
                  />
                </div>
                <span>{brawler.name}</span>
                {isDisabled && (
                  <span className="ml-auto text-xs text-red-400">Already guessed</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BrawlerAutocomplete;
