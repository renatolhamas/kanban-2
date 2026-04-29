import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createKanbanWithColumns } from "@/lib/kanban";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get user session to extract tenant_id from app_metadata
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const tenantId = user.app_metadata?.tenant_id;
    if (!tenantId) {
      return NextResponse.json(
        { success: false, error: "Tenant not found in user session" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name } = body;

    // STEP 1: Validate input
    if (!name || typeof name !== 'string' || name.length < 1 || name.length > 100) {
      return NextResponse.json(
        { success: false, error: "Name is required and must be between 1 and 100 characters" },
        { status: 400 }
      );
    }

    // STEP 2: Determine next order_position for this tenant
    const { data: lastKanban, error: orderError } = await supabase
      .from("kanbans")
      .select("order_position")
      .eq("tenant_id", tenantId)
      .order("order_position", { ascending: false })
      .limit(1)
      .single();

    let nextOrder = 1;
    if (!orderError && lastKanban) {
      nextOrder = lastKanban.order_position + 1;
    }

    // STEP 3: Create Kanban with Columns (Atomic helper)
    const kanbanId = await createKanbanWithColumns(
      supabase,
      tenantId,
      name,
      false, // is_main is always false for manual creation
      nextOrder
    );

    // STEP 4: Return success
    const { data: newKanban } = await supabase
      .from("kanbans")
      .select("*")
      .eq("id", kanbanId)
      .single();

    return NextResponse.json({
      success: true,
      data: newKanban
    });

  } catch (error) {
    console.error("[API_KANBANS_CREATE] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create kanban. Please try again." },
      { status: 500 }
    );
  }
}
