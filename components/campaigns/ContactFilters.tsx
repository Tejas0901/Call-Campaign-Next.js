"use client";

import { useState } from "react";
import {
  ContactSearchFilters,
  CALL_STATUS_OPTIONS,
  CALL_OUTCOME_OPTIONS,
  SORT_OPTIONS,
} from "@/types/contact";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronDown, Filter } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

interface ContactFiltersProps {
  filters: ContactSearchFilters;
  onFiltersChange: (filters: ContactSearchFilters) => void;
  onApply: () => void;
  onClear: () => void;
}

export function ContactFilters({
  filters,
  onFiltersChange,
  onApply,
  onClear,
}: ContactFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const updateFilter = (key: keyof ContactSearchFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleMultiValue = (key: keyof ContactSearchFilters, value: string) => {
    const currentValues = (filters[key] as string[]) || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];
    updateFilter(key, newValues.length > 0 ? newValues : undefined);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.call_status?.length) count++;
    if (filters.call_outcome?.length) count++;
    if (filters.source?.length) count++;
    if (filters.tags?.length) count++;
    if (filters.is_reachable !== undefined) count++;
    if (filters.name_audio_generated !== undefined) count++;
    if (
      filters.experience_min !== undefined ||
      filters.experience_max !== undefined
    )
      count++;
    if (
      filters.current_ctc_min !== undefined ||
      filters.current_ctc_max !== undefined
    )
      count++;
    if (
      filters.expected_ctc_min !== undefined ||
      filters.expected_ctc_max !== undefined
    )
      count++;
    if (
      filters.notice_period_min !== undefined ||
      filters.notice_period_max !== undefined
    )
      count++;
    if (filters.created_after || filters.created_before) count++;
    return count;
  };

  const activeCount = getActiveFiltersCount();

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2 h-10">
          <Filter className="w-4 h-4" />
          Filters
          {activeCount > 0 && (
            <Badge
              variant="secondary"
              className="ml-1 px-1 min-w-[1.2rem] h-5 justify-center"
            >
              {activeCount}
            </Badge>
          )}
          <ChevronDown className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[700px] max-h-[70vh] overflow-y-auto p-6"
        align="start"
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Filter Candidates</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onClear();
                setIsOpen(false);
              }}
            >
              Clear All
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Call Status Filter */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Call Status</Label>
              <div className="flex flex-wrap gap-2">
                {CALL_STATUS_OPTIONS.map((option) => (
                  <Badge
                    key={option.value}
                    variant={
                      filters.call_status?.includes(option.value)
                        ? "default"
                        : "outline"
                    }
                    className="cursor-pointer py-1.5 px-3"
                    onClick={() =>
                      toggleMultiValue("call_status", option.value)
                    }
                  >
                    {option.label}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Call Outcome Filter */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Call Outcome</Label>
              <div className="flex flex-wrap gap-2">
                {CALL_OUTCOME_OPTIONS.map((option) => (
                  <Badge
                    key={option.value}
                    variant={
                      filters.call_outcome?.includes(option.value)
                        ? "default"
                        : "outline"
                    }
                    className="cursor-pointer py-1.5 px-3"
                    onClick={() =>
                      toggleMultiValue("call_outcome", option.value)
                    }
                  >
                    {option.label}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Reachable Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Reachable</Label>
              <Select
                value={
                  filters.is_reachable === undefined
                    ? "all"
                    : filters.is_reachable
                    ? "true"
                    : "false"
                }
                onValueChange={(value) =>
                  updateFilter(
                    "is_reachable",
                    value === "all" ? undefined : value === "true"
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Audio Generated Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Audio Generated</Label>
              <Select
                value={
                  filters.name_audio_generated === undefined
                    ? "all"
                    : filters.name_audio_generated
                    ? "true"
                    : "false"
                }
                onValueChange={(value) =>
                  updateFilter(
                    "name_audio_generated",
                    value === "all" ? undefined : value === "true"
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Experience Range */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">
                Experience (Years)
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.experience_min ?? ""}
                  onChange={(e) =>
                    updateFilter(
                      "experience_min",
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.experience_max ?? ""}
                  onChange={(e) =>
                    updateFilter(
                      "experience_max",
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                />
              </div>
            </div>

            {/* Notice Period */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">
                Notice Period (Days)
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.notice_period_min ?? ""}
                  onChange={(e) =>
                    updateFilter(
                      "notice_period_min",
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.notice_period_max ?? ""}
                  onChange={(e) =>
                    updateFilter(
                      "notice_period_max",
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                />
              </div>
            </div>

            {/* CTC Range */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">
                Expected CTC (LPA)
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.expected_ctc_min ?? ""}
                  onChange={(e) =>
                    updateFilter(
                      "expected_ctc_min",
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.expected_ctc_max ?? ""}
                  onChange={(e) =>
                    updateFilter(
                      "expected_ctc_max",
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                />
              </div>
            </div>

            {/* Sorting */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Sort By</Label>
              <div className="grid grid-cols-2 gap-2">
                <Select
                  value={filters.sort_by || "created_at"}
                  onValueChange={(value) => updateFilter("sort_by", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={filters.sort_order || "desc"}
                  onValueChange={(value) => updateFilter("sort_order", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">Ascending</SelectItem>
                    <SelectItem value="desc">Descending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 bg-white pt-4 border-t mt-4 -mx-6 px-6">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  onClear();
                  setIsOpen(false);
                }}
                className="flex-1"
              >
                Clear
              </Button>
              <Button
                onClick={() => {
                  onApply();
                  setIsOpen(false);
                }}
                className="flex-1"
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
