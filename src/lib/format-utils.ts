/**
 * Format timestamp to relative time (e.g., "2m ago", "1h ago")
 * Uses Intl.RelativeTimeFormat for native support without external libraries.
 */
export function formatRelativeTime(dateInput: string | Date | null): string {
  if (!dateInput) return '-';
  
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  return date.toLocaleDateString([], { day: '2-digit', month: '2-digit' });
}

/**
 * Truncate text to a specific length with ellipsis
 */
export function truncate(text: string | null, length: number = 100): string {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.substring(0, length).trim() + '...';
}

/**
 * Get display label for media messages
 */
export function getMediaLabel(mediaUrl: string | null): string {
  if (!mediaUrl) return '';
  
  const ext = mediaUrl.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'webp':
      return '📷 Foto';
    case 'mp4':
    case 'mov':
      return '🎥 Vídeo';
    case 'mp3':
    case 'ogg':
    case 'wav':
      return '🎵 Áudio';
    case 'pdf':
    case 'doc':
    case 'docx':
      return '📄 Arquivo';
    default:
      return '📎 Mídia';
  }
}
