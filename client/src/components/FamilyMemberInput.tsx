import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Contract } from '@/types/contract';

interface FamilyMemberInputProps {
  value: string;
  onChange: (value: string) => void;
  existingContracts: Contract[];
  placeholder?: string;
}

export const FamilyMemberInput: React.FC<FamilyMemberInputProps> = ({
  value,
  onChange,
  existingContracts,
  placeholder = "e.g., Alex, Sarah, Mike, Emma, Dad"
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Extract unique family members from existing contracts
  const existingFamilyMembers = React.useMemo(() => {
    const members = new Set<string>();
    existingContracts.forEach(contract => {
      if (contract.familyMember?.trim()) {
        members.add(contract.familyMember.trim());
      }
    });
    return Array.from(members).sort();
  }, [existingContracts]);

  // Filter suggestions based on input value
  useEffect(() => {
    if (!value.trim()) {
      setFilteredSuggestions(existingFamilyMembers);
    } else {
      const filtered = existingFamilyMembers.filter(member =>
        member.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredSuggestions(filtered);
    }
  }, [value, existingFamilyMembers]);

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
        className="pr-8"
      />
      
      {/* Suggestions dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-48 overflow-y-auto"
        >
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 focus:outline-none"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
      
      {/* No suggestions message */}
      {showSuggestions && filteredSuggestions.length === 0 && value.trim() && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg px-3 py-2"
        >
          <span className="text-sm text-gray-500 dark:text-gray-400">
            No existing family members match "{value}"
          </span>
        </div>
      )}
    </div>
  );
};
