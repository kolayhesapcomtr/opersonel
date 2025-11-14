import { useState } from 'react';
import { Search, Filter, X, ChevronDown, ChevronUp } from 'lucide-react';

interface FilterOption {
  name: string;
  label: string;
  type: 'select' | 'text' | 'date' | 'dateRange';
  options?: { value: string; label: string }[];
  placeholder?: string;
}

interface AdvancedSearchProps {
  onSearch: (filters: Record<string, any>) => void;
  searchPlaceholder?: string;
  filters?: FilterOption[];
  className?: string;
}

export default function AdvancedSearch({
  onSearch,
  searchPlaceholder = 'Ara...',
  filters = [],
  className = '',
}: AdvancedSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    handleSearch({ ...filterValues, search: value });
  };

  const handleFilterChange = (name: string, value: any) => {
    const newFilters = { ...filterValues, [name]: value };
    setFilterValues(newFilters);
    handleSearch({ ...newFilters, search: searchTerm });
  };

  const handleSearch = (allFilters: Record<string, any>) => {
    // Remove empty values
    const cleanedFilters = Object.entries(allFilters).reduce((acc, [key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, any>);

    onSearch(cleanedFilters);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterValues({});
    onSearch({});
  };

  const hasActiveFilters = searchTerm || Object.values(filterValues).some((v) => v);

  return (
    <div className={`card ${className}`}>
      {/* Main search bar */}
      <div className="flex items-center space-x-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="input pl-10"
          />
        </div>

        {filters.length > 0 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`inline-flex items-center px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
              isExpanded
                ? 'bg-primary-50 border-primary-300 text-primary-700'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtreler
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 ml-2" />
            ) : (
              <ChevronDown className="w-4 h-4 ml-2" />
            )}
            {Object.values(filterValues).filter((v) => v).length > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-primary-600 rounded-full">
                {Object.values(filterValues).filter((v) => v).length}
              </span>
            )}
          </button>
        )}

        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            title="Filtreleri temizle"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Advanced filters */}
      {isExpanded && filters.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filters.map((filter) => (
              <div key={filter.name}>
                <label className="label">{filter.label}</label>
                {filter.type === 'select' && (
                  <select
                    value={filterValues[filter.name] || ''}
                    onChange={(e) => handleFilterChange(filter.name, e.target.value)}
                    className="input"
                  >
                    <option value="">Tümü</option>
                    {filter.options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}

                {filter.type === 'text' && (
                  <input
                    type="text"
                    placeholder={filter.placeholder}
                    value={filterValues[filter.name] || ''}
                    onChange={(e) => handleFilterChange(filter.name, e.target.value)}
                    className="input"
                  />
                )}

                {filter.type === 'date' && (
                  <input
                    type="date"
                    value={filterValues[filter.name] || ''}
                    onChange={(e) => handleFilterChange(filter.name, e.target.value)}
                    className="input"
                  />
                )}

                {filter.type === 'dateRange' && (
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      placeholder="Başlangıç"
                      value={filterValues[`${filter.name}Start`] || ''}
                      onChange={(e) =>
                        handleFilterChange(`${filter.name}Start`, e.target.value)
                      }
                      className="input"
                    />
                    <input
                      type="date"
                      placeholder="Bitiş"
                      value={filterValues[`${filter.name}End`] || ''}
                      onChange={(e) => handleFilterChange(`${filter.name}End`, e.target.value)}
                      className="input"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
