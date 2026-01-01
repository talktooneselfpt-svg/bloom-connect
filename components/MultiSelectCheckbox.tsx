'use client';

import React from 'react';

interface MultiSelectCheckboxProps {
  label: string;
  options: readonly string[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  groupLabel?: string;
  searchable?: boolean;
}

export default function MultiSelectCheckbox({
  label,
  options,
  selectedValues,
  onChange,
  groupLabel,
  searchable = false,
}: MultiSelectCheckboxProps) {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredOptions = searchable
    ? options.filter(option => option.toLowerCase().includes(searchTerm.toLowerCase()))
    : options;

  const handleToggle = (value: string) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter(v => v !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  const handleSelectAll = () => {
    onChange([...options]);
  };

  const handleClearAll = () => {
    onChange([]);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          {label} {groupLabel && <span className="text-xs text-gray-500">({groupLabel})</span>}
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSelectAll}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            すべて選択
          </button>
          <button
            type="button"
            onClick={handleClearAll}
            className="text-xs text-gray-600 hover:text-gray-800"
          >
            クリア
          </button>
        </div>
      </div>

      {searchable && (
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="検索..."
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
        />
      )}

      <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-md p-3 bg-white">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {filteredOptions.map((option) => (
            <label
              key={option}
              className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
            >
              <input
                type="checkbox"
                checked={selectedValues.includes(option)}
                onChange={() => handleToggle(option)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">{option}</span>
            </label>
          ))}
        </div>
        {filteredOptions.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-4">該当する項目がありません</p>
        )}
      </div>

      {selectedValues.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {selectedValues.map((value) => (
            <span
              key={value}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
            >
              {value}
              <button
                type="button"
                onClick={() => handleToggle(value)}
                className="hover:text-blue-900"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
