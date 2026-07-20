'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';

export interface OptionItem {
  [key: string]: any;
}

interface SearchableSelectProps {
  value: string | number | null;
  onChange: (val: string | number | null, item?: OptionItem | null) => void;
  options: OptionItem[];
  labelKey?: string;
  valueKey?: string;
  placeholder?: string;
  displayFormat?: (item: OptionItem) => string;
  className?: string;
  disabled?: boolean;
}

export function SearchableSelect({
  value,
  onChange,
  options,
  labelKey = 'nama',
  valueKey = 'kode',
  placeholder = 'Pilih klasifikasi...',
  displayFormat,
  className = '',
  disabled = false,
}: SearchableSelectProps) {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedItem = useMemo(() => {
    return options.find((opt) => opt[valueKey] === value) || null;
  }, [options, valueKey, value]);

  const getDisplayValue = (item: OptionItem | null) => {
    if (!item) return '';
    if (displayFormat) return displayFormat(item);
    return item[labelKey] || item.uraian || item.deskripsi || item[valueKey] || '';
  };

  const filteredOptions = useMemo(() => {
    if (!search.trim()) return options;
    const q = search.toLowerCase();
    return options.filter((opt) => {
      const code = opt[valueKey] ? String(opt[valueKey]).toLowerCase() : '';
      const descVal = opt[labelKey] || opt.uraian || opt.deskripsi || '';
      const desc = String(descVal).toLowerCase();
      return code.includes(q) || desc.includes(q);
    });
  }, [options, search, valueKey, labelKey]);

  const toggleDropdown = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSearch('');
      setHighlightedIndex(-1);
    }
  };

  const selectItem = (item: OptionItem) => {
    onChange(item[valueKey], item);
    setSearch('');
    setIsOpen(false);
  };

  const clearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    onChange(null, null);
    setSearch('');
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        return;
      }
      const max = filteredOptions.length - 1;
      setHighlightedIndex((prev) => (prev < max ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        return;
      }
      const max = filteredOptions.length - 1;
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : max));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (isOpen && highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
        selectItem(filteredOptions[highlightedIndex]);
      } else {
        setIsOpen(true);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div
        onClick={toggleDropdown}
        className={`flex items-center justify-between border rounded-xl bg-white dark:bg-gray-800 overflow-hidden cursor-pointer transition-all ${
          disabled ? 'opacity-60 cursor-not-allowed bg-gray-100 dark:bg-gray-900' : ''
        } ${
          isOpen
            ? 'border-red-500 ring-2 ring-red-100 dark:ring-red-900/30'
            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
        }`}
      >
        <input
          type="text"
          value={search}
          disabled={disabled}
          placeholder={selectedItem ? '' : placeholder}
          onChange={(e) => {
            setSearch(e.target.value);
            if (!isOpen) setIsOpen(true);
            setHighlightedIndex(-1);
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (!disabled) setIsOpen(true);
          }}
          onFocus={() => {
            if (!disabled) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          className="flex-1 py-2.5 px-3.5 bg-transparent text-sm text-gray-900 dark:text-white border-none focus:ring-0 focus:outline-none placeholder-gray-400 dark:placeholder-gray-500 disabled:cursor-not-allowed"
        />

        {/* Selected display overlay when input is empty */}
        {selectedItem && !search && (
          <div className="absolute left-3.5 right-10 pointer-events-none text-sm text-gray-900 dark:text-white truncate font-medium flex items-center gap-2">
            <span className="font-mono font-bold text-red-600 dark:text-red-400">[{selectedItem[valueKey]}]</span>
            <span>{getDisplayValue(selectedItem)}</span>
          </div>
        )}

        <div className="flex items-center px-3 gap-1.5 flex-shrink-0">
          {(selectedItem || search) && !disabled && (
            <button
              type="button"
              onClick={clearSelection}
              className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30"
              title="Hapus pilihan"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-red-500' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && !disabled && (
        <div
          className="absolute z-50 mt-1.5 w-full bg-white dark:bg-gray-800 shadow-2xl rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-fade-in"
          style={{ maxHeight: '240px', overflowY: 'auto' }}
        >
          <ul role="listbox" className="py-1 divide-y divide-gray-50 dark:divide-gray-700/50">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((item, index) => {
                const isSelected = selectedItem && item[valueKey] === selectedItem[valueKey];
                const isHighlighted = highlightedIndex === index;
                return (
                  <li
                    key={`${item[valueKey]}-${index}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      selectItem(item);
                    }}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`px-4 py-2.5 cursor-pointer text-xs transition-colors flex items-center justify-between ${
                      isHighlighted
                        ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                        : isSelected
                        ? 'bg-red-50/50 dark:bg-red-900/10 text-red-600 dark:text-red-400 font-semibold'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 overflow-hidden mr-2">
                      <span className="font-mono font-bold text-red-600 dark:text-red-400 flex-shrink-0">
                        [{item[valueKey]}]
                      </span>
                      <span className="truncate">{getDisplayValue(item)}</span>
                    </div>
                    {isSelected && (
                      <svg
                        className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </li>
                );
              })
            ) : (
              <li className="px-4 py-6 text-xs text-gray-400 dark:text-gray-500 text-center">
                Tidak ada hasil untuk &quot;{search}&quot;
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
