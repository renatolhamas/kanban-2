import * as React from "react"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/molecules/card"
import { Badge } from "@/components/ui/molecules/badge"
import { formatRelativeTime, getMediaLabel, truncate } from "@/lib/format-utils"
import { Image as ImageIcon, Video, Mic, FileText } from "lucide-react"

export interface ConversationCardProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string
  phone: string
  lastMessage: string | null
  senderType: string | null
  mediaUrl: string | null
  mediaType: string | null
  timestamp: string | null
  unreadCount?: number
  isSelected?: boolean
  isGroup?: boolean
}

export const ConversationCard = React.forwardRef<HTMLDivElement, ConversationCardProps>(
  ({ 
    name, 
    phone, 
    lastMessage, 
    senderType, 
    mediaUrl, 
    mediaType,
    timestamp, 
    unreadCount, 
    isSelected, 
    isGroup, 
    className, 
    onClick, 
    ...props 
  }, ref) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onClick?.(e as unknown as React.MouseEvent<HTMLDivElement>)
      }
    }

    // Logic for content preview
    const hasMessage = lastMessage || mediaUrl || mediaType;
    const contentPreview = truncate(lastMessage, 100) || getMediaLabel(mediaUrl, mediaType) || "Sem mensagens";
    const prefix = senderType === 'user' ? "Você: " : ""; 

    const MediaIcon = React.useMemo(() => {
      if (!mediaType) return null;
      switch (mediaType) {
        case 'image': return <ImageIcon className="w-3.5 h-3.5" />;
        case 'video': return <Video className="w-3.5 h-3.5" />;
        case 'audio': return <Mic className="w-3.5 h-3.5" />;
        case 'document': return <FileText className="w-3.5 h-3.5" />;
        default: return null;
      }
    }, [mediaType]);

    return (
      <Card
        ref={ref}
        role="button"
        tabIndex={0}
        aria-label={`Conversa com ${name}. Telefone: ${phone}. Última mensagem: ${contentPreview}. ${timestamp}`}
        aria-pressed={isSelected}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        className={cn(
          "cursor-pointer transition-all duration-200 border-l-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          "p-4 flex flex-col space-y-2", // Standardized padding
          isSelected
            ? "bg-surface-container-low border-primary-container shadow-active scale-[1.02]"
            : "hover:bg-surface-container-lowest border-transparent hover:border-outline-variant",
          className
        )}
        {...props}
      >
        <div className="flex flex-col space-y-1.5">
          {/* Header: Name and Time */}
          <div className="flex justify-between items-center gap-2">
            <span className="flex items-center gap-1.5 truncate flex-1">
              <span className="text-body-lg font-bold text-text-primary truncate">
                {name}
              </span>
              {isGroup && (
                <Badge variant="group" className="shrink-0 text-[10px] py-0 h-4">👥 Grupo</Badge>
              )}
            </span>
            <span className="text-label-sm text-text-secondary whitespace-nowrap font-medium">
              {formatRelativeTime(timestamp)}
            </span>
          </div>
          
          {/* Subheader: Phone (Optional/Secondary) */}
          <div className="text-label-sm text-text-secondary truncate opacity-70">
            {phone}
          </div>
          
          {/* Body: Last Message Preview */}
          <div className="flex justify-between items-start gap-3">
            <p className={cn(
              "text-body-sm leading-relaxed line-clamp-2 flex-1 flex items-center gap-1.5",
              hasMessage ? "text-text-primary" : "text-text-secondary italic opacity-60"
            )}>
              <span className="font-semibold text-primary/80">{prefix}</span>
              {MediaIcon}
              {contentPreview}
            </p>
            
            {unreadCount !== undefined && unreadCount > 0 && (
              <Badge variant="info" className="h-5 min-w-[20px] px-1.5 justify-center shrink-0 mt-0.5">
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
