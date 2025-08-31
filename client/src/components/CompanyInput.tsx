import React, { useState, useEffect, useRef } from 'react';
import { Contract } from '@/types/contract';
import { Input } from '@/components/ui/input';

interface CompanyInputProps {
  value: string;
  onChange: (value: string) => void;
  existingContracts: Contract[];
  placeholder?: string;
  required?: boolean;
}

export const CompanyInput: React.FC<CompanyInputProps> = ({
  value,
  onChange,
  existingContracts,
  placeholder = "e.g., Netflix Inc., Amazon Web Services, Spotify",
  required = false
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Extract unique companies from existing contracts
  const existingCompanies = React.useMemo(() => {
    const companies = new Set<string>();
    if (existingContracts && Array.isArray(existingContracts)) {
      existingContracts.forEach(contract => {
        if (contract?.company?.trim()) {
          companies.add(contract.company.trim());
        }
      });
    }
    return Array.from(companies).sort();
  }, [existingContracts]);

  // Filter suggestions based on input value
  useEffect(() => {
    if (!value || !value.trim()) {
      setFilteredSuggestions(existingCompanies);
    } else {
      const filtered = existingCompanies.filter(company =>
        company.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredSuggestions(filtered);
    }
  }, [value, existingCompanies]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setShowSuggestions(true);
  };

  // Handle suggestion selection
  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  // Handle input focus
  const handleInputFocus = () => {
    setShowSuggestions(true);
  };

  // Handle input blur (with delay to allow clicking suggestions)
  const handleInputBlur = () => {
    setTimeout(() => setShowSuggestions(false), 150);
  };

  // Handle escape key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        value={value}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        required={required}
        className="w-full"
      />
      
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {filteredSuggestions.map((company, index) => (
            <div
              key={index}
              className="px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-sm border-b border-gray-100 dark:border-gray-700 last:border-b-0"
              onClick={() => handleSuggestionClick(company)}
            >
              {company}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
