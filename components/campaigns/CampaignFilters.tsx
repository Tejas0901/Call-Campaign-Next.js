"use client";

import { useState } from "react";
import { CampaignSearchFilters } from "@/types/campaign";
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
import { ChevronDown, X, Filter } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

interface CampaignFiltersProps {
  filters: CampaignSearchFilters;
  onFiltersChange: (filters: CampaignSearchFilters) => void;
  onApply: () => void;
  onClear: () => void;
}

export function CampaignFilters({
  filters,
  onFiltersChange,
  onApply,
  onClear,
}: CampaignFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const updateFilter = (key: keyof CampaignSearchFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleMultiValue = (
    key: keyof CampaignSearchFilters,
    value: string
  ) => {
    const currentValues = (filters[key] as string[]) || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];
    updateFilter(key, newValues.length > 0 ? newValues : undefined);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.status?.length) count++;
    if (filters.work_mode?.length) count++;
    if (filters.job_type?.length) count++;
    if (filters.shift_type?.length) count++;
    if (filters.interview_mode?.length) count++;
    if (filters.is_drive !== undefined) count++;
    if (filters.ctc_negotiable !== undefined) count++;
    if (filters.audio_generated !== undefined) count++;
    if (filters.audio_approved !== undefined) count++;
    if (filters.min_ctc_from || filters.max_ctc_to) count++;
    if (filters.experience_min_from || filters.experience_max_to) count++;
    if (filters.created_after || filters.created_before) count++;
    return count;
  };

  const activeCount = getActiveFiltersCount();

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Filter className="w-4 h-4" />
          Filters
          {activeCount > 0 && (
            <Badge variant="secondary" className="ml-1">
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
            <h3 className="text-lg font-semibold">Filter Campaigns</h3>
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

          <div className="grid grid-cols-2 gap-4">
            {/* Status Filter */}
            <div className="space-y-2">
              <Label>Status</Label>
              <div className="flex flex-wrap gap-2">
                {(["draft", "active", "paused", "completed"] as const).map(
                  (status) => (
                    <Badge
                      key={status}
                      variant={
                        filters.status?.includes(status) ? "default" : "outline"
                      }
                      className="cursor-pointer"
                      onClick={() => toggleMultiValue("status", status)}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Badge>
                  )
                )}
              </div>
            </div>

            {/* Work Mode Filter */}
            <div className="space-y-2">
              <Label>Work Mode</Label>
              <div className="flex flex-wrap gap-2">
                {(["remote", "onsite", "hybrid"] as const).map((mode) => (
                  <Badge
                    key={mode}
                    variant={
                      filters.work_mode?.includes(mode) ? "default" : "outline"
                    }
                    className="cursor-pointer"
                    onClick={() => toggleMultiValue("work_mode", mode)}
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Job Type Filter */}
            <div className="space-y-2">
              <Label>Job Type</Label>
              <div className="flex flex-wrap gap-2">
                {(["fulltime", "contract", "parttime"] as const).map((type) => (
                  <Badge
                    key={type}
                    variant={
                      filters.job_type?.includes(type) ? "default" : "outline"
                    }
                    className="cursor-pointer"
                    onClick={() => toggleMultiValue("job_type", type)}
                  >
                    {type === "fulltime"
                      ? "Full Time"
                      : type === "parttime"
                      ? "Part Time"
                      : "Contract"}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Shift Type Filter */}
            <div className="space-y-2">
              <Label>Shift Type</Label>
              <div className="flex flex-wrap gap-2">
                {(["day", "night", "rotational", "general"] as const).map(
                  (shift) => (
                    <Badge
                      key={shift}
                      variant={
                        filters.shift_type?.includes(shift)
                          ? "default"
                          : "outline"
                      }
                      className="cursor-pointer"
                      onClick={() => toggleMultiValue("shift_type", shift)}
                    >
                      {shift.charAt(0).toUpperCase() + shift.slice(1)}
                    </Badge>
                  )
                )}
              </div>
            </div>

            {/* Interview Mode Filter */}
            <div className="space-y-2">
              <Label>Interview Mode</Label>
              <div className="flex flex-wrap gap-2">
                {(["video", "telephonic", "in_person"] as const).map((mode) => (
                  <Badge
                    key={mode}
                    variant={
                      filters.interview_mode?.includes(mode)
                        ? "default"
                        : "outline"
                    }
                    className="cursor-pointer"
                    onClick={() => toggleMultiValue("interview_mode", mode)}
                  >
                    {mode === "in_person"
                      ? "In Person"
                      : mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Walk-in Drive */}
            <div className="space-y-2">
              <Label>Walk-in Drive</Label>
              <Select
                value={
                  filters.is_drive === undefined
                    ? "all"
                    : filters.is_drive
                    ? "true"
                    : "false"
                }
                onValueChange={(value) =>
                  updateFilter(
                    "is_drive",
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

            {/* CTC Negotiable */}
            <div className="space-y-2">
              <Label>CTC Negotiable</Label>
              <Select
                value={
                  filters.ctc_negotiable === undefined
                    ? "all"
                    : filters.ctc_negotiable
                    ? "true"
                    : "false"
                }
                onValueChange={(value) =>
                  updateFilter(
                    "ctc_negotiable",
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

            {/* Audio Generated */}
            <div className="space-y-2">
              <Label>Audio Generated</Label>
              <Select
                value={
                  filters.audio_generated === undefined
                    ? "all"
                    : filters.audio_generated
                    ? "true"
                    : "false"
                }
                onValueChange={(value) =>
                  updateFilter(
                    "audio_generated",
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
          </div>

          {/* CTC Range */}
          <div className="space-y-2">
            <Label>CTC Range (LPA)</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Input
                  type="number"
                  placeholder="Min CTC"
                  value={filters.min_ctc_from || ""}
                  onChange={(e) =>
                    updateFilter(
                      "min_ctc_from",
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                />
              </div>
              <div>
                <Input
                  type="number"
                  placeholder="Max CTC"
                  value={filters.max_ctc_to || ""}
                  onChange={(e) =>
                    updateFilter(
                      "max_ctc_to",
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                />
              </div>
            </div>
          </div>

          {/* Experience Range */}
          <div className="space-y-2">
            <Label>Experience Range (Years)</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Input
                  type="number"
                  placeholder="Min Experience"
                  value={filters.experience_min_from || ""}
                  onChange={(e) =>
                    updateFilter(
                      "experience_min_from",
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                />
              </div>
              <div>
                <Input
                  type="number"
                  placeholder="Max Experience"
                  value={filters.experience_max_to || ""}
                  onChange={(e) =>
                    updateFilter(
                      "experience_max_to",
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                />
              </div>
            </div>
          </div>

          {/* Date Range */}
          <div className="space-y-2">
            <Label>Created Date Range</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Input
                  type="date"
                  value={filters.created_after || ""}
                  onChange={(e) =>
                    updateFilter("created_after", e.target.value || undefined)
                  }
                />
              </div>
              <div>
                <Input
                  type="date"
                  value={filters.created_before || ""}
                  onChange={(e) =>
                    updateFilter("created_before", e.target.value || undefined)
                  }
                />
              </div>
            </div>
          </div>

          {/* CTC Range */}
          <div className="space-y-2">
            <Label>CTC Range (LPA)</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Input
                  type="number"
                  placeholder="Min CTC"
                  value={filters.min_ctc_from || ""}
                  onChange={(e) =>
                    updateFilter(
                      "min_ctc_from",
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                />
              </div>
              <div>
                <Input
                  type="number"
                  placeholder="Max CTC"
                  value={filters.max_ctc_to || ""}
                  onChange={(e) =>
                    updateFilter(
                      "max_ctc_to",
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                />
              </div>
            </div>
          </div>

          {/* Experience Range */}
          <div className="space-y-2">
            <Label>Experience Range (Years)</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Input
                  type="number"
                  placeholder="Min Experience"
                  value={filters.experience_min_from || ""}
                  onChange={(e) =>
                    updateFilter(
                      "experience_min_from",
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                />
              </div>
              <div>
                <Input
                  type="number"
                  placeholder="Max Experience"
                  value={filters.experience_max_to || ""}
                  onChange={(e) =>
                    updateFilter(
                      "experience_max_to",
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                />
              </div>
            </div>
          </div>

          {/* Date Range */}
          <div className="space-y-2">
            <Label>Created Date Range</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Input
                  type="date"
                  value={filters.created_after || ""}
                  onChange={(e) =>
                    updateFilter("created_after", e.target.value || undefined)
                  }
                />
              </div>
              <div>
                <Input
                  type="date"
                  value={filters.created_before || ""}
                  onChange={(e) =>
                    updateFilter("created_before", e.target.value || undefined)
                  }
                />
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
