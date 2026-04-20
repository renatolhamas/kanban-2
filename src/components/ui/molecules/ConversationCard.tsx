import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/molecules/card"
import { Badge } from "@/components/ui/molecules/badge"

export interface ConversationCardProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string
  phone: string
  lastMessage: string
  timestamp: string
  unreadCount?: number
  isSelected?: boolean
}

export const ConversationCard = React.forwardRef<HTMLDivElement, ConversationCardProps>(
  ({ name, phone, lastMessage, timestamp, unreadCount, isSelected, className, ...props }, ref) => {
    return (
      <Card
        ref={ref}
        className={cn(
          "cursor-pointer transition-all duration-200 border-l-4",
          isSelected 
            ? "bg-surface-container-low border-primary-container shadow-active scale-[1.02]" 
            : "hover:bg-surface-container-lowest border-transparent hover:border-outline-variant",
          className
        )}
        {...props}
      >
        <div className="flex flex-col space-y-1">
          <div className="flex justify-between items-start">
            <span className="text-body-lg font-bold text-text-primary truncate max-w-[150px]">
              {name}
            </span>
            <span className="text-label-sm text-text-secondary whitespace-nowrap">
              {timestamp}
            </span>
          </div>
          
          <div className="text-body-sm text-text-secondary truncate">
            {phone}
          </div>
          
          <div className="flex justify-between items-end pt-1">
            <p className="text-body-md text-text-primary truncate flex-1 pr-4">
              {lastMessage.length > 80 ? `${lastMessage.substring(0, 80)}...` : lastMessage}
            </p>
            {unreadCount !== undefined && unreadCount > 0 && (
              <Badge variant="info" className="h-5 min-w-[20px] justify-center ml-auto">
                {unreadCount}
              </Badge>
            )}
          </div>
        </div>
      </Card>
    )
  }
)

ConversationCard.displayName = "ConversationCard"
