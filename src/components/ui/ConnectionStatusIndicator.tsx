import React from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useChat } from '@/context/ChatContext';
import { RealtimeStatus } from '@/hooks/useRealtimeStatus';

interface Props {
  status?: RealtimeStatus;
}

export function ConnectionStatusIndicator({ status }: Props) {
  const chat = useChat();
  const realtimeStatus = status || chat.realtimeStatus;

  if (realtimeStatus === 'connected') {
    return (
      <div className="flex items-center gap-2 text-token-success bg-token-success/10 px-2 py-1 rounded-md text-xs font-medium" title="Online (Realtime ativado)">
        <Wifi size={14} />
        <span className="hidden sm:inline">Conectado</span>
      </div>
    );
  }

  if (realtimeStatus === 'reconnecting') {
    return (
      <div className="flex items-center gap-2 text-token-warning bg-token-warning/10 px-2 py-1 rounded-md text-xs font-medium" title="Reconectando ao servidor...">
        <RefreshCw size={14} className="animate-spin" />
        <span className="hidden sm:inline">Reconectando</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-token-danger bg-token-danger/10 px-2 py-1 rounded-md text-xs font-medium" title="Offline (Modo fallback)">
      <WifiOff size={14} />
      <span className="hidden sm:inline">Offline</span>
    </div>
  );
}
