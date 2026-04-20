"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"

export interface KanbanOption {
  id: string
  name: string
}

export interface KanbanSelectorProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: KanbanOption[]
  onValueChange?: (value: string) => void
  id?: string
}

export const KanbanSelector = React.forwardRef<HTMLSelectElement, KanbanSelectorProps>(
  ({ options, onValueChange, className, value, ...props }, ref) => {
    return (
      <div className="relative inline-block w-full max-w-[240px]">
        <select
          ref={ref}
          value={value}
          onChange={(e) => onValueChange?.(e.target.value)}
          className={cn(
            "appearance-none w-full bg-surface-container-high text-text-primary px-4 py-2 pr-10 rounded-lg border border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer text-body-md font-medium",
            className
          )}
          {...props}
        >
          {options.map((option) => (
            <option key={option.id} value={option.id} className="bg-surface-container-high py-2">
              {option.name}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-text-secondary">
          <ChevronDown size={18} aria-hidden="true" />
        </div>
      </div>
    )
  }
)

KanbanSelector.displayName = "KanbanSelector"
