'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card } from '@/components/ui/molecules/card';
import { Button } from '@/components/ui/atoms/button';
import { Badge } from '@/components/ui/molecules/badge';
import { Modal } from '@/components/ui/molecules/modal';
import { useToast } from '@/components/ui/molecules/toast';

type ConnectionState = 'idle' | 'loading' | 'qr_displayed' | 'expired' | 'connected' | 'error';

export default function SettingsPage() {
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
          credentials: 'include', // Send JWT token in cookies
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

  // Polling effect: Check status every 3s while in qr_displayed state
  // QR code now comes directly in POST response, polling only detects connection status
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
          credentials: 'include', // Send JWT token in cookies
        });
        if (!response.ok) throw new Error(`Status: ${response.status}`);

        const { connection_status } = await response.json();
        setConnectionStatus(connection_status);

        // Check if WhatsApp connected
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

    // Initial poll immediately, then every 3s
    poll();
    pollIntervalRef.current = setInterval(poll, 3000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [state, addToast]);

  // Timer effect: Countdown from 5 minutes while QR is displayed
  useEffect(() => {
    if (state !== 'qr_displayed') {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      return;
    }

    // Set initial timer
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
        credentials: 'include', // Send JWT token in cookies
      });

      // Handle 409 Conflict (already connected)
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

      // QR code comes directly in the response (no need to wait for webhook)
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
        credentials: 'include', // Send JWT token in cookies
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
    <div className="settings-container p-6 max-w-2xl mx-auto">
      <Card title="Conexão WhatsApp" className="mb-6">
        {state === 'idle' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Badge
                variant={connectionStatus === 'connected' ? 'positive' : 'neutral'}
                role="status"
                aria-label={
                  connectionStatus === 'connected'
                    ? 'WhatsApp conectado'
                    : 'WhatsApp desconectado'
                }
              >
                {connectionStatus === 'connected' ? 'Conectado ✅' : 'Desconectado'}
              </Badge>
            </div>

            <Button
              onClick={handleConnectClick}
              aria-label="Conectar WhatsApp"
            >
              Conectar WhatsApp
            </Button>
          </div>
        )}

        {state === 'error' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Badge
                variant="neutral"
                role="status"
                aria-label="WhatsApp desconectado"
              >
                Desconectado
              </Badge>
            </div>

            <Button
              onClick={handleConnectClick}
              aria-label="Conectar WhatsApp"
            >
              Conectar WhatsApp
            </Button>

            {error && (
              <div
                className="text-sm text-red-600 bg-red-50 p-3 rounded"
                role="alert"
              >
                {error}
              </div>
            )}
          </div>
        )}

        {state === 'loading' && (
          <div className="space-y-4">
            <div
              role="status"
              aria-live="polite"
              aria-label="Carregando código QR"
              className="flex items-center gap-2"
            >
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
              <span>Gerando código QR...</span>
            </div>
          </div>
        )}

        {state === 'qr_displayed' && qrCode && (
          <div className="space-y-4">
            <div
              role="status"
              aria-live="polite"
              aria-label={`Código QR expirado em ${formatTimer(timerSeconds)}`}
            >
              <img
                src={qrCode}
                alt="QR Code para pareamento WhatsApp"
                className="w-64 h-64 border-2 border-gray-200 rounded mx-auto"
              />
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Expira em:{' '}
                <span
                  className={`font-bold ${
                    timerSeconds <= 60 ? 'text-red-600' : 'text-blue-600'
                  }`}
                  aria-label={`Tempo restante: ${formatTimer(timerSeconds)}`}
                >
                  {formatTimer(timerSeconds)}
                </span>
              </p>
            </div>

            <div
              role="status"
              aria-live="polite"
              aria-label="Aguardando confirmação de pareamento"
              className="text-center text-sm text-gray-500"
            >
              Aguardando confirmação...
            </div>
          </div>
        )}

        {state === 'expired' && (
          <div className="space-y-4">
            <div
              className="text-sm text-red-600 bg-red-50 p-3 rounded"
              role="alert"
            >
              QR Code expirado. Gere um novo.
            </div>
            <Button
              onClick={handleConnectClick}
              aria-label="Gerar novo código QR"
            >
              Gerar novo QR
            </Button>
          </div>
        )}

        {state === 'connected' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Badge
                variant="positive"
                role="status"
                aria-label="WhatsApp conectado"
              >
                Conectado ✅
              </Badge>
            </div>
            <Button
              onClick={handleDisconnectClick}
              disabled={isDisconnecting}
              variant="secondary"
              aria-label="Desconectar WhatsApp"
              aria-busy={isDisconnecting}
            >
              {isDisconnecting ? 'Desconectando...' : 'Desconectar'}
            </Button>
          </div>
        )}
      </Card>

      {/* Disconnect Confirmation Modal */}
      <Modal
        open={showDisconnectModal}
        onOpenChange={setShowDisconnectModal}
        title="Confirmar Desconexão"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Tem certeza que deseja desconectar sua conta WhatsApp? Você não
            receberá mais mensagens até reconectar.
          </p>
          <div className="flex gap-3 justify-end">
            <Button
              onClick={() => setShowDisconnectModal(false)}
              variant="ghost"
              aria-label="Cancelar desconexão"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmDisconnect}
              variant="secondary"
              disabled={isDisconnecting}
              aria-label="Confirmar desconexão"
            >
              {isDisconnecting ? 'Desconectando...' : 'Desconectar'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
