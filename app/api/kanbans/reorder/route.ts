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
    const body = await request.json();
    const { id, direction } = body; // direction: 'up' | 'down'

    if (!id || !['up', 'down'].includes(direction)) {
      return NextResponse.json({ success: false, error: "ID and valid direction are required" }, { status: 400 });
    }

    // STEP 1: Get current kanban
    const { data: currentKanban, error: currentError } = await supabase
      .from("kanbans")
      .select("id, order_position")
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .single();

    if (currentError || !currentKanban) {
      return NextResponse.json({ success: false, error: "Kanban not found" }, { status: 404 });
    }

    const currentPos = currentKanban.order_position;

    // STEP 2: Find adjacent kanban
    let query = supabase
      .from("kanbans")
      .select("id, order_position")
      .eq("tenant_id", tenantId);

    if (direction === 'up') {
      query = query
        .lt("order_position", currentPos)
        .order("order_position", { ascending: false });
    } else {
      query = query
        .gt("order_position", currentPos)
        .order("order_position", { ascending: true });
    }

    const { data: adjacentKanban, error: adjacentError } = await query.limit(1).maybeSingle();

    if (adjacentError) throw adjacentError;

    // If at boundary, nothing to swap
    if (!adjacentKanban) {
      return NextResponse.json({ success: true, message: "Already at boundary", data: currentKanban });
    }

    // STEP 3: Swap (Application-Layer Orchestration)
    // We use a temporary position if needed, but since we are swapping existing ones, 
    // we can just update both. Note: there's a small risk of collision if unique constraint exists on order_position,
    // but the schema doesn't show one.
    
    const { error: update1 } = await supabase
      .from("kanbans")
      .update({ order_position: adjacentKanban.order_position })
      .eq("id", currentKanban.id);

    if (update1) throw update1;

    const { error: update2 } = await supabase
      .from("kanbans")
      .update({ order_position: currentPos })
      .eq("id", adjacentKanban.id);

    if (update2) {
      // Rollback update 1
      await supabase.from("kanbans").update({ order_position: currentPos }).eq("id", currentKanban.id);
      throw update2;
    }

    return NextResponse.json({ 
      success: true, 
      message: `Moved ${direction} successfully`,
      swapped_with: adjacentKanban.id
    });

  } catch (error) {
    console.error("[API_KANBANS_REORDER] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to reorder kanban" },
      { status: 500 }
    );
  }
}
