import React from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useChat } from '@/context/ChatContext';

export function ConnectionStatusIndicator() {
  const { realtimeStatus } = useChat();

  if (realtimeStatus === 'connected') {
    return (
      <div className="flex items-center gap-2 text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md text-xs font-medium" title="Online (Realtime ativado)">
        <Wifi size={14} />
        <span className="hidden sm:inline">Conectado</span>
      </div>
    );
  }

  if (realtimeStatus === 'reconnecting') {
    return (
      <div className="flex items-center gap-2 text-amber-500 bg-amber-500/10 px-2 py-1 rounded-md text-xs font-medium" title="Reconectando ao servidor...">
        <RefreshCw size={14} className="animate-spin" />
        <span className="hidden sm:inline">Reconectando</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-red-500 bg-red-500/10 px-2 py-1 rounded-md text-xs font-medium" title="Offline (Modo fallback)">
      <WifiOff size={14} />
      <span className="hidden sm:inline">Offline</span>
    </div>
  );
}
