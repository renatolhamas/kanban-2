'use client';

import React from 'react';
import { MoreVertical, Archive, ArrowRightLeft, X } from 'lucide-react';
import { Modal } from '@/components/ui/molecules/modal';
import { Button } from '@/components/ui/atoms/button';
import { MessageList } from '@/components/ui/molecules/chat/MessageList';
import { MessageInput } from '@/components/ui/molecules/chat/MessageInput';
import { useChat } from '@/context/ChatContext';
import { mockMessages } from '@/lib/mocks/chat-mocks';

export function ChatModal() {
  const { isModalOpen, closeChat, activeConversationId } = useChat();

  // In a real scenario, we would fetch the contact name based on activeConversationId
  // For Story 6.1, we use a placeholder or assume the context provides it
  const contactName = "Contato Selecionado"; 
  const contactPhone = "+55 11 99999-9999";

  return (
    <Modal
      open={isModalOpen}
      onOpenChange={closeChat}
      size="xl"
      fullScreenMobile
      noPadding
    >
      <div className="flex flex-col h-[600px] max-sm:h-full">
        {/* Header */}
        <div className="p-4 border-b border-outline-variant flex justify-between items-center bg-surface-bright">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              {contactName.charAt(0)}
            </div>
            <div>
              <h3 className="text-body-lg font-bold text-text-primary leading-tight m-0">
                {contactName}
              </h3>
              <p className="text-label-sm text-text-secondary m-0">
                {contactPhone}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-text-secondary disabled:opacity-50"
              disabled // Static stub (AC 7)
              title="Transferir Conversa"
            >
              <ArrowRightLeft size={20} />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-text-secondary disabled:opacity-50"
              disabled // Static stub (AC 7)
              title="Arquivar Conversa"
            >
              <Archive size={20} />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-text-secondary"
            >
              <MoreVertical size={20} />
            </Button>
            <div className="w-px h-6 bg-outline-variant mx-1" /> {/* Divider */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-text-secondary hover:bg-error/10 hover:text-error"
              onClick={closeChat}
              title="Fechar Chat"
            >
              <X size={20} />
            </Button>
          </div>
        </div>

        {/* Messages Section */}
        <div className="flex-1 overflow-hidden bg-surface-container-lowest">
          <MessageList messages={mockMessages} />
        </div>

        {/* Input Section */}
        <MessageInput />
      </div>
    </Modal>
  );
}
