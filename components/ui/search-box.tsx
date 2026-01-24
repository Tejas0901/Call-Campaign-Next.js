"use client";

import * as React from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SearchBoxProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange"
> {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onClear?: () => void;
  leadingIcon?: React.ReactNode;
  trailingContent?: React.ReactNode;
  containerClassName?: string;
  inputClassName?: string;
}

const SearchBox = React.forwardRef<HTMLInputElement, SearchBoxProps>(
  (
    {
      value,
      onChange,
      placeholder = "Search...",
      onClear,
      leadingIcon = <Search className="h-4 w-4 text-gray-400" />,
      trailingContent,
      containerClassName,
      inputClassName,
      className,
      ...rest
    },
    ref,
  ) => {
    const showClear = Boolean(onClear && value);

    return (
      <div className={cn("relative", containerClassName)}>
        {leadingIcon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
            {leadingIcon}
          </span>
        )}

        <Input
          ref={ref}
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={cn(
            leadingIcon ? "pl-10" : "",
            trailingContent || showClear ? "pr-14" : "",
            inputClassName,
            className,
          )}
          {...rest}
        />

        {(trailingContent || showClear) && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {trailingContent}
            {showClear && (
              <button
                type="button"
                onClick={() => {
                  onClear?.();
                  onChange("");
                }}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>
    );
  },
);

SearchBox.displayName = "SearchBox";

export { SearchBox };
