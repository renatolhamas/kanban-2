import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get user session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const tenantId = user.app_metadata?.tenant_id;
    const { columnId, direction } = await request.json();

    if (!columnId || !['up', 'down'].includes(direction)) {
      return NextResponse.json({ success: false, error: "Invalid parameters" }, { status: 400 });
    }

    // STEP 1: Fetch target column and its kanban ownership
    const { data: targetColumn, error: fetchError } = await supabase
      .from("columns")
      .select("*, kanbans!inner(tenant_id)")
      .eq("id", columnId)
      .eq("kanbans.tenant_id", tenantId)
      .single();

    if (fetchError || !targetColumn) {
      return NextResponse.json({ success: false, error: "Column not found or access denied" }, { status: 404 });
    }

    // STEP 2: Find the neighbor
    let query = supabase
      .from("columns")
      .select("id, order_position")
      .eq("kanban_id", targetColumn.kanban_id);

    if (direction === 'up') {
      query = query
        .lt("order_position", targetColumn.order_position)
        .order("order_position", { ascending: false });
    } else {
      query = query
        .gt("order_position", targetColumn.order_position)
        .order("order_position", { ascending: true });
    }

    const { data: neighbor, error: neighborError } = await query.limit(1).maybeSingle();

    if (neighborError) throw neighborError;

    // If no neighbor (already at boundary), just return success
    if (!neighbor) {
      return NextResponse.json({ success: true, message: "Already at boundary" });
    }

    // STEP 3: Swap positions
    // Use a transaction or sequential updates
    const { error: update1 } = await supabase
      .from("columns")
      .update({ order_position: neighbor.order_position, updated_at: new Date().toISOString() })
      .eq("id", targetColumn.id);

    if (update1) throw update1;

    const { error: update2 } = await supabase
      .from("columns")
      .update({ order_position: targetColumn.order_position, updated_at: new Date().toISOString() })
      .eq("id", neighbor.id);

    if (update2) throw update2;

    return NextResponse.json({ success: true, message: "Reordered successfully" });

  } catch (error) {
    console.error("[API_COLUMNS_REORDER] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to reorder columns" },
      { status: 500 }
    );
  }
}
