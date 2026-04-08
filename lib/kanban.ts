import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Default columns for new kanbans
 * Order matters: will be inserted in this sequence
 */
const DEFAULT_COLUMNS = [
  { name: "Novo", order_position: 1 },
  { name: "Qualificado", order_position: 2 },
  { name: "Em Negociação", order_position: 3 },
  { name: "Fechado", order_position: 4 },
];

/**
 * Create default kanban "Main" with 4 standard columns
 * Atomic operation: if any part fails, nothing is created
 *
 * @param supabase - Supabase client instance
 * @param tenantId - Tenant UUID to associate kanban with
 * @returns kanban_id if successful
 * @throws Error if kanban or column creation fails
 */
export async function createDefaultKanban(
  supabase: SupabaseClient,
  tenantId: string,
): Promise<string> {
  try {
    // Create kanban "Main" with is_main=true and order_position=1
    const { data: kanbanData, error: kanbanError } = await supabase
      .from("kanbans")
      .insert([
        {
          tenant_id: tenantId,
          name: "Main",
          is_main: true,
          order_position: 1,
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

    // Create 4 default columns
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
      // If columns fail, delete the kanban (cascade will handle this)
      await supabase.from("kanbans").delete().eq("id", kanbanId);
      throw new Error(
        `Failed to create columns: ${columnsError.message || "Unknown error"}`,
      );
    }

    console.log(
      `Default kanban created successfully: kanban_id=${kanbanId}, tenant_id=${tenantId}`,
    );
    return kanbanId;
  } catch (error) {
    console.error("createDefaultKanban error:", error);
    throw error;
  }
}
