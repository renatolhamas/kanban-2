import * as React from "react"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/molecules/card"
import { Badge } from "@/components/ui/molecules/badge"
import { formatRelativeTime, getMediaLabel, truncate } from "@/lib/format-utils"
import { Image as ImageIcon, Video, Mic, FileText } from "lucide-react"
import { useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"

export interface ConversationCardProps extends React.HTMLAttributes<HTMLDivElement> {
  id: string
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
  isOverlay?: boolean
}

export const ConversationCard = React.forwardRef<HTMLDivElement, ConversationCardProps>(
  ({ 
    id,
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
    isOverlay,
    className, 
    onClick, 
    style: styleProp,
    ...props 
  }, ref) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
      id: id,
      disabled: isOverlay,
    })

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

    const style: React.CSSProperties = {
      ...styleProp,
      transform: CSS.Translate.toString(transform),
      opacity: isDragging ? 0.3 : undefined,
    }

    const overlayStyles: React.CSSProperties = isOverlay ? {
      opacity: 0.8,
      cursor: "grabbing",
      zIndex: 1000,
    } : {}

    return (
      <Card
        ref={(node) => {
          setNodeRef(node)
          if (typeof ref === 'function') ref(node)
          else if (ref) ref.current = node
        }}
        style={{ ...style, ...overlayStyles }}
        className={cn(
          "cursor-pointer transition-all duration-200 border-l-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          "p-4 flex flex-col space-y-2 select-none", 
          isSelected
            ? "bg-surface-container-low border-primary-container shadow-active scale-[1.02]"
            : "hover:bg-surface-container-lowest border-transparent hover:border-outline-variant",
          isOverlay && "cursor-grabbing ring-2 ring-primary border-primary shadow-ambient",
          className
        )}
        {...attributes}
        {...listeners}
        {...props}
        role="button"
        tabIndex={0}
        aria-label={`Conversa com ${name}. Telefone: ${phone}. Última mensagem: ${contentPreview}. ${timestamp}`}
        aria-pressed={isSelected}
        onClick={onClick}
        onKeyDown={handleKeyDown}
      >
        <div className="flex flex-col space-y-1.5 pointer-events-none">
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
