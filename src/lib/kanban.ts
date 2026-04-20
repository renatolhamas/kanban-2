import type { SupabaseClient } from '@supabase/supabase-js';

const DEFAULT_COLUMNS = [
  { name: 'Novo', order_position: 1 },
  { name: 'Qualificado', order_position: 2 },
  { name: 'Em Negociação', order_position: 3 },
  { name: 'Fechado', order_position: 4 },
];

export async function createDefaultKanban(
  supabase: SupabaseClient,
  tenantId: string
): Promise<string> {
  const { data: kanban, error: kanbanError } = await supabase
    .from('kanbans')
    .insert([{ tenant_id: tenantId, name: 'Main', is_main: true, order_position: 1 }])
    .select('id')
    .single();

  if (kanbanError) throw kanbanError;

  const columns = DEFAULT_COLUMNS.map((col) => ({ ...col, kanban_id: kanban.id }));
  const { error: columnsError } = await supabase.from('columns').insert(columns);

  if (columnsError) throw columnsError;

  return kanban.id;
}
