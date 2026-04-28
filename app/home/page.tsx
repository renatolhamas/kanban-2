"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { useConversations } from "@/hooks/useConversations"
import { useKanbans } from "@/hooks/useKanbans"
import { KanbanBoard } from "@/components/ui/organisms/KanbanBoard"
import { KanbanColumn } from "@/components/ui/organisms/KanbanColumn"
import { ConversationCard } from "@/components/ui/molecules/ConversationCard"
import { KanbanSelector } from "@/components/ui/molecules/KanbanSelector"
import { ChatProvider, useChat } from "@/context/ChatContext"
import { ChatModal } from "@/components/ui/organisms/chat/ChatModal"
import { ConnectionStatusIndicator } from "@/components/ui/ConnectionStatusIndicator"

export default function HomePage() {
  return (
    <ChatProvider>
      <HomeContent />
    </ChatProvider>
  )
}

function HomeContent() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const [selectedKanbanId, setSelectedKanbanId] = useState<string | null>(null)
  const { openChat } = useChat()
  
  // tenantId extraído do metadata do usuário
  const tenantId = user?.app_metadata?.tenant_id

  // Redirecionar se não estiver autenticado após terminar de carregar
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [authLoading, isAuthenticated, router])

  // Hook para buscar todos os quadros do tenant (obté m o tenantId internamente, mas aqui usamos para controle de exibição)
  const { kanbans, isLoading: kanbansLoading } = useKanbans()

  // Efeito para definir o quadro inicial (Main ou o primeiro da lista)
  useEffect(() => {
    if (kanbans.length > 0 && !selectedKanbanId) {
      const mainKanban = kanbans.find(k => k.is_main) || kanbans[0]
      setSelectedKanbanId(mainKanban.id)
    }
  }, [kanbans, selectedKanbanId])

  // Hook para buscar as conversas do quadro selecionado
  const { conversations, columns, isLoading: conversationsLoading, error, realtimeStatus } = useConversations(
    selectedKanbanId || ""
  )

  const isGlobalLoading = authLoading || kanbansLoading || (selectedKanbanId && conversationsLoading)

  if (isGlobalLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-surface-container-lowest">
        <div className="flex flex-col items-center gap-4">
           <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
           <p className="text-text-secondary font-medium">Carregando seu quadro...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center bg-surface-container-lowest p-6">
        <div className="bg-error-container text-on-error-container p-6 rounded-xl border border-error/20 max-w-lg shadow-ambient">
          <h2 className="text-headline-xs font-bold mb-2">Erro de Carregamento</h2>
          <p className="text-body-md opacity-90">{error.message}</p>
        </div>
      </div>
    )
  }

  if (!selectedKanbanId && !isGlobalLoading && user) {
     return (
        <div className="flex h-full items-center justify-center bg-surface-container-lowest">
          <div className="text-center max-w-md p-8 bg-surface-container-low rounded-xl shadow-ambient">
            <h2 className="text-headline-sm font-bold text-text-primary mb-2">Nenhum quadro encontrado</h2>
            <p className="text-body-md text-text-secondary">
              Não encontramos nenhum quadro Kanban configurado para o seu tenant ({tenantId || "N/A"}).
            </p>
          </div>
        </div>
      )
  }

  return (
    <div className="flex flex-col h-full bg-surface-container-lowest animate-in fade-in duration-500">
      <header className="p-6 border-b border-outline-variant bg-surface-container-lowest flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-display-sm font-bold text-text-primary leading-tight">Painel de Atendimento</h1>
            <ConnectionStatusIndicator status={realtimeStatus} />
          </div>
          <p className="text-body-md text-text-secondary">Visualize e organize suas conversas WhatsApp</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
          <div className="flex flex-col w-full sm:w-auto">
            <label htmlFor="kanban-selector" className="text-label-sm text-text-secondary uppercase tracking-wider mb-1 ml-1">Selecione o Quadro</label>
            <KanbanSelector
              id="kanban-selector"
              options={kanbans}
              value={selectedKanbanId || ""}
              onValueChange={setSelectedKanbanId}
            />
          </div>
          
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-label-sm text-text-secondary uppercase tracking-wider mb-1">Tenant Context</span>
            <p className="text-body-sm font-mono text-text-primary bg-surface-container-high px-3 py-2 rounded-lg border border-outline-variant">
              {tenantId ? `${tenantId.slice(0, 8)}...` : "Desconectado"}
            </p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-hidden relative">
        <h2 className="sr-only">Colunas do Quadro Kanban</h2>
        <KanbanBoard>
          {columns.length === 0 && !conversationsLoading && (
            <div className="flex flex-1 items-center justify-center h-full">
              <div className="text-center p-8">
                <p className="text-text-secondary italic text-body-lg">Este quadro ainda não possui colunas configuradas.</p>
              </div>
            </div>
          )}
          
          {columns.map((column) => (
            <KanbanColumn 
              key={column.id} 
              title={column.name}
              count={conversations.filter(c => c.column_id === column.id).length}
            >
              {conversations
                .filter((c) => c.column_id === column.id)
                .map((conv) => (
                  <ConversationCard
                    key={conv.id}
                    name={conv.contact_name || conv.wa_phone}
                    phone={conv.wa_phone}
                    lastMessage={conv.last_message_content}
                    senderType={conv.last_sender_type}
                    mediaUrl={conv.last_media_url}
                    mediaType={conv.last_media_type}
                    timestamp={conv.last_message_at}
                    unreadCount={conv.unread_count}
                    onClick={() => openChat(conv.id)}
                  />
                ))}
            </KanbanColumn>
          ))}
        </KanbanBoard>
      </div>

      <ChatModal />
    </div>
  )
}
