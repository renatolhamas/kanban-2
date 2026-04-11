import * as React from "react";
import { cn } from "@/lib/utils";

export interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
}

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  items: TabItem[];
  defaultActiveId?: string;
  onActiveChange?: (_id: string) => void;
}

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  (
    {
      items,
      defaultActiveId,
      onActiveChange,
      className,
      ...props
    },
    _ref
  ) => {
    const [activeId, setActiveId] = React.useState(
      defaultActiveId || items[0]?.id
    );

    const handleTabClick = (id: string) => {
      setActiveId(id);
      onActiveChange?.(id);
    };

    const activeTab = items.find((item) => item.id === activeId);

    return (
      <div
        ref={_ref}
        className={cn("w-full", className)}
        {...props}
      >
        {/* Tab List */}
        <div
          role="tablist"
          className="flex border-b border-surface-high"
        >
          {items.map((item) => {
            const isActive = item.id === activeId;

            return (
              <button
                key={item.id}
                id={`tab-${item.id}`}
                role="tab"
                aria-selected={isActive}
                aria-controls={`tabpanel-${item.id}`}
                onClick={() => handleTabClick(item.id)}
                className={cn(
                  // Base styles
                  "px-4 py-3 font-sans text-sm",
                  "transition-colors duration-150",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                  "hover:text-on-surface",

                  // Active state: Subtle background tonal shift + Manrope SemiBold
                  isActive
                    ? cn(
                        "text-on-surface font-semibold",
                        "bg-surface-low",
                        "border-b-2 border-primary"
                      )
                    : cn(
                        // Inactive state: Regular typography, text-secondary
                        "text-secondary",
                        "bg-transparent",
                        "border-b-2 border-transparent"
                      )
                )}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Tab Panel */}
        {activeTab && (
          <div
            id={`tabpanel-${activeId}`}
            role="tabpanel"
            aria-labelledby={`tab-${activeId}`}
            className="mt-4 p-4 bg-surface-lowest rounded-lg"
          >
            {activeTab.content}
          </div>
        )}
      </div>
    );
  }
);

Tabs.displayName = "Tabs";

export { Tabs };
