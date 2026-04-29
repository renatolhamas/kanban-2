import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Default columns for new kanbans
 * Order matters: will be inserted in this sequence
 */
const DEFAULT_COLUMNS = [
  { name: "Novo", order_position: 1 },
  { name: "Em Andamento", order_position: 2 },
  { name: "Resolvido", order_position: 3 },
];

/**
 * Create default kanban "Main"
 */
export async function createDefaultKanban(
  supabase: SupabaseClient,
  tenantId: string,
): Promise<string> {
  return createKanbanWithColumns(supabase, tenantId, "Main", true, 1);
}

/**
 * Create a new kanban with default columns
 * Atomic operation with manual cleanup on failure
 */
export async function createKanbanWithColumns(
  supabase: SupabaseClient,
  tenantId: string,
  name: string,
  isMain: boolean = false,
  orderPosition: number = 0
): Promise<string> {
  try {
    const { data: kanbanData, error: kanbanError } = await supabase
      .from("kanbans")
      .insert([
        {
          tenant_id: tenantId,
          name: name,
          is_main: isMain,
          order_position: orderPosition,
        },
      ])
      .select("id")
      .single();

    if (kanbanError || !kanbanData) {
      console.error("Kanban creation error:", kanbanError);
      throw new Error(
        `Failed to create kanban: ${kanbanError?.message || "Unknown error"}`,
      );
    }

    const kanbanId = kanbanData.id;

    const columnInserts = DEFAULT_COLUMNS.map((col) => ({
      kanban_id: kanbanId,
      name: col.name,
      order_position: col.order_position,
    }));

    const { error: columnsError } = await supabase
      .from("columns")
      .insert(columnInserts);

    if (columnsError) {
      console.error("Columns creation error:", columnsError);
      // Rollback: delete the kanban
      await supabase.from("kanbans").delete().eq("id", kanbanId);
      throw new Error(
        `Failed to create columns: ${columnsError.message || "Unknown error"}`,
      );
    }

    return kanbanId;
  } catch (error) {
    console.error("createKanbanWithColumns error:", error);
    throw error;
  }
}
