"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { indianCities, CityData } from "@/data/indianCities";

interface LocationMultiSelectProps {
  value: string[];
  onChange: (locations: string[]) => void;
  label?: string;
  placeholder?: string;
  maxLocations?: number;
}

export function LocationMultiSelect({
  value,
  onChange,
  label = "Locations",
  placeholder = "Search and select cities...",
  maxLocations = 10,
}: LocationMultiSelectProps) {
  const [searchInput, setSearchInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  // Filter cities based on search input
  const filteredCities = useMemo(() => {
    if (!searchInput.trim()) return indianCities;

    const query = searchInput.toLowerCase();
    return indianCities.filter(
      (city) =>
        city.label.toLowerCase().includes(query) ||
        city.state.toLowerCase().includes(query) ||
        city.value.includes(query),
    );
  }, [searchInput]);

  // Get already selected cities to show in UI
  const selectedCityLabels = useMemo(() => {
    return value.map(
      (val) => indianCities.find((city) => city.value === val)?.label || val,
    );
  }, [value]);

  const handleSelectCity = (city: CityData) => {
    if (!value.includes(city.value)) {
      if (value.length < maxLocations) {
        onChange([...value, city.value]);
        setSearchInput("");
        setIsOpen(false);
      }
    }
  };

  const handleRemoveCity = (cityValue: string) => {
    onChange(value.filter((v) => v !== cityValue));
  };

  const handleAddFromInput = () => {
    if (searchInput.trim()) {
      const matches = filteredCities.filter(
        (city) =>
          city.label.toLowerCase() === searchInput.toLowerCase() ||
          city.value === searchInput.toLowerCase(),
      );

      if (matches.length > 0) {
        handleSelectCity(matches[0]);
      }
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>

      <div className="relative">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder={placeholder}
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleAddFromInput}
            disabled={!searchInput.trim() || value.length >= maxLocations}
          >
            Add
          </Button>
        </div>

        {/* Dropdown suggestions */}
        {isOpen && searchInput.trim() && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
            {filteredCities.length > 0 ? (
              <div className="divide-y">
                {filteredCities.slice(0, 15).map((city) => (
                  <button
                    key={city.value}
                    type="button"
                    onClick={() => handleSelectCity(city)}
                    disabled={value.includes(city.value)}
                    className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex justify-between items-center"
                  >
                    <div>
                      <div className="font-medium text-gray-900">
                        {city.label}
                      </div>
                      <div className="text-xs text-gray-500">{city.state}</div>
                    </div>
                    {value.includes(city.value) && (
                      <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded">
                        Selected
                      </span>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                No cities found
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected locations tags */}
      {selectedCityLabels.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2">
          {selectedCityLabels.map((label, idx) => (
            <div
              key={`${value[idx]}-${idx}`}
              className="inline-flex items-center gap-2 bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm"
            >
              <span>{label}</span>
              <button
                type="button"
                onClick={() => handleRemoveCity(value[idx])}
                className="text-primary-600 hover:text-primary-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {value.length >= maxLocations && (
        <p className="text-xs text-gray-500 mt-2">
          Maximum {maxLocations} locations selected
        </p>
      )}
    </div>
  );
}
