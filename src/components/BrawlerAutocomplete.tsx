
import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Brawler } from '@/data/brawlers';
import { getPin } from '@/lib/image-helpers';
import Image from '../components/ui/image';

interface BrawlerAutocompleteProps {
  brawlers: Brawler[];
  value: string;
  onChange: (value: string) => void;
  onSelect: (brawler: Brawler) => void;
  disabled?: boolean;
}

const BrawlerAutocomplete: React.FC<BrawlerAutocompleteProps> = ({
  brawlers,
  value,
  onChange,
  onSelect,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredBrawlers, setFilteredBrawlers] = useState<Brawler[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);
  
  // Filter brawlers based on input
  useEffect(() => {
    if (value.trim() === '') {
      setFilteredBrawlers([]);
      return;
    }
    
    const filtered = brawlers.filter(brawler => 
      brawler.name.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredBrawlers(filtered);
  }, [value, brawlers]);
  
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
    onChange(brawler.name);
    onSelect(brawler);
    setIsOpen(false);
  };
  
  return (
    <div className="relative w-full" ref={wrapperRef}>
      <Input
        type="text"
        placeholder="Type brawler name..."
        value={value}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
        disabled={disabled}
      />
      
      {isOpen && filteredBrawlers.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-white/20 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {filteredBrawlers.map((brawler) => (
            <div
              key={brawler.name}
              className="px-4 py-2 text-sm text-white hover:bg-gray-700 cursor-pointer flex items-center"
              onClick={() => handleSelectBrawler(brawler)}
            >
              <Image 
                src={getPin(brawler.name)} 
                alt={brawler.name}
                className="w-6 h-6 rounded-full mr-2"
                fallbackSrc="/placeholder.svg"
              />
              <span>{brawler.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BrawlerAutocomplete;
