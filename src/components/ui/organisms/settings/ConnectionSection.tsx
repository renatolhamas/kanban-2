'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card } from '@/components/ui/molecules/card';
import { Button } from '@/components/ui/atoms/button';
import { Badge } from '@/components/ui/molecules/badge';
import { Modal } from '@/components/ui/molecules/modal';
import { useToast } from '@/components/ui/molecules/toast';

type ConnectionState = 'idle' | 'loading' | 'qr_displayed' | 'expired' | 'connected' | 'error';

export function ConnectionSection() {
  const [state, setState] = useState<ConnectionState>('idle');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(300); // 5 minutes
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>('disconnected');
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const { addToast } = useToast();

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load initial status when component mounts
  useEffect(() => {
    const loadInitialStatus = async () => {
      try {
        const response = await fetch('/api/settings/evo-go/status', {
          credentials: 'include',
        });
        if (!response.ok) throw new Error(`Status: ${response.status}`);

        const { connection_status } = await response.json();
        setConnectionStatus(connection_status);

        if (connection_status === 'connected') {
          setState('connected');
        } else {
          setState('idle');
        }
      } catch (err) {
        console.error('Initial status load error:', err);
        setState('idle');
      }
    };

    loadInitialStatus();
  }, []);

  // Polling effect
  useEffect(() => {
    if (state !== 'qr_displayed') {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
      return;
    }

    const poll = async () => {
      try {
        const response = await fetch('/api/settings/evo-go/status', {
          credentials: 'include',
        });
        if (!response.ok) throw new Error(`Status: ${response.status}`);

        const { connection_status } = await response.json();
        setConnectionStatus(connection_status);

        if (connection_status === 'connected') {
          setState('connected');
          addToast('WhatsApp conectado com sucesso! ✅', 'success');
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    };

    poll();
    pollIntervalRef.current = setInterval(poll, 3000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [state, addToast]);

  // Timer effect
  useEffect(() => {
    if (state !== 'qr_displayed') {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      return;
    }

    setTimerSeconds(300);

    const tick = () => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          setState('expired');
          if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    };

    timerIntervalRef.current = setInterval(tick, 1000);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [state]);

  const handleConnectClick = useCallback(async () => {
    setState('loading');
    setError(null);

    try {
      const response = await fetch('/api/settings/evo-go/qr', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.status === 409) {
        const errorData = await response.json();
        setConnectionStatus('connected');
        setState('connected');
        addToast(errorData.error || 'WhatsApp já está conectado', 'info');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao gerar QR code');
      }

      const { qr_code } = await response.json();
      setQrCode(qr_code);
      setState('qr_displayed');
      setTimerSeconds(300);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      addToast(errorMessage, 'error');
      setState('error');
    }
  }, [addToast]);

  const handleDisconnectClick = useCallback(() => {
    setShowDisconnectModal(true);
  }, []);

  const handleConfirmDisconnect = useCallback(async () => {
    setIsDisconnecting(true);

    try {
      const response = await fetch('/api/settings/evo-go/disconnect', {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao desconectar');
      }

      setConnectionStatus('disconnected');
      setState('idle');
      setQrCode(null);
      setError(null);
      addToast('WhatsApp desconectado. ✅', 'success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao desconectar';
      setError(errorMessage);
      addToast(errorMessage, 'error');
    } finally {
      setIsDisconnecting(false);
      setShowDisconnectModal(false);
    }
  }, [addToast]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <>
      <Card title="Conexão WhatsApp" className="mb-6">
        {state === 'idle' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Badge
                variant={connectionStatus === 'connected' ? 'positive' : 'neutral'}
                role="status"
              >
                {connectionStatus === 'connected' ? 'Conectado ✅' : 'Desconectado'}
              </Badge>
            </div>
            <Button onClick={handleConnectClick}>Conectar WhatsApp</Button>
          </div>
        )}

        {state === 'error' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Badge variant="neutral">Desconectado</Badge>
            </div>
            <Button onClick={handleConnectClick}>Conectar WhatsApp</Button>
            {error && (
              <div className="text-sm text-error bg-surface-container-low p-3 rounded" role="alert">
                {error}
              </div>
            )}
          </div>
        )}

        {state === 'loading' && (
          <div className="space-y-4 py-8">
            <div role="status" className="flex flex-col items-center justify-center gap-4">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
              <span className="text-sm font-medium text-text-secondary">Gerando código QR...</span>
            </div>
          </div>
        )}

        {state === 'qr_displayed' && qrCode && (
          <div className="space-y-6">
            <div className="relative p-4 bg-surface-bright border border-color-outline-variant rounded-lg shadow-ambient mx-auto w-fit">
              <img src={qrCode} alt="QR Code" className="w-64 h-64 mx-auto" />
              <div className="absolute inset-x-0 -bottom-3 flex justify-center">
                <Badge variant="neutral" className="bg-surface-container-highest shadow-ambient">Aguardando...</Badge>
              </div>
            </div>
            <div className="text-center pt-4">
              <p className="text-sm text-text-secondary">
                Expira em: <span className={`font-bold ${timerSeconds <= 60 ? 'text-error' : 'text-primary'}`}>{formatTimer(timerSeconds)}</span>
              </p>
            </div>
          </div>
        )}

        {state === 'expired' && (
          <div className="space-y-4">
            <div className="text-sm text-error bg-surface-container-low p-3 rounded" role="alert">QR Code expirado.</div>
            <Button onClick={handleConnectClick}>Gerar novo QR</Button>
          </div>
        )}

        {state === 'connected' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Badge variant="positive">Conectado ✅</Badge>
            </div>
            <Button onClick={handleDisconnectClick} loading={isDisconnecting} variant="secondary">Desconectar</Button>
          </div>
        )}
      </Card>

      <Modal open={showDisconnectModal} onOpenChange={setShowDisconnectModal} title="Confirmar Desconexão">
        <div className="space-y-4">
          <p className="text-text-secondary">Tem certeza que deseja desconectar sua conta WhatsApp?</p>
          <div className="flex gap-3 justify-end">
            <Button onClick={() => setShowDisconnectModal(false)} variant="ghost">Cancelar</Button>
            <Button onClick={handleConfirmDisconnect} variant="secondary" loading={isDisconnecting}>Desconectar</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
