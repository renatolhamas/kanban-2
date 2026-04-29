'use client';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/molecules/tabs';
import { ConnectionSection } from '@/components/ui/organisms/settings/ConnectionSection';
import { KanbansSection } from '@/components/ui/organisms/settings/KanbansSection';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';

function SettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'connection';

  const handleTabChange = (value: string) => {
    router.push(`/settings?tab=${value}`, { scroll: false });
  };

  return (
    <div className="settings-container p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-text-primary mb-6">Configurações</h1>
      
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="mb-6">
          <TabsTrigger value="connection">Conexão</TabsTrigger>
          <TabsTrigger value="kanbans">Kanbans</TabsTrigger>
          <TabsTrigger value="profile" className="opacity-50 cursor-not-allowed">Perfil</TabsTrigger>
          <TabsTrigger value="messages" className="opacity-50 cursor-not-allowed">Mensagens</TabsTrigger>
        </TabsList>

        <TabsContent value="connection">
          <ConnectionSection />
        </TabsContent>

        <TabsContent value="kanbans">
          <KanbansSection />
        </TabsContent>

        <TabsContent value="profile">
          <div className="p-4 text-text-secondary italic">Em breve...</div>
        </TabsContent>

        <TabsContent value="messages">
          <div className="p-4 text-text-secondary italic">Em breve...</div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="p-6">Carregando configurações...</div>}>
      <SettingsContent />
    </Suspense>
  );
}
