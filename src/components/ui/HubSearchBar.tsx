import React from 'react';
import { Search } from 'lucide-react';

interface HubSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const HubSearchBar: React.FC<HubSearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Search...'
}) => {
  return (
    <div className="px-4 py-3 bg-gray-50">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
    </div>
  );
};

export default HubSearchBar;
